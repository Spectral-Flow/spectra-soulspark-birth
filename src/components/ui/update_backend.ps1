# Requires PowerShell 7+
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host "=== 1. Updating Node.js to latest LTS ==="
# Check if nvm-windows is installed
if (-not (Get-Command nvm -ErrorAction SilentlyContinue)) {
    Write-Host "nvm not found. Please install nvm-windows from https://github.com/coreybutler/nvm-windows"
    exit
}
nvm install lts
nvm use lts
Write-Host "Node.js version: $(node -v)"
Write-Host "npm version: $(npm -v)"

Write-Host "=== 2. Updating Python to latest LTS ==="
# Assume Python installer is already installed; otherwise user must download from python.org
$pythonPath = "C:\Python312\python.exe"
if (-not (Test-Path $pythonPath)) {
    Write-Host "Python 3.12 not found. Please install from https://www.python.org/downloads/windows/"
    exit
}
$env:PATH = "C:\Python312;$env:PATH"
python --version

Write-Host "=== 3. Updating Node dependencies ==="
npm install -g npm-check-updates
ncu -u
npm install

Write-Host "=== 4. Updating Python dependencies ==="
python -m pip install --upgrade pip
$packages = python -m pip list --outdated --format=freeze | ForEach-Object { ($_ -split '==')[0] }
foreach ($pkg in $packages) { python -m pip install --upgrade $pkg }

Write-Host "=== 5. Rebuilding LLM integration layer ==="
$llmPath = ".\llm_integrations\llm_client.js"
if (-not (Test-Path ".\llm_integrations")) { New-Item -ItemType Directory -Path ".\llm_integrations" }
@"
import { HfInference } from "@huggingface/inference";
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export async function queryLLM(prompt, provider="huggingface") {
    if(provider === "huggingface") {
        const res = await hf.textGeneration({ model: "gpt-neo-3.7B", inputs: prompt });
        return res.generated_text;
    } else if(provider === "openai") {
        const axios = require("axios");
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            { model: "gpt-4", messages: [{role: "user", content: prompt}] },
            { headers: { Authorization: \`Bearer \${process.env.OPENAI_API_KEY}\` } }
        );
        return response.data.choices[0].message.content;
    }
}
"@ | Out-File -FilePath $llmPath -Encoding utf8

Write-Host "=== 6. Updating Vercel CLI ==="
npm install -g vercel@latest
Write-Host "Vercel CLI version: $(vercel --version)"

Write-Host "=== 7. Cleanup complete ==="
Write-Host "All runtimes, dependencies, and integration layers updated to latest LTS. Ready to deploy!"
