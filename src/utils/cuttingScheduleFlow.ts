export type CuttingScheduleMaterialType = '产发物料' | '量产物料' | '重工物料'

export interface IssuedCuttingSchedule {
  scheduleNo: string
  scheduleType: CuttingScheduleMaterialType
  customerCode: string
  customerName: string
  furnaceNo: string
  extrusionBatchNo: string
  furnaceNos?: string[]
  extrusionBatchNos?: string[]
  moldNos?: string[]
  sourceFrames?: IssuedCuttingSourceFrame[]
  moldNo: string
  alloy: string
  productName: string
  componentMaterialNo: string
  customerMaterialNo: string
  customerProductName: string
  productionType: string
  planQty: number
  singleWeight: number
  fixedLength: string | number
  extrusionMachine: string
}

export interface IssuedCuttingSourceFrame {
  frameNo: string
  extrusionBatchNo: string
  location: string
  furnaceBatch: string
  qty: number
  agingInTime: string
  agingOutTime: string
  qcResult: string
}

const ISSUED_CUTTING_SCHEDULES_KEY = 'mom_issued_cutting_schedules'

const canUseStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'

export const loadIssuedCuttingSchedules = (): IssuedCuttingSchedule[] => {
  if (!canUseStorage()) return []

  try {
    const parsed = JSON.parse(window.localStorage.getItem(ISSUED_CUTTING_SCHEDULES_KEY) || '[]')
    if (!Array.isArray(parsed)) return []
    return parsed.map(item => ({
      ...item,
      extrusionBatchNos: Array.isArray(item.extrusionBatchNos)
        ? item.extrusionBatchNos
        : String(item.extrusionBatchNo || '').split('、').filter(Boolean),
      furnaceNos: Array.isArray(item.furnaceNos)
        ? item.furnaceNos
        : String(item.furnaceNo || '').split('、').filter(Boolean),
      moldNos: Array.isArray(item.moldNos)
        ? item.moldNos
        : String(item.moldNo || '').split('、').filter(Boolean),
      sourceFrames: Array.isArray(item.sourceFrames) ? item.sourceFrames : []
    }))
  } catch {
    return []
  }
}

export const upsertIssuedCuttingSchedule = (schedule: IssuedCuttingSchedule) => {
  if (!canUseStorage() || !schedule.scheduleNo || !schedule.scheduleType) return

  const schedules = loadIssuedCuttingSchedules()
  const index = schedules.findIndex(item => item.scheduleNo === schedule.scheduleNo)
  if (index >= 0) schedules[index] = schedule
  else schedules.unshift(schedule)
  window.localStorage.setItem(ISSUED_CUTTING_SCHEDULES_KEY, JSON.stringify(schedules))
}

export const removeIssuedCuttingSchedule = (scheduleNo: string) => {
  if (!canUseStorage() || !scheduleNo) return
  const schedules = loadIssuedCuttingSchedules().filter(item => item.scheduleNo !== scheduleNo)
  window.localStorage.setItem(ISSUED_CUTTING_SCHEDULES_KEY, JSON.stringify(schedules))
}
