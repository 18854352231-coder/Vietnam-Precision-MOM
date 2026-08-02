import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export type IPQCProcess = '挤压' | '时效' | '裁切上料' | '裁切' | '预包装'
export type IPQCTaskStatus = '待检验' | '检验中' | '待班长审核' | 'NG待处置' | '已放行' | '已关闭'
export type QualityStatus = '未判定' | '待审核' | '冻结' | '已放行'
export type ReviewStatus = '未提交' | '待审核' | '已通过' | '已驳回'
export type RuleType = 'numeric' | 'option'

export interface IPQCRule {
  id: string
  item: string
  type: RuleType
  standard: number
  tolerance: number
  standardText?: string
  unit: string
  required: boolean
  critical: boolean
}

export interface IPQCPlan {
  id: string
  productNo: string
  productName: string
  process: IPQCProcess
  version: string
  status: '草稿' | '已生效'
  effectiveFrom: string
  sampleType: string
  frequency: string
  updatedAt: string
  rules: IPQCRule[]
}

export interface IPQCItem extends IPQCRule {
  actualValue: number | string | null
  result: '' | 'OK' | 'NG'
}

export interface IPQCTask {
  id: string
  taskNo: string
  triggerType: string
  process: IPQCProcess
  priority: '普通' | '紧急'
  scheduleNo: string
  batchNo: string
  frameNo: string
  productNo: string
  productName: string
  moldNo: string
  lineName: string
  dueTime: string
  status: IPQCTaskStatus
  qualityStatus: QualityStatus
  planId: string
  planVersion: string
  inspector: string
  inspectTime: string
  result: '' | 'OK' | 'NG'
  remark: string
  reviewStatus: ReviewStatus
  reviewer: string
  reviewTime: string
  reviewOpinion: string
  items: IPQCItem[]
}

export interface IPQCException {
  id: string
  exceptionNo: string
  taskId: string
  taskNo: string
  process: IPQCProcess
  batchNo: string
  frameNo: string
  productNo: string
  defectItems: string
  status: '待处置' | '已关闭'
  disposition: string
  responsible: string
  remark: string
  createdAt: string
  closedAt: string
}

const STORAGE_KEY = 'mom_ipqc_center_v1'

const nowText = () => new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')

const createRule = (
  id: string,
  item: string,
  standard: number,
  tolerance: number,
  unit: string,
  critical = false,
  type: RuleType = 'numeric',
  standardText = ''
): IPQCRule => ({ id, item, type, standard, tolerance, standardText, unit, required: true, critical })

const seedPlans: IPQCPlan[] = [
  { id: 'PLAN-FC63-EXT', productNo: 'P-1001', productName: 'FC63', process: '挤压', version: 'V1.0', status: '已生效', effectiveFrom: '2026-07-01', sampleType: '首件+巡检', frequency: '开工首件/每2小时', updatedAt: '2026-07-30 10:30:00', rules: [createRule('EXT-LEN', '长度', 6000, 5, 'mm', true), createRule('EXT-WALL', '壁厚', 2.5, 0.2, 'mm', true)] },
  { id: 'PLAN-FC63-AGE', productNo: 'P-1001', productName: 'FC63', process: '时效', version: 'V1.0', status: '已生效', effectiveFrom: '2026-07-01', sampleType: '出炉检', frequency: '每炉', updatedAt: '2026-07-30 10:30:00', rules: [createRule('AGE-HARD', '硬度', 12, 2, 'HW', true)] },
  { id: 'PLAN-FC113-CUTFEED', productNo: 'P-1130', productName: 'FC113', process: '裁切上料', version: 'V1.0', status: '已生效', effectiveFrom: '2026-07-01', sampleType: '上料确认', frequency: '每框', updatedAt: '2026-07-30 11:00:00', rules: [createRule('FEED-APPEAR', '来料外观', 0, 0, '-', true, 'option', 'OK')] },
  { id: 'PLAN-FC113-CUT', productNo: 'P-1130', productName: 'FC113', process: '裁切', version: 'V1.0', status: '已生效', effectiveFrom: '2026-07-01', sampleType: '首件+巡检', frequency: '首件/每500片', updatedAt: '2026-07-30 11:00:00', rules: [createRule('CUT-LEN', '裁切长度', 130, 0.5, 'mm', true), createRule('CUT-BURR', '毛刺', 0, 0, '-', true, 'option', 'OK')] },
  { id: 'PLAN-FC113-PACK', productNo: 'P-1130', productName: 'FC113', process: '预包装', version: 'V1.0', status: '已生效', effectiveFrom: '2026-07-01', sampleType: '包装放行', frequency: '每栈板', updatedAt: '2026-07-30 11:00:00', rules: [createRule('PACK-APPEAR', '外观', 0, 0, '-', true, 'option', 'OK'), createRule('PACK-CODE', '二维码可读性', 0, 0, '-', true, 'option', 'OK')] }
]

