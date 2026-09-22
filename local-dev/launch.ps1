# Launcher used by local-dev/lib.mjs (spawnDetached).
# Starts `cmd.exe /d /s /c <Command>` as a FULLY INDEPENDENT process (not a
# child of the caller), redirecting both streams into <LogFile>, and writes
# the real process id to <PidFile>. Exits immediately after launching.
param(
  [Parameter(Mandatory = $true)][string]$Name,
  [Parameter(Mandatory = $true)][string]$Command,
  [Parameter(Mandatory = $true)][string]$LogFile,
  [Parameter(Mandatory = $true)][string]$PidFile,
  [Parameter(Mandatory = $true)][string]$Cwd
)

$logDir = Split-Path -Parent $LogFile
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
New-Item -ItemType Directory -Force -Path (Split-Path -Parent $PidFile) | Out-Null

$cmdLine = "$Command > `"$LogFile`" 2>&1"
$p = Start-Process -FilePath "cmd.exe" `
  -ArgumentList @("/d", "/s", "/c", $cmdLine) `
  -WorkingDirectory $Cwd `
  -WindowStyle Hidden `
  -PassThru

Set-Content -Path $PidFile -Value $p.Id -NoNewline
Write-Output $p.Id