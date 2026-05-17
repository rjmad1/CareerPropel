# rename-to-career-propel.ps1
# Run from an elevated PowerShell prompt AFTER closing VS Code.
# Usage: .\scripts\rename-to-career-propel.ps1

$source = "C:\Users\rajaj\career-ops"
$target = "C:\Users\rajaj\career-propel"

Write-Host ""
Write-Host "=== CareerPropel Directory Rename ===" -ForegroundColor Cyan
Write-Host ""

# ── Guard 1: VS Code must not be running ─────────────────────────────────────
$vscode = Get-Process -Name "Code" -ErrorAction SilentlyContinue
if ($vscode) {
    Write-Host "ERROR: VS Code is still running. Close it fully and try again." -ForegroundColor Red
    Write-Host "       (File > Exit, then wait a moment for file locks to release)" -ForegroundColor Yellow
    exit 1
}
Write-Host "[OK] VS Code is not running." -ForegroundColor Green

# ── Guard 2: Source must exist ────────────────────────────────────────────────
if (-not (Test-Path $source)) {
    Write-Host "ERROR: Source directory not found: $source" -ForegroundColor Red
    Write-Host "       Has it already been renamed?" -ForegroundColor Yellow
    exit 1
}
Write-Host "[OK] Source directory found: $source" -ForegroundColor Green

# ── Guard 3: Target must NOT already exist ────────────────────────────────────
if (Test-Path $target) {
    Write-Host "ERROR: Target directory already exists: $target" -ForegroundColor Red
    Write-Host "       Remove or move it first, then re-run this script." -ForegroundColor Yellow
    exit 1
}
Write-Host "[OK] Target path is clear: $target" -ForegroundColor Green

# ── Confirm before acting ─────────────────────────────────────────────────────
Write-Host ""
Write-Host "About to rename:" -ForegroundColor White
Write-Host "  FROM: $source" -ForegroundColor DarkYellow
Write-Host "  TO:   $target" -ForegroundColor DarkYellow
Write-Host ""
$confirm = Read-Host "Proceed? (y/N)"
if ($confirm -notmatch '^[Yy]$') {
    Write-Host "Aborted. No changes made." -ForegroundColor Yellow
    exit 0
}

# ── Rename ────────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "Renaming directory..." -ForegroundColor Cyan
try {
    Rename-Item -Path $source -NewName "career-propel" -ErrorAction Stop
    Write-Host "[OK] Directory renamed successfully." -ForegroundColor Green
} catch {
    Write-Host "ERROR: Rename failed: $_" -ForegroundColor Red
    Write-Host "       A file inside may still be locked. Check Task Manager for lingering node/git processes." -ForegroundColor Yellow
    exit 1
}

# ── Verify ────────────────────────────────────────────────────────────────────
if (-not (Test-Path $target)) {
    Write-Host "ERROR: Rename appeared to succeed but target does not exist. Check manually." -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Verified: $target exists." -ForegroundColor Green

# ── Reopen VS Code ────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "Opening VS Code in the new location..." -ForegroundColor Cyan
$codeBin = (Get-Command code -ErrorAction SilentlyContinue)?.Source
if ($codeBin) {
    Start-Process $codeBin -ArgumentList "`"$target`""
    Write-Host "[OK] VS Code launched." -ForegroundColor Green
} else {
    Write-Host "[WARN] 'code' not found in PATH. Open VS Code manually and use File > Open Folder:" -ForegroundColor Yellow
    Write-Host "       $target" -ForegroundColor White
}

Write-Host ""
Write-Host "=== Done ===" -ForegroundColor Cyan
Write-Host "New working directory: $target" -ForegroundColor White
Write-Host "Git history, .env.local, and all project files are intact." -ForegroundColor White
Write-Host ""
Write-Host "Remaining follow-ups (no rush):" -ForegroundColor DarkGray
Write-Host "  1. Rename GitHub repo:  github.com > Settings > Rename to 'career-propel'" -ForegroundColor DarkGray
Write-Host "  2. Rename Vercel project to 'career-propel' and update env vars" -ForegroundColor DarkGray
Write-Host "  3. DB rename: ALTER DATABASE career_ops_dev RENAME TO career_propel_dev;" -ForegroundColor DarkGray
Write-Host "  4. Update package.json name from 'career-ops' to 'career-propel'" -ForegroundColor DarkGray
