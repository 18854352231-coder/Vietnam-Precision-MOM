type MaterialTagSource = Record<string, unknown>

const pickFirst = (source: MaterialTagSource, keys: string[]) => {
  for (const key of keys) {
    const value = source[key]
    if (value !== undefined && value !== null && value !== '') {
      return value
    }
  }

  return ''
}

const toNumberLike = (value: unknown) => {
  if (typeof value === 'number') return value
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isNaN(parsed) ? value : parsed
  }

  return value
}

export const buildMaterialTagPreviewData = ({
  source,
  shiftTeam
}: {
  source: MaterialTagSource
  shiftTeam?: string
}) => {
  const scheduleType = String(pickFirst(source, ['scheduleType']) || '')
  const productionType = String(pickFirst(source, ['productionType']) || '')

  return {
    customerCode: String(pickFirst(source, ['customerCode']) || ''),
    customerName: String(pickFirst(source, ['customerName']) || ''),
    productName: String(pickFirst(source, ['productName', 'productNo']) || ''),
    extrusionBatch: String(pickFirst(source, ['extrusionBatch', 'extrusionBatchNo', 'batchNo']) || ''),
    furnaceNo: String(pickFirst(source, ['furnaceNo']) || ''),
    moldNo: String(pickFirst(source, ['moldNo']) || ''),
    materialQty: toNumberLike(pickFirst(source, ['materialQty', 'qty', 'quantity'])) || 0,
    frameNo: String(pickFirst(source, ['frameNo']) || ''),
    fixedLength: toNumberLike(pickFirst(source, ['fixedLength', 'length'])) || '',
    extrusionMachine: String(pickFirst(source, ['extrusionMachine']) || ''),
    shiftTeam: shiftTeam || String(pickFirst(source, ['shiftTeam']) || ''),
    alloy: String(pickFirst(source, ['alloy']) || ''),
    scheduleNo: String(pickFirst(source, ['scheduleNo']) || ''),
    scheduleType,
    productionType,
    isPD: scheduleType === '产发物料',
    isMassProduction: scheduleType === '量产物料',
    isHeavyIndustry: scheduleType === '重工物料'
  }
}
