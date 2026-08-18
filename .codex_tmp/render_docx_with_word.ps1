param(
  [Parameter(Mandatory = $true)]
  [string]$InputPath
)

$ErrorActionPreference = 'Stop'
$inputDocx = (Resolve-Path -LiteralPath $InputPath).Path
$outputDir = Join-Path (Resolve-Path -LiteralPath '.codex_tmp').Path 'render_extrusion_requirements_word'
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
$outputPdf = Join-Path $outputDir 'extrusion_requirements.pdf'

$word = $null
$document = $null
try {
  $word = New-Object -ComObject Word.Application
  $word.Visible = $false
  $word.DisplayAlerts = 0
  $document = $word.Documents.Open($inputDocx, $false, $true)
  $document.ExportAsFixedFormat($outputPdf, 17)
  Write-Output $outputPdf
}
finally {
  if ($document) { $document.Close($false) }
  if ($word) { $word.Quit() }
}