const seedTasks: IPQCTask[] = [
  { id: 'TASK-001', taskNo: 'IPQC-20260731-001', triggerType: '开工首件', process: '挤压', priority: '紧急', scheduleNo: 'JY-20260731-001', batchNo: 'JY2607310001', frameNo: '-', productNo: 'P-1001', productName: 'FC63', moldNo: 'M18-001', lineName: 'JY-29', dueTime: '2026-07-31 09:00:00', status: '待检验', qualityStatus: '未判定', planId: 'PLAN-FC63-EXT', planVersion: 'V1.0', inspector: '', inspectTime: '', result: '', remark: '', reviewStatus: '未提交', reviewer: '', reviewTime: '', reviewOpinion: '', items: [] },
  { id: 'TASK-002', taskNo: 'IPQC-20260731-002', triggerType: '出炉检', process: '时效', priority: '普通', scheduleNo: 'JY-20260731-001', batchNo: 'SX2607310001', frameNo: 'CV-A-A-L6000*W1250*H650*0248', productNo: 'P-1001', productName: 'FC63', moldNo: 'M18-001', lineName: '2号时效炉', dueTime: '2026-07-31 11:30:00', status: '待检验', qualityStatus: '未判定', planId: 'PLAN-FC63-AGE', planVersion: 'V1.0', inspector: '', inspectTime: '', result: '', remark: '', reviewStatus: '未提交', reviewer: '', reviewTime: '', reviewOpinion: '', items: [] },
  { id: 'TASK-003', taskNo: 'IPQC-20260731-003', triggerType: '上料确认', process: '裁切上料', priority: '普通', scheduleNo: 'CQ-20260731-001', batchNo: 'JY2603070002', frameNo: 'CV-A-A-L6000*W1250*H650*0199', productNo: 'P-1130', productName: 'FC113', moldNo: '999#', lineName: '1号锯', dueTime: '2026-07-31 13:00:00', status: '待检验', qualityStatus: '未判定', planId: 'PLAN-FC113-CUTFEED', planVersion: 'V1.0', inspector: '', inspectTime: '', result: '', remark: '', reviewStatus: '未提交', reviewer: '', reviewTime: '', reviewOpinion: '', items: [] },
  { id: 'TASK-004', taskNo: 'IPQC-20260730-006', triggerType: '包装放行', process: '预包装', priority: '普通', scheduleNo: 'CQ-20260730-003', batchNo: 'JY2607300003', frameNo: '20260730-01', productNo: 'P-1130', productName: 'FC113', moldNo: '999#', lineName: '包装工作台', dueTime: '2026-07-30 17:00:00', status: '已放行', qualityStatus: '已放行', planId: 'PLAN-FC113-PACK', planVersion: 'V1.0', inspector: 'IPQC-A01', inspectTime: '2026-07-30 16:40:00', result: 'OK', remark: '', reviewStatus: '已通过', reviewer: '班长-A01', reviewTime: '2026-07-30 16:45:00', reviewOpinion: '检验数据完整，同意放行', items: [
    { ...seedPlans[4].rules[0], actualValue: 'OK', result: 'OK' },
    { ...seedPlans[4].rules[1], actualValue: 'OK', result: 'OK' }
  ] }
]

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value))

