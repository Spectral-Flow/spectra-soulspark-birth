#!/bin/bash

# Vercel Deployment Verification Script
echo "🚀 SPECTRA - Vercel Deployment Verification"
echo "=============================================="

# Check Node version
echo "📋 Checking Node.js version..."
node_version=$(node --version)
nvmrc_version=$(cat .nvmrc)
echo "Current: $node_version"
echo "Required: v$nvmrc_version"

if [[ $node_version == v$nvmrc_version* ]]; then
    echo "✅ Node.js version matches .nvmrc"
else
    echo "⚠️  Node.js version mismatch - deployment will use $nvmrc_version"
fi

# Check TypeScript compilation
echo -e "\n🔧 Checking TypeScript compilation..."
if npm run type-check > /dev/null 2>&1; then
    echo "✅ TypeScript compilation successful"
else
    echo "❌ TypeScript compilation failed"
    exit 1
fi

# Check build process
echo -e "\n🏗️  Testing build process..."
if npm run build > /dev/null 2>&1; then
    echo "✅ Production build successful"
    # Check build output
    if [ -d "dist" ] && [ -f "dist/index.html" ]; then
        echo "✅ Build artifacts generated correctly"
    else
        echo "❌ Build artifacts missing"
        exit 1
    fi
else
    echo "❌ Production build failed"
    exit 1
fi

# Check Vercel configuration
echo -e "\n🚀 Checking Vercel configuration..."
if [ -f "vercel.json" ]; then
    echo "✅ vercel.json exists"
    
    # Validate JSON
    if cat vercel.json | jq . > /dev/null 2>&1; then
        echo "✅ vercel.json is valid JSON"
    else
        echo "⚠️  vercel.json validation requires jq (optional check)"
    fi
else
    echo "❌ vercel.json missing"
    exit 1
fi

# Check for deployment blockers
echo -e "\n🔍 Checking for deployment blockers..."

# Check for NODE_ENV in .env
if grep -q "^NODE_ENV=" .env 2>/dev/null; then
    echo "⚠️  NODE_ENV found in .env file (should be removed for Vite)"
else
    echo "✅ No NODE_ENV in .env file"
fi

# Check required files
required_files=("package.json" ".nvmrc" "vite.config.ts" "tsconfig.json")
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
        exit 1
    fi
done

echo -e "\n🎉 DEPLOYMENT READY!"
echo "Next steps:"
echo "1. Push code to GitHub"
echo "2. Connect repository to Vercel"
echo "3. Set environment variables in Vercel dashboard"
echo "4. Deploy!"