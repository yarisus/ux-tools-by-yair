param(
  [string]$TargetPath,
  [string]$OutputDir,
  [switch]$OpenReport,
  [switch]$VerboseOutput
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = (Resolve-Path (Join-Path $scriptDir "..\..")).Path

if (-not $TargetPath -or [string]::IsNullOrWhiteSpace($TargetPath)) {
  $TargetPath = Join-Path $repoRoot "expense-webapp"
}

if (-not $OutputDir -or [string]::IsNullOrWhiteSpace($OutputDir)) {
  $OutputDir = Join-Path $scriptDir "reports"
}

if (-not (Test-Path -Path $TargetPath)) {
  throw "No existe la ruta objetivo: $TargetPath"
}

if (-not (Get-Command codex -ErrorAction SilentlyContinue)) {
  throw "No encontre 'codex' en PATH. Instala Codex CLI o agrega el comando al PATH."
}

$promptFile = Join-Path $scriptDir "ux-writing-prompt.md"
if (-not (Test-Path -Path $promptFile)) {
  throw "No encontre el prompt base: $promptFile"
}

if (-not (Test-Path -Path $OutputDir)) {
  New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$reportPath = Join-Path $OutputDir "ux-writing-report-$timestamp.md"

$basePrompt = Get-Content -Path $promptFile -Raw
$runtimePrompt = @"
$basePrompt

Tarea:
- Analiza el proyecto local en: $TargetPath
- Recorre archivos relevantes de interfaz y textos (HTML, JS, JSON, README, etc.).
- Entrega un reporte de UX Writing siguiendo el formato obligatorio.
- Incluye propuestas concretas listas para copiar/pegar.
"@

Write-Host "Ejecutando agente UX Writing..."
Write-Host "Objetivo: $TargetPath"
Write-Host "Salida:   $reportPath"

$previousErrorAction = $ErrorActionPreference
$ErrorActionPreference = "Continue"

if ($VerboseOutput) {
  $runtimePrompt | & codex exec --full-auto --skip-git-repo-check --cd "$TargetPath" -o "$reportPath" -
} else {
  $runtimePrompt | & codex exec --full-auto --skip-git-repo-check --cd "$TargetPath" -o "$reportPath" - 2>$null | Out-Null
}

$exitCode = $LASTEXITCODE
$ErrorActionPreference = $previousErrorAction

if ($exitCode -ne 0) {
  throw "Codex termino con error (exit $exitCode)."
}

Write-Host ""
Write-Host "Reporte generado:"
Write-Host $reportPath

if ($OpenReport) {
  Start-Process $reportPath | Out-Null
}