const normalizeTask = (task: IPQCTask): IPQCTask => {
  const isFinalized = ['NG待处置', '已放行', '已关闭'].includes(task.status)
  return {
    ...task,
    qualityStatus: task.status === '待班长审核' ? '待审核' : task.qualityStatus,
    reviewStatus: task.reviewStatus || (task.status === '待班长审核' ? '待审核' : isFinalized ? '已通过' : '未提交'),
    reviewer: task.reviewer || '',
    reviewTime: task.reviewTime || '',
    reviewOpinion: task.reviewOpinion || ''
  }
}

const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed?.tasks) || !Array.isArray(parsed?.plans) || !Array.isArray(parsed?.exceptions)) return null
    return parsed
  } catch {
    return null
  }
}

export const useIPQCStore = defineStore('ipqc', () => {
  const stored = typeof window === 'undefined' ? null : loadState()
  const plans = ref<IPQCPlan[]>(stored?.plans || clone(seedPlans))
  const tasks = ref<IPQCTask[]>((stored?.tasks || clone(seedTasks)).map(normalizeTask))
  const exceptions = ref<IPQCException[]>(stored?.exceptions || [])

  const persist = () => {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ plans: plans.value, tasks: tasks.value, exceptions: exceptions.value }))
  }

  const pendingCount = computed(() => tasks.value.filter(item => ['待检验', '检验中'].includes(item.status)).length)
  const pendingReviewCount = computed(() => tasks.value.filter(item => item.status === '待班长审核').length)
  const urgentCount = computed(() => tasks.value.filter(item => ['待检验', '检验中'].includes(item.status) && item.priority === '紧急').length)
  const ngCount = computed(() => tasks.value.filter(item => item.status === 'NG待处置').length)
  const releasedCount = computed(() => tasks.value.filter(item => item.status === '已放行').length)

  const findPlan = (productNo: string, process: IPQCProcess) =>
    plans.value.find(item => item.productNo === productNo && item.process === process && item.status === '已生效')

  const startTask = (taskId: string) => {
    const task = tasks.value.find(item => item.id === taskId)
    if (!task) return null
    const plan = plans.value.find(item => item.id === task.planId) || findPlan(task.productNo, task.process)
    if (!plan) return null
    task.status = '检验中'
    task.planId = plan.id
    task.planVersion = plan.version
    if (!task.items.length) {
      task.items = plan.rules.map(rule => ({ ...clone(rule), actualValue: null, result: '' }))
    }
    persist()
    return task
  }

  const evaluateItem = (item: IPQCItem): '' | 'OK' | 'NG' => {
    if (item.actualValue === null || item.actualValue === '') return ''
    if (item.type === 'option') return String(item.actualValue) === String(item.standardText || 'OK') ? 'OK' : 'NG'
    const value = Number(item.actualValue)
    if (!Number.isFinite(value)) return 'NG'
    return value >= item.standard - item.tolerance && value <= item.standard + item.tolerance ? 'OK' : 'NG'
  }

  const submitTask = (taskId: string, remark: string) => {
    const task = tasks.value.find(item => item.id === taskId)
    if (!task) return { success: false, message: '检验任务不存在' }
    const missing = task.items.some(item => item.required && (item.actualValue === null || item.actualValue === ''))
    if (missing) return { success: false, message: '所有必检项目完成后才能提交' }

    task.items.forEach(item => { item.result = evaluateItem(item) })
    const hasNg = task.items.some(item => item.result === 'NG')
    task.result = hasNg ? 'NG' : 'OK'
    task.remark = remark
    task.inspector = '当前IPQC'
    task.inspectTime = nowText()
    task.status = '待班长审核'
    task.qualityStatus = '待审核'
    task.reviewStatus = '待审核'
    task.reviewer = ''
    task.reviewTime = ''
    task.reviewOpinion = ''
    persist()
    return { success: true, message: `检验结果为${task.result}，已提交班长审核`, result: task.result }
  }

  const reviewTask = (taskId: string, approved: boolean, opinion: string) => {
    const task = tasks.value.find(item => item.id === taskId)
    if (!task || task.status !== '待班长审核') return { success: false, message: '当前任务不在待班长审核状态' }
    if (!task.result || !task.items.length) return { success: false, message: '检验结果或检验明细不完整，不能审核' }
    if (!opinion.trim()) return { success: false, message: '请填写审核意见' }

    task.reviewer = '当前班长'
    task.reviewTime = nowText()
    task.reviewOpinion = opinion.trim()

    if (!approved) {
      task.status = '待检验'
      task.qualityStatus = '未判定'
      task.reviewStatus = '已驳回'
      persist()
      return { success: true, message: '已驳回，任务已退回IPQC重新检验', result: 'rejected' as const }
    }

    task.reviewStatus = '已通过'
    if (task.result === 'NG') {
      task.status = 'NG待处置'
      task.qualityStatus = '冻结'
      if (!exceptions.value.some(item => item.taskId === task.id && item.status === '待处置')) {
        exceptions.value.unshift({
          id: `EX-${Date.now()}`,
          exceptionNo: `NCR-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(exceptions.value.length + 1).padStart(3, '0')}`,
          taskId: task.id,
          taskNo: task.taskNo,
          process: task.process,
          batchNo: task.batchNo,
          frameNo: task.frameNo,
          productNo: task.productNo,
          defectItems: task.items.filter(item => item.result === 'NG').map(item => item.item).join('、'),
          status: '待处置',
          disposition: '',
          responsible: '',
          remark: '',
          createdAt: nowText(),
          closedAt: ''
        })
      }
    } else {
      task.status = '已放行'
      task.qualityStatus = '已放行'
    }
    persist()
    return {
      success: true,
      message: task.result === 'NG' ? '审核通过，相关批次已冻结并生成异常单' : '审核通过，当前对象已质量放行',
      result: 'approved' as const
    }
  }

  const savePlan = (plan: IPQCPlan) => {
    const index = plans.value.findIndex(item => item.id === plan.id)
    const next = { ...clone(plan), updatedAt: nowText() }
    if (next.status === '已生效') {
      plans.value.forEach(item => {
        if (
          item.id !== next.id &&
          item.productNo === next.productNo &&
          item.process === next.process &&
          item.status === '已生效'
        ) {
          item.status = '草稿'
          item.updatedAt = next.updatedAt
        }
      })
    }
    if (index >= 0) plans.value[index] = next
    else plans.value.unshift(next)
    persist()
  }

  const resolveException = (exceptionId: string, disposition: string, responsible: string, remark: string) => {
    const record = exceptions.value.find(item => item.id === exceptionId)
    if (!record) return false
    const task = tasks.value.find(item => item.id === record.taskId)
    record.disposition = disposition
    record.responsible = responsible
    record.remark = remark
    record.status = '已关闭'
    record.closedAt = nowText()

    if (task) {
      if (['复检通过', '让步放行'].includes(disposition)) {
        task.status = '已放行'
        task.qualityStatus = '已放行'
      } else if (disposition === '返工后复检') {
        task.status = '待检验'
        task.qualityStatus = '冻结'
        task.result = ''
        task.triggerType = '返工复检'
        task.items = []
      } else {
        task.status = '已关闭'
        task.qualityStatus = '冻结'
      }
    }
    persist()
    return true
  }

  return {
    plans,
    tasks,
    exceptions,
    pendingCount,
    pendingReviewCount,
    urgentCount,
    ngCount,
    releasedCount,
    findPlan,
    startTask,
    evaluateItem,
    submitTask,
    reviewTask,
    savePlan,
    resolveException
  }
})
