const CUTTING_PACKAGING_QUEUE_KEY = 'mom_cutting_packaging_queue'

const canUseStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'

const readQueue = () => {
  if (!canUseStorage()) return []

  try {
    const raw = window.localStorage.getItem(CUTTING_PACKAGING_QUEUE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const saveQueue = (records: any[]) => {
  if (!canUseStorage()) return
  window.localStorage.setItem(CUTTING_PACKAGING_QUEUE_KEY, JSON.stringify(records))
}

const getFlowKey = (record: any) => String(record?.flowKey || record?.palletNo || record?.frameNo || '')

const buildPackagingRecord = (record: any) => {
  const branches = Array.isArray(record.branches) ? record.branches : []
  const fixedLength = Number(record.fixedLength || 0)
  const productNo = record.componentMaterialNo || record.customerMaterialNo || record.productNo || ''

  return {
    id: record.id || Date.now() + Math.random(),
    flowKey: `cutting:${record.frameNo}`,
    frameNo: record.frameNo || '',
    cuttingSourceFrameNo: record.sourceFrameNo || '',
    orderNo: record.scheduleNo || '',
    batchNo: record.extrusionBatch || '',
    customerCode: record.customerCode || '',
    customerName: record.customerName || '',
    productNo,
    productName: record.productName || '',
    length: fixedLength ? Number((fixedLength / 1000).toFixed(3)) : '',
    fixedLength,
    qty: Number(record.materialQty || 0),
    source: '裁切',
    status: '料框列表',
    furnaceNo: record.furnaceNo || '',
    moldNo: record.moldNo || '',
    extrusionMachine: record.extrusionMachine || '',
    alloy: record.alloy || '',
    shiftTeam: record.shiftTeam || '',
    scheduleType: record.scheduleType || '',
    productionType: record.productionType || '',
    finishTime: record.updateTime || '',
    isCoded: branches.length > 0,
    details: branches.map((branch: any, index: number) => ({
      id: branch.id || `${record.frameNo}-${index + 1}`,
      code: branch.laserCode || branch.code || '',
      productName: record.productName || '',
      productNo,
      length: fixedLength ? Number((fixedLength / 1000).toFixed(3)) : '',
      fixedLength,
      qty: Number(branch.qty || 1),
      status: '料框列表'
    }))
  }
}

export const upsertCuttingPackagingRecord = (record: any) => {
  const packagingRecord = buildPackagingRecord(record)
  if (!packagingRecord.frameNo || packagingRecord.qty <= 0) return readQueue()

  const queue = readQueue()
  const key = getFlowKey(packagingRecord)
  const index = queue.findIndex(item => getFlowKey(item) === key)
  if (index > -1) queue[index] = packagingRecord
  else queue.unshift(packagingRecord)
  saveQueue(queue)
  return queue
}

export const loadCuttingPackagingRecords = (defaultRecords: any[] = []) => {
  const queue = readQueue().filter(item => item?.status === '料框列表' && Number(item?.qty || 0) > 0)
  const queueKeys = new Set(queue.map(getFlowKey))
  return [...queue, ...defaultRecords.filter(item => !queueKeys.has(getFlowKey(item)))]
}

export const syncCuttingPackagingQueueRecord = (record: any) => {
  if (!record?.flowKey) return

  const queue = readQueue()
  const index = queue.findIndex(item => getFlowKey(item) === getFlowKey(record))
  if (index < 0) return

  if (Number(record.qty || 0) <= 0 || record.status !== '料框列表') {
    queue.splice(index, 1)
  } else {
    queue[index] = {
      ...queue[index],
      ...record,
      details: Array.isArray(record.details) ? record.details : []
    }
  }
  saveQueue(queue)
}
