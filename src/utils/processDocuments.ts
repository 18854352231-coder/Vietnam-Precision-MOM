export type ProcessDocType = 'SOP' | 'SIP' | 'POP' | 'DRAWING' | 'BOM'
export type ProcessCategory = 'extrusion' | 'casting'

export interface ProcessDocument {
  code: string
  productName: string
  fileName: string
  version: string
  status?: string
  uploadTime: string
  fileCategory: string
  validUntil?: string
  isHoldingFurnace?: boolean
  isAging?: boolean
  agingProgram?: string
  isCutting?: boolean
  type?: string
}

export const processDocTypes: ProcessDocType[] = ['SOP', 'SIP', 'POP', 'DRAWING', 'BOM']

export const processDocTypeLabels: Record<ProcessDocType, string> = {
  SOP: 'SOP (作业指导书)',
  SIP: 'SIP (检验标准书)',
  POP: 'POP (生产操作流程)',
  DRAWING: '工程图纸',
  BOM: 'BOM文件'
}

export function loadProcessDocuments(processType: ProcessCategory, docType: ProcessDocType): ProcessDocument[] {
  const prefix = processType === 'extrusion' ? 'EXT' : 'CAST'
  const typeStr = docType

  if (typeStr === 'DRAWING') {
    return [
      {
        code: `${prefix}-DRAWING-001`,
        productName: 'FC17',
        fileName: `${typeStr}工程图纸_${prefix}.pdf`,
        version: 'V1.0',
        status: '有效',
        uploadTime: '2026-04-01 10:00',
        fileCategory: '正式文件',
        type: typeStr
      }
    ]
  }

  if (typeStr === 'BOM') {
    return [
      {
        code: `${prefix}-BOM-001`,
        productName: 'FC111',
        fileName: `${typeStr}物料清单_${prefix}.pdf`,
        version: 'V1.0',
        status: '有效',
        uploadTime: '2026-04-01 10:00',
        fileCategory: '正式文件',
        type: typeStr
      }
    ]
  }

  return [
    {
      code: `${prefix}-${typeStr}-001`,
      productName: 'FC19',
      fileName: `${typeStr}指导书_${prefix}.pdf`,
      version: 'V1.0',
      status: '有效',
      uploadTime: '2026-04-01 10:00',
      fileCategory: '正式文件',
      isHoldingFurnace: false,
      isAging: true,
      agingProgram: 'T6 185℃×6h',
      isCutting: true,
      type: typeStr
    },
    {
      code: `${prefix}-${typeStr}-002`,
      productName: 'FC10',
      fileName: `临时测试${typeStr}_${prefix}.pdf`,
      version: 'V0.1',
      uploadTime: '2026-04-09 09:00',
      fileCategory: '临时文件',
      validUntil: '2026-05-09',
      isHoldingFurnace: false,
      isAging: false,
      agingProgram: '',
      isCutting: true,
      type: typeStr
    },
    {
      code: `${prefix}-${typeStr}-003`,
      productName: 'FC26',
      fileName: `进保温炉专用${typeStr}_${prefix}.pdf`,
      version: 'V1.0',
      status: '有效',
      uploadTime: '2026-05-06 08:30',
      fileCategory: '正式文件',
      isHoldingFurnace: true,
      isAging: true,
      agingProgram: 'T5 190℃×4h',
      isCutting: false,
      type: typeStr
    }
  ]
}

export function isTempExpired(row: ProcessDocument) {
  if (row.fileCategory !== '临时文件' || !row.validUntil) return false
  const today = new Date()
  const end = new Date(row.validUntil)
  end.setHours(23, 59, 59, 999)
  return end.getTime() < today.getTime()
}

export function getDisplayStatus(row: ProcessDocument) {
  if (row.fileCategory === '临时文件') {
    return isTempExpired(row) ? '已过期' : '正常'
  }
  return row.status || '有效'
}

export function getStatusType(row: ProcessDocument) {
  if (row.fileCategory === '临时文件') {
    return isTempExpired(row) ? 'danger' : 'success'
  }
  if (row.status === '有效') return 'success'
  return 'info'
}
