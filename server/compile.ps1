# --- Configuration ---
$TargetBinaryName = "backend-x86_64-pc-windows-msvc"
$TauriBinDir = "../client/src-tauri/binaries/"
$DistDir = "./dist"

# 1. Run PyInstaller
Write-Host "Starting PyInstaller build..." -ForegroundColor Cyan
pyinstaller --clean --onefile --name $TargetBinaryName ipc.py

# Check if build was successful
if ($LASTEXITCODE -ne 0) {
    Write-Error "PyInstaller build failed. Aborting script."
    exit $LASTEXITCODE
}

# 2. Delete old binaries in Tauri directory
Write-Host "Cleaning up old binaries in $TauriBinDir..." -ForegroundColor Yellow
if (Test-Path "$TauriBinDir/backend*") {
    Remove-Item -Path "$TauriBinDir/backend*" -Force -Verbose
}

# 3. Ensure destination directory exists (if not already there)
if (!(Test-Path $TauriBinDir)) {
    New-Item -ItemType Directory -Path $TauriBinDir
}

# 4. Move new binary from dist to Tauri binaries folder
Write-Host "Moving new binary to Tauri directory..." -ForegroundColor Green
$NewBinary = Get-ChildItem -Path "$DistDir/backend*"

if ($NewBinary) {
    Move-Item -Path $NewBinary.FullName -Destination $TauriBinDir -Force
    Write-Host "Successfully moved $($NewBinary.Name) to $TauriBinDir" -BackgroundColor DarkGreen
} else {
    Write-Warning "Could not find the generated binary in $DistDir"
}