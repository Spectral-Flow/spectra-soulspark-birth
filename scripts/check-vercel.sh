#!/bin/bash

# Vercel deployment check script
echo "🚀 Checking Vercel deployment readiness..."

# Check if required files exist
echo "📁 Checking configuration files..."
if [ -f "vercel.json" ]; then
    echo "✅ vercel.json found"
else
    echo "❌ vercel.json missing"
    exit 1
fi

if [ -f "package.json" ]; then
    echo "✅ package.json found"
else
    echo "❌ package.json missing"
    exit 1
fi

if [ -f "vite.config.ts" ]; then
    echo "✅ vite.config.ts found"
else
    echo "❌ vite.config.ts missing"
    exit 1
fi

# Check build script
echo "🔧 Checking build configuration..."
if grep -q '"build"' package.json; then
    echo "✅ Build script found in package.json"
else
    echo "❌ Build script missing in package.json"
    exit 1
fi

echo "🎉 Vercel deployment configuration looks good!"
echo "💡 Remember to set environment variables in Vercel dashboard if needed"