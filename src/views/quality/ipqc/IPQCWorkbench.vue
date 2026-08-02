<template>
  <div class="page-container">
    <el-card class="main-card">
      <template #header>
        <div class="card-header">
          <span class="header-title">{{ pageTitle }}</span>
          <el-button v-if="viewMode === 'workbench' || viewMode === 'tasks' || viewMode === 'reviews'" type="primary" icon="Refresh" @click="handleRefresh">
            刷新任务
          </el-button>
        </div>
      </template>

      <template v-if="viewMode !== 'exceptions'">
        <el-form :inline="true" class="filter-bar">
          <el-form-item label="工序">
            <el-select v-model="queryForm.process" placeholder="全部工序" clearable style="width: 150px">
              <el-option v-for="item in processOptions" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="viewMode !== 'workbench'" label="状态">
            <el-select v-model="queryForm.status" placeholder="全部状态" clearable style="width: 150px">
              <el-option v-for="item in statusOptions" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="viewMode === 'tasks'" label="优先级">
            <el-select v-model="queryForm.priority" placeholder="全部" clearable style="width: 120px">
              <el-option label="紧急" value="紧急" />
              <el-option label="普通" value="普通" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="viewMode === 'tasks' || viewMode === 'records' || viewMode === 'reviews'" label="检验员">
            <el-input v-model="queryForm.inspector" placeholder="检验员工号" clearable style="width: 150px" />
          </el-form-item>
          <el-form-item label="编号">
            <el-input v-model="queryForm.keyword" placeholder="任务号/批次号/料框号" clearable style="width: 220px" @keyup.enter="handleSearch" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="resetFilters">重置</el-button>
          </el-form-item>
        </el-form>

        <el-table :data="visibleTasks" border stripe height="calc(100vh - 265px)">
          <el-table-column prop="taskNo" label="检验任务号" min-width="170" show-overflow-tooltip />
          <el-table-column prop="triggerType" label="任务类型" width="100" align="center" />
          <el-table-column prop="process" label="工序" width="100" align="center" />
          <el-table-column prop="batchNo" label="批次号" min-width="145" show-overflow-tooltip />
          <el-table-column prop="frameNo" label="料框/栈板号" min-width="180" show-overflow-tooltip />
          <el-table-column prop="productName" label="产品" width="100" align="center" />
          <el-table-column prop="lineName" label="线体/设备" min-width="120" show-overflow-tooltip />
          <el-table-column prop="dueTime" label="应检时间" width="165" align="center" />
          <el-table-column prop="priority" label="优先级" width="80" align="center">
            <template #default="{ row }">
              <el-tag :type="row.priority === '紧急' ? 'danger' : 'info'" effect="plain">{{ row.priority }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="任务状态" width="105" align="center">
            <template #default="{ row }">
              <el-tag :type="taskStatusType(row.status)">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="qualityStatus" label="质量状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="qualityStatusType(row.qualityStatus)" effect="plain">{{ row.qualityStatus }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column v-if="viewMode !== 'workbench'" prop="inspector" label="检验员" width="115" align="center">
            <template #default="{ row }">{{ row.inspector || '-' }}</template>
          </el-table-column>
          <el-table-column v-if="viewMode !== 'workbench'" prop="inspectTime" label="完成时间" width="165" align="center">
            <template #default="{ row }">{{ row.inspectTime || '-' }}</template>
          </el-table-column>
          <el-table-column v-if="viewMode === 'records'" prop="reviewer" label="审核班长" width="115" align="center">
            <template #default="{ row }">{{ row.reviewer || '-' }}</template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right" align="center">
            <template #default="{ row }">
              <el-button v-if="viewMode === 'workbench'" link type="primary" @click="openInspection(row)">
                {{ row.status === '待检验' ? '开始检验' : '继续检验' }}
              </el-button>
              <el-button v-else-if="viewMode === 'reviews'" link type="warning" @click="openReview(row)">班长审核</el-button>
              <el-button v-else link type="primary" @click="openInspection(row, true)">查看详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>

      <template v-else>
        <el-table :data="store.exceptions" border stripe height="calc(100vh - 240px)">
          <el-table-column prop="exceptionNo" label="异常单号" min-width="175" />
          <el-table-column prop="taskNo" label="检验任务号" min-width="175" />
          <el-table-column prop="process" label="工序" width="100" align="center" />
          <el-table-column prop="batchNo" label="批次号" min-width="140" />
          <el-table-column prop="frameNo" label="料框/栈板号" min-width="170" show-overflow-tooltip />
          <el-table-column prop="defectItems" label="NG项目" min-width="150" show-overflow-tooltip />
          <el-table-column prop="createdAt" label="创建时间" width="165" />
          <el-table-column prop="status" label="状态" width="90" align="center">
            <template #default="{ row }"><el-tag :type="row.status === '待处置' ? 'danger' : 'success'">{{ row.status }}</el-tag></template>
          </el-table-column>
          <el-table-column prop="disposition" label="处置结果" min-width="120" />
          <el-table-column label="操作" width="100" fixed="right" align="center">
            <template #default="{ row }">
              <el-button v-if="row.status === '待处置'" link type="danger" @click="openDisposition(row)">处置</el-button>
              <el-button v-else link type="primary" @click="openDisposition(row, true)">查看</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </el-card>

    <el-dialog v-model="inspectionVisible" :title="inspectionDialogTitle" width="82%" top="4vh" destroy-on-close>
      <template v-if="editingTask">
        <el-descriptions :column="4" border class="task-context">
          <el-descriptions-item label="任务号">{{ editingTask.taskNo }}</el-descriptions-item>
          <el-descriptions-item label="任务类型">{{ editingTask.triggerType }}</el-descriptions-item>
          <el-descriptions-item label="工序">{{ editingTask.process }}</el-descriptions-item>
          <el-descriptions-item label="方案版本">{{ editingTask.planVersion }}</el-descriptions-item>
          <el-descriptions-item label="排程编号">{{ editingTask.scheduleNo }}</el-descriptions-item>
          <el-descriptions-item label="批次号">{{ editingTask.batchNo }}</el-descriptions-item>
          <el-descriptions-item label="料框/栈板号">{{ editingTask.frameNo }}</el-descriptions-item>
          <el-descriptions-item label="线体/设备">{{ editingTask.lineName }}</el-descriptions-item>
          <el-descriptions-item label="产品/物料">{{ editingTask.productName }} / {{ editingTask.productNo }}</el-descriptions-item>
          <el-descriptions-item label="模具编号">{{ editingTask.moldNo || '-' }}</el-descriptions-item>
          <el-descriptions-item label="质量状态">
            <el-tag :type="qualityStatusType(editingTask.qualityStatus)">{{ editingTask.qualityStatus }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="检验人">{{ editingTask.inspector || '当前IPQC' }}</el-descriptions-item>
          <el-descriptions-item v-if="showReviewTrace" label="审核状态">
            <el-tag :type="reviewStatusType(editingTask.reviewStatus)" effect="plain">{{ editingTask.reviewStatus }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item v-if="showReviewTrace" label="审核班长">{{ editingTask.reviewer || '-' }}</el-descriptions-item>
          <el-descriptions-item v-if="showReviewTrace" label="审核时间">{{ editingTask.reviewTime || '-' }}</el-descriptions-item>
          <el-descriptions-item v-if="showReviewTrace" label="审核意见">{{ editingTask.reviewOpinion || '-' }}</el-descriptions-item>
        </el-descriptions>

        <div class="section-title">检验项目</div>
        <el-table :data="editingTask.items" border>
          <el-table-column prop="item" label="检验项目" min-width="150">
            <template #default="{ row }">
              <span>{{ row.item }}</span>
              <el-tag v-if="row.critical" type="danger" size="small" effect="plain" class="critical-tag">关键</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="规格" min-width="170" align="center">
            <template #default="{ row }">
              <span v-if="row.type === 'numeric'">{{ row.standard - row.tolerance }} ～ {{ row.standard + row.tolerance }} {{ row.unit }}</span>
              <span v-else>要求：{{ row.standardText }}</span>
            </template>
          </el-table-column>
          <el-table-column label="实测值" min-width="190" align="center">
            <template #default="{ row }">
              <el-input-number v-if="row.type === 'numeric'" v-model="row.actualValue" :controls="false" :disabled="inspectionReadonly" style="width: 150px" />
              <el-select v-else v-model="row.actualValue" :disabled="inspectionReadonly" placeholder="请选择" style="width: 150px">
                <el-option label="OK" value="OK" />
                <el-option label="NG" value="NG" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="单项判定" width="110" align="center">
            <template #default="{ row }">
              <el-tag v-if="itemResult(row)" :type="itemResult(row) === 'OK' ? 'success' : 'danger'">{{ itemResult(row) }}</el-tag>
              <span v-else class="pending-text">未录入</span>
            </template>
          </el-table-column>
        </el-table>

        <el-form label-width="90px" class="remark-form">
          <el-form-item label="检验备注">
            <el-input v-model="editingTask.remark" type="textarea" :rows="3" :disabled="inspectionReadonly" placeholder="记录异常位置、测量条件或补充说明" />
          </el-form-item>
        </el-form>

        <div class="result-bar" :class="overallResultClass">
          <span>综合判定</span>
          <strong>{{ overallResult }}</strong>
        </div>

        <el-form v-if="reviewing" label-width="90px" class="review-form">
          <el-form-item label="审核意见" required>
            <el-input v-model="reviewForm.opinion" type="textarea" :rows="3" placeholder="请输入审核意见" />
          </el-form-item>
        </el-form>
      </template>
      <template #footer>
        <el-button @click="inspectionVisible = false">关闭</el-button>
        <el-button v-if="reviewing" @click="submitReview(false)">退回重检</el-button>
        <el-button v-if="reviewing" type="primary" @click="submitReview(true)">通过</el-button>
        <el-button v-if="!inspectionReadonly" type="primary" @click="submitInspection">提交检验</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="dispositionVisible" :title="dispositionReadonly ? '异常处置详情' : '质量异常处置'" width="620px">
      <el-descriptions v-if="currentException" :column="2" border class="exception-context">
        <el-descriptions-item label="异常单号">{{ currentException.exceptionNo }}</el-descriptions-item>
        <el-descriptions-item label="工序">{{ currentException.process }}</el-descriptions-item>
        <el-descriptions-item label="批次号">{{ currentException.batchNo }}</el-descriptions-item>
        <el-descriptions-item label="NG项目">{{ currentException.defectItems }}</el-descriptions-item>
      </el-descriptions>
      <el-form :model="dispositionForm" label-width="100px">
        <el-form-item label="处置方式" required>
          <el-select v-model="dispositionForm.disposition" :disabled="dispositionReadonly" style="width: 100%">
            <el-option v-for="item in dispositionOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="责任人" required>
          <el-input v-model="dispositionForm.responsible" :disabled="dispositionReadonly" />
        </el-form-item>
        <el-form-item label="处置说明" required>
          <el-input v-model="dispositionForm.remark" type="textarea" :rows="3" :disabled="dispositionReadonly" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dispositionVisible = false">关闭</el-button>
        <el-button v-if="!dispositionReadonly" type="primary" @click="submitDisposition">确认处置</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useIPQCStore, type IPQCException, type IPQCItem, type IPQCProcess, type IPQCTask } from '@/store/ipqc'

const route = useRoute()
const store = useIPQCStore()

const viewMode = computed(() => String(route.meta.ipqcView || 'workbench'))
const processOptions: IPQCProcess[] = ['挤压', '时效', '裁切上料', '裁切', '预包装']
const statusOptions = ['待检验', '检验中', '待班长审核', 'NG待处置', '已放行', '已关闭']
const dispositionOptions = ['复检通过', '返工后复检', '让步放行', '报废']

const emptyFilters = () => ({ process: '', status: '', priority: '', inspector: '', keyword: '' })
const queryForm = ref(emptyFilters())
const filters = ref(emptyFilters())
const inspectionVisible = ref(false)
const inspectionReadonly = ref(false)
const reviewing = ref(false)
const editingTask = ref<IPQCTask | null>(null)
const reviewForm = ref({ opinion: '' })
const dispositionVisible = ref(false)
const dispositionReadonly = ref(false)
const currentException = ref<IPQCException | null>(null)
const dispositionForm = ref({ disposition: '', responsible: '', remark: '' })

const pageTitle = computed(() => ({
  workbench: 'IPQC工作台',
  tasks: '检验任务',
  reviews: '班长审核',
  records: '检验记录',
  exceptions: '质量异常'
}[viewMode.value] || 'IPQC工作台'))

const visibleTasks = computed(() => {
  let data = [...store.tasks]
  if (viewMode.value === 'records') data = data.filter(item => ['已放行', 'NG待处置', '已关闭'].includes(item.status))
  if (viewMode.value === 'reviews') data = data.filter(item => item.status === '待班长审核')
  if (viewMode.value === 'workbench') {
    data = data
      .filter(item => ['待检验', '检验中'].includes(item.status))
      .sort((a, b) => {
        if (a.priority !== b.priority) return a.priority === '紧急' ? -1 : 1
        return a.dueTime.localeCompare(b.dueTime)
      })
  }
  const keyword = filters.value.keyword.trim().toLowerCase()
  const inspector = filters.value.inspector.trim().toLowerCase()
  return data.filter(item => {
    if (filters.value.process && item.process !== filters.value.process) return false
    if (filters.value.status && item.status !== filters.value.status) return false
    if (filters.value.priority && item.priority !== filters.value.priority) return false
    if (inspector && !item.inspector.toLowerCase().includes(inspector)) return false
    if (keyword && ![item.taskNo, item.batchNo, item.frameNo].some(value => String(value).toLowerCase().includes(keyword))) return false
    return true
  })
})

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value))

