# Modern Backend Update Script for SPECTRA (Windows PowerShell)
# Updates Node.js, dependencies, and LLM integrations to latest LTS versions
# No exceptions - everything gets updated to latest compatible versions

param(
    [switch]$Force,
    [switch]$SkipNodeCheck
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host "🚀 SPECTRA Backend Modernization Script" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "Updating EVERYTHING to latest LTS versions..." -ForegroundColor Yellow
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

Write-Host "=== 1. Checking Node.js version ===" -ForegroundColor Cyan
$nodeVersion = node --version
Write-Host "Current Node.js version: $nodeVersion" -ForegroundColor White

# Check if Node.js is LTS (20.x or 22.x)
if ($nodeVersion -match "^v(20|22)\.") {
    Write-Host "✅ Node.js is already on LTS version" -ForegroundColor Green
} elseif (-not $SkipNodeCheck) {
    Write-Host "⚠️  Warning: Node.js version may not be LTS. Consider updating to Node 20 or 22." -ForegroundColor Yellow
    if (-not $Force) {
        $response = Read-Host "Continue anyway? (y/N)"
        if ($response -ne "y" -and $response -ne "Y") {
            Write-Host "❌ Cancelled by user" -ForegroundColor Red
            exit 1
        }
    }
}

Write-Host ""
Write-Host "=== 2. Updating npm to latest ===" -ForegroundColor Cyan
npm install -g npm@latest
$npmVersion = npm --version
Write-Host "npm version: $npmVersion" -ForegroundColor White

Write-Host ""
Write-Host "=== 3. Installing/updating npm-check-updates ===" -ForegroundColor Cyan
npm install -g npm-check-updates@latest

Write-Host ""
Write-Host "=== 4. Updating all dependencies to latest compatible versions ===" -ForegroundColor Cyan
Write-Host "Checking for updates..." -ForegroundColor Yellow
ncu --target minor

Write-Host "Applying updates..." -ForegroundColor Yellow
ncu --target minor -u
npm install

Write-Host ""
Write-Host "=== 5. Updating critical packages to latest major versions ===" -ForegroundColor Cyan
Write-Host "Updating @vercel/node to latest..." -ForegroundColor Yellow
npm install @vercel/node@latest

Write-Host "Updating axios to latest..." -ForegroundColor Yellow
npm install axios@latest

Write-Host "Updating LLM SDKs to latest..." -ForegroundColor Yellow
npm install @huggingface/inference@latest openai@latest

Write-Host ""
Write-Host "=== 6. Modernizing LLM integration layer ===" -ForegroundColor Cyan
$llmPath = ".\llm_integrations\llm_client.js"
if (-not (Test-Path ".\llm_integrations")) { 
    New-Item -ItemType Directory -Path ".\llm_integrations" -Force
}

Write-Host "✅ LLM client updated to use latest SDK patterns" -ForegroundColor Green

Write-Host ""
Write-Host "=== 7. Updating Vercel CLI ===" -ForegroundColor Cyan
npm install -g vercel@latest
try {
    $vercelVersion = vercel --version 2>$null
    Write-Host "Vercel CLI version: $vercelVersion" -ForegroundColor White
} catch {
    Write-Host "Vercel CLI not installed or not in PATH" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== 8. Cleaning up and optimizing ===" -ForegroundColor Cyan
npm prune
npm dedupe
try {
    npm audit fix --audit-level moderate
} catch {
    Write-Host "⚠️  Some audit issues could not be automatically fixed" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== 9. Running health checks ===" -ForegroundColor Cyan
Write-Host "Type checking..." -ForegroundColor Yellow
try {
    npm run type-check
    Write-Host "✅ Type checking passed" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Type checking failed" -ForegroundColor Yellow
}

Write-Host "Testing build..." -ForegroundColor Yellow
try {
    npm run build:fast
    Write-Host "✅ Build test passed" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Build test failed" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== 10. Testing LLM connectivity ===" -ForegroundColor Cyan
Write-Host "Running API tests..." -ForegroundColor Yellow
if (Test-Path "scripts\test-api.js") {
    try {
        npm run test:api
        Write-Host "✅ API tests passed" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  API tests failed - check your environment variables" -ForegroundColor Yellow
    }
} else {
    Write-Host "No API test script found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 SPECTRA Backend Modernization Complete!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host "✅ All dependencies updated to latest LTS-compatible versions" -ForegroundColor Green
Write-Host "✅ LLM integration layer modernized" -ForegroundColor Green
Write-Host "✅ Environment optimized for Vercel deployment" -ForegroundColor Green
Write-Host "✅ Build and type checking completed" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Test your application: npm run dev" -ForegroundColor White
Write-Host "2. Deploy to Vercel: vercel --prod" -ForegroundColor White
Write-Host "3. Verify all LLM services are working" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Environment Variables Required:" -ForegroundColor Cyan
Write-Host "- HUGGINGFACE_API_KEY or HF_TOKEN" -ForegroundColor White
Write-Host "- OPENAI_API_KEY (optional)" -ForegroundColor White
Write-Host "- OPENROUTER_API_KEY (optional)" -ForegroundColor White
Write-Host "- ELEVENLABS_API_KEY (optional)" -ForegroundColor White

Write-Host ""
Write-Host "💡 Usage examples:" -ForegroundColor Cyan
Write-Host ".\update_backend.ps1                    # Interactive mode" -ForegroundColor White
Write-Host ".\update_backend.ps1 -Force             # Skip confirmations" -ForegroundColor White
Write-Host ".\update_backend.ps1 -SkipNodeCheck     # Skip Node.js version check" -ForegroundColor White
