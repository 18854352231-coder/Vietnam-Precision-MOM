export type SawingProductionStatus = '生产中' | '已完成'

export interface SawingProductionRecord {
  scheduleNo: string
  orderNo: string
  productName: string
  planDate: string
  alloy: string
  moldNo: string
  extrusionBatchNo: string
  machineNo: string
  fixedLength: number
  planQty: number
  actualQty: number
  framedQty: number
  frameCount: number
  completedFrameCount: number
  sampleCount: number
  scrapQty: number
  startTime: string
  endTime: string
  status: SawingProductionStatus
  remark: string
  updatedAt: string
}

const SAWING_PRODUCTION_RECORDS_KEY = 'mom_sawing_production_records'

const canUseStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'

export const loadSawingProductionRecords = (): SawingProductionRecord[] => {
  if (!canUseStorage()) return []

  try {
    const parsed = JSON.parse(window.localStorage.getItem(SAWING_PRODUCTION_RECORDS_KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export const upsertSawingProductionRecord = (record: SawingProductionRecord) => {
  if (!canUseStorage() || !record.scheduleNo) return

  const records = loadSawingProductionRecords()
  const index = records.findIndex(item => item.scheduleNo === record.scheduleNo)
  if (index >= 0) records[index] = record
  else records.unshift(record)
  window.localStorage.setItem(SAWING_PRODUCTION_RECORDS_KEY, JSON.stringify(records))
}