const itemResult = (item: IPQCItem) => item.result || store.evaluateItem(item)

const overallResult = computed(() => {
  if (!editingTask.value?.items.length) return '未配置'
  const results = editingTask.value.items.map(itemResult)
  if (results.some(item => !item)) return '未完成'
  return results.some(item => item === 'NG') ? 'NG' : 'OK'
})

const overallResultClass = computed(() => ({ 'result-ok': overallResult.value === 'OK', 'result-ng': overallResult.value === 'NG' }))
const showReviewTrace = computed(() => !!editingTask.value && ['已通过', '已驳回'].includes(editingTask.value.reviewStatus))
const inspectionDialogTitle = computed(() => {
  if (reviewing.value) return '班长审核'
  if (!inspectionReadonly.value) return 'IPQC检验'
  return editingTask.value?.result ? '检验记录详情' : '检验任务详情'
})

const openInspection = (row: IPQCTask, readonly = false) => {
  reviewing.value = false
  inspectionReadonly.value = readonly
  const source = readonly ? row : store.startTask(row.id)
  if (!source) {
    ElMessage.warning('当前产品和工序没有已生效的检验方案')
    return
  }
  const task = clone(source)
  if (readonly && !task.items.length) {
    const plan = store.findPlan(task.productNo, task.process)
    task.items = plan?.rules.map(item => ({ ...clone(item), actualValue: null, result: '' as const })) || []
  }
  editingTask.value = task
  inspectionVisible.value = true
}

