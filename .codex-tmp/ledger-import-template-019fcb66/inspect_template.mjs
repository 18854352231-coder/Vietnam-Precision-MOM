import fs from 'node:fs/promises'
import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool'

const sourcePath = 'D:/新建文件夹/量检具台账模版.xlsx'
const previewDir = 'D:/越南MOM/MOM/.codex-tmp/ledger-import-template-019fcb66/previews'

const input = await FileBlob.load(sourcePath)
const workbook = await SpreadsheetFile.importXlsx(input)

const summary = await workbook.inspect({
  kind: 'workbook,sheet,table,region,computedStyle',
  maxChars: 12000,
  tableMaxRows: 20,
  tableMaxCols: 40,
  tableMaxCellChars: 120
})

console.log('INSPECT_START')
console.log(summary.ndjson)
console.log('INSPECT_END')

const sheets = (await workbook.inspect({ kind: 'sheet', include: 'id,name' })).ndjson
  .split(/\r?\n/)
  .filter(Boolean)
  .map(line => JSON.parse(line))
await fs.mkdir(previewDir, { recursive: true })

for (const [index, sheetInfo] of sheets.entries()) {
  const sheetName = sheetInfo.name
  const preview = await workbook.render({
    sheetName,
    autoCrop: 'all',
    scale: 1.5,
    format: 'png'
  })
  const previewPath = `${previewDir}/${String(index + 1).padStart(2, '0')}-${sheetName}.png`
  await fs.writeFile(previewPath, new Uint8Array(await preview.arrayBuffer()))
  console.log(`PREVIEW=${previewPath}`)
}

const errors = await workbook.inspect({
  kind: 'match',
  searchTerm: '#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A',
  options: { useRegex: true, maxResults: 100 },
  summary: 'formula error scan'
})
console.log('ERROR_SCAN_START')
console.log(errors.ndjson)
console.log('ERROR_SCAN_END')
