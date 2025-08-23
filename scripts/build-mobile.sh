#!/bin/bash

# Spectra Mobile Build Helper Script
# This script helps set up and build the Spectra mobile app

set -e

echo "🔮 Spectra Mobile Build Helper"
echo "=============================="

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo ""
echo "📋 Checking Prerequisites..."

if command_exists node; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js: $NODE_VERSION"
else
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

if command_exists npm; then
    NPM_VERSION=$(npm --version)
    echo "✅ npm: $NPM_VERSION"
else
    echo "❌ npm not found"
    exit 1
fi

if command_exists java; then
    JAVA_VERSION=$(java -version 2>&1 | head -n 1)
    echo "✅ Java: $JAVA_VERSION"
else
    echo "❌ Java not found. Please install Java 17+"
    echo "   Download from: https://adoptium.net/"
    exit 1
fi

# Check for Android SDK
if [ -n "$ANDROID_HOME" ]; then
    echo "✅ Android SDK: $ANDROID_HOME"
else
    echo "⚠️  ANDROID_HOME not set"
    echo "   Please install Android Studio and set ANDROID_HOME"
    echo "   Guide: https://developer.android.com/studio/install"
fi

echo ""
echo "🔧 Setup Steps:"
echo "1. Installing dependencies..."

if [ ! -d "node_modules" ]; then
    npm install
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "2. Building web application..."
npm run build
echo "✅ Web app built"

echo ""
echo "3. Syncing with Capacitor..."
npm run mobile:sync
echo "✅ Mobile project synced"

echo ""
echo "📱 Available Actions:"
echo "====================="

PS3="Select an option: "
options=("Build Debug APK" "Open Android Studio" "Run on Device" "Clean Build" "Exit")

select opt in "${options[@]}"
do
    case $opt in
        "Build Debug APK")
            echo ""
            echo "🔨 Building debug APK..."
            if [ -n "$ANDROID_HOME" ]; then
                cd android
                ./gradlew assembleDebug
                echo ""
                echo "✅ APK built successfully!"
                echo "📍 Location: android/app/build/outputs/apk/debug/app-debug.apk"
                echo ""
                echo "📲 To install on your phone:"
                echo "1. Enable 'Unknown Sources' in Android Settings"
                echo "2. Transfer the APK file to your phone"
                echo "3. Tap the APK file to install"
            else
                echo "❌ Android SDK not configured. Please set ANDROID_HOME"
            fi
            break
            ;;
        "Open Android Studio")
            echo ""
            echo "🚀 Opening Android Studio..."
            npx cap open android
            break
            ;;
        "Run on Device")
            echo ""
            echo "📱 Running on connected device..."
            echo "Make sure your device is connected and USB debugging is enabled"
            npx cap run android
            break
            ;;
        "Clean Build")
            echo ""
            echo "🧹 Cleaning build artifacts..."
            npm run mobile:clean
            npm run clean
            echo "✅ Clean complete"
            break
            ;;
        "Exit")
            echo "👋 Goodbye!"
            break
            ;;
        *) echo "Invalid option $REPLY";;
    esac
done

echo ""
echo "📚 For more information, see MOBILE_SETUP.md"
echo "🐛 For issues, check: https://capacitorjs.com/docs/troubleshooting"