const openReview = (row: IPQCTask) => {
  reviewing.value = true
  inspectionReadonly.value = true
  editingTask.value = clone(row)
  reviewForm.value = { opinion: '' }
  inspectionVisible.value = true
}

const submitInspection = () => {
  if (!editingTask.value) return
  const source = store.tasks.find(item => item.id === editingTask.value?.id)
  if (!source) return
  source.items = clone(editingTask.value.items)
  const result = store.submitTask(source.id, editingTask.value.remark)
  if (!result.success) {
    ElMessage.warning(result.message)
    return
  }
  ElMessage[result.result === 'NG' ? 'warning' : 'success'](result.message)
  inspectionVisible.value = false
}

const submitReview = (approved: boolean) => {
  if (!editingTask.value) return
  const result = store.reviewTask(editingTask.value.id, approved, reviewForm.value.opinion)
  if (!result.success) {
    ElMessage.warning(result.message)
    return
  }
  ElMessage[approved ? 'success' : 'warning'](result.message)
  inspectionVisible.value = false
}

const openDisposition = (row: IPQCException, readonly = false) => {
  currentException.value = row
  dispositionReadonly.value = readonly
  dispositionForm.value = {
    disposition: row.disposition || '',
    responsible: row.responsible || '',
    remark: row.remark || ''
  }
  dispositionVisible.value = true
}

