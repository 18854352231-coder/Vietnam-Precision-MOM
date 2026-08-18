import * as XLSX from 'xlsx'

export type ReportCellValue = string | number | boolean | null

export interface ReportExportSheet {
  name: string
  rows: Array<Record<string, ReportCellValue>>
  columnWidths?: number[]
}

const normalizeFileName = (fileName: string) =>
  fileName.replace(/[\\/:*?"<>|]/g, '-').replace(/\.xlsx$/i, '')

export const exportReportWorkbook = (fileName: string, sheets: ReportExportSheet[]) => {
  const workbook = XLSX.utils.book_new()

  sheets.forEach((sheet) => {
    const worksheet = XLSX.utils.json_to_sheet(sheet.rows)
    if (sheet.columnWidths?.length) {
      worksheet['!cols'] = sheet.columnWidths.map(width => ({ wch: width }))
    }
    XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name.slice(0, 31))
  })

  XLSX.writeFile(workbook, `${normalizeFileName(fileName)}.xlsx`, { compression: true })
}
