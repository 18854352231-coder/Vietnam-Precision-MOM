const PENDING_STORAGE_KEY = 'mom_extrusion_pending_storage_records'

const canUseStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'

const cloneRecords = (records: any[] = []) => records.map(item => ({ ...item }))

const getRecordKey = (record: any) => String(record?.palletNo || record?.id || '')

const readStoredRecords = () => {
  if (!canUseStorage()) return []

  try {
    const raw = window.localStorage.getItem(PENDING_STORAGE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export const savePendingStorageRecords = (records: any[]) => {
  if (!canUseStorage()) return
  window.localStorage.setItem(PENDING_STORAGE_KEY, JSON.stringify(records))
}

export const loadPendingStorageRecords = (defaultRecords: any[] = []) => {
  const merged = new Map<string, any>()

  cloneRecords(defaultRecords).forEach(record => {
    const key = getRecordKey(record)
    if (key) merged.set(key, record)
  })

  cloneRecords(readStoredRecords()).forEach(record => {
    const key = getRecordKey(record)
    if (key) merged.set(key, record)
  })

  return Array.from(merged.values())
}

export const upsertPendingStorageRecord = (record: any) => {
  const currentRecords = readStoredRecords()
  const key = getRecordKey(record)
  if (!key) return currentRecords

  const index = currentRecords.findIndex(item => getRecordKey(item) === key)
  const existingRecord = index > -1 ? currentRecords[index] : null

  const nextRecord = {
    ...existingRecord,
    ...record
  }

  if (existingRecord?.id != null) {
    nextRecord.id = existingRecord.id
  }
  if (existingRecord?.status && existingRecord.status !== '待称重') {
    nextRecord.status = existingRecord.status
  }
  if (typeof existingRecord?.netWeight === 'number' && existingRecord.netWeight > 0) {
    nextRecord.netWeight = existingRecord.netWeight
  }
  if (typeof existingRecord?.grossWeight === 'number' && existingRecord.grossWeight > 0) {
    nextRecord.grossWeight = existingRecord.grossWeight
  }
  if (typeof existingRecord?.tareWeight === 'number' && existingRecord.tareWeight > 0) {
    nextRecord.tareWeight = existingRecord.tareWeight
  }
  if (existingRecord?.location) {
    nextRecord.location = existingRecord.location
  }

  if (index > -1) {
    currentRecords[index] = nextRecord
  } else {
    currentRecords.unshift(nextRecord)
  }

  savePendingStorageRecords(currentRecords)
  return currentRecords
}

export const buildPendingStorageRecordFromPackaging = (row: any) => {
  const mfgDate = String(row.printTime || row.packTime || row.finishTime || '').slice(0, 10)

  return {
    id: Number(`${Date.now()}${Math.floor(Math.random() * 1000)}`),
    batchNo: row.batchNo || '',
    productNo: row.productNo || '',
    productName: row.productName || '',
    quantity: Number(row.qty || 0),
    sourceProcess: '包装',
    finishTime: row.printTime || row.packTime || row.finishTime || '',
    operator: row.shiftTeam || '',
    status: '待称重',
    customerCode: row.customerCode || '',
    customerName: row.customerName || '',
    customerMaterialName: row.customerName || '',
    customerMaterialCode: row.productNo || '',
    netWeight: 0,
    grossWeight: 0,
    tareWeight: 1.5,
    palletType: row.palletType || '',
    moldNo: row.moldNo || '',
    furnaceNo: row.furnaceNo || '',
    lotNo: row.batchNo || '',
    quality: row.quality || '',
    judger: row.judger || '',
    cuttingTeam: row.shiftTeam || '',
    palletNo: row.palletNo || '',
    mfgDate
  }
}