const submitDisposition = () => {
  if (!currentException.value) return
  if (!dispositionForm.value.disposition || !dispositionForm.value.responsible || !dispositionForm.value.remark) {
    ElMessage.warning('请完整填写处置方式、责任人和处置说明')
    return
  }
  store.resolveException(currentException.value.id, dispositionForm.value.disposition, dispositionForm.value.responsible, dispositionForm.value.remark)
  dispositionVisible.value = false
  ElMessage.success('异常处置完成，质量状态已同步更新')
}

const handleSearch = () => { filters.value = { ...queryForm.value } }
const resetFilters = () => {
  queryForm.value = emptyFilters()
  filters.value = emptyFilters()
}
const handleRefresh = () => ElMessage.success('任务状态已刷新')
const taskStatusType = (status: string) => status === '已放行' ? 'success' : status === 'NG待处置' ? 'danger' : ['检验中', '待班长审核'].includes(status) ? 'warning' : 'info'
const qualityStatusType = (status: string) => status === '已放行' ? 'success' : status === '冻结' ? 'danger' : status === '待审核' ? 'warning' : 'info'
const reviewStatusType = (status: string) => status === '已通过' ? 'success' : status === '已驳回' ? 'danger' : status === '待审核' ? 'warning' : 'info'

watch(viewMode, resetFilters)
</script>

<style scoped>
.page-container { padding: 16px; min-height: 100%; box-sizing: border-box; background: var(--bg-primary); }
.main-card { min-height: calc(100vh - 116px); }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.header-title { font-size: 18px; font-weight: 600; color: #303133; }
.filter-bar { padding: 4px 0 2px; border-bottom: 1px solid #ebeef5; margin-bottom: 12px; }
.task-context, .exception-context { margin-bottom: 18px; }
.section-title { margin: 18px 0 12px; padding-left: 10px; border-left: 3px solid #409eff; font-weight: 600; color: #303133; }
.critical-tag { margin-left: 8px; }
.pending-text { color: #909399; }
.remark-form { margin-top: 18px; }
.review-form { margin-top: 18px; }
.result-bar { display: flex; align-items: center; gap: 18px; padding: 10px 14px; border: 1px solid #dcdfe6; background: #f5f7fa; }
.result-bar strong { font-size: 18px; color: #909399; }.result-bar.result-ok strong { color: #67c23a; }.result-bar.result-ng strong { color: #f56c6c; }
</style>
