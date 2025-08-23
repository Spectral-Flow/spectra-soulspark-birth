@echo off
REM Spectra Mobile Build Helper Script for Windows
REM This script helps set up and build the Spectra mobile app

echo 🔮 Spectra Mobile Build Helper
echo ==============================

REM Check prerequisites
echo.
echo 📋 Checking Prerequisites...

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js 18+
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Node.js: !NODE_VERSION!
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ npm not found
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo ✅ npm: !NPM_VERSION!
)

where java >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Java not found. Please install Java 17+
    echo    Download from: https://adoptium.net/
    pause
    exit /b 1
) else (
    echo ✅ Java found
)

REM Check for Android SDK
if defined ANDROID_HOME (
    echo ✅ Android SDK: %ANDROID_HOME%
) else (
    echo ⚠️  ANDROID_HOME not set
    echo    Please install Android Studio and set ANDROID_HOME
    echo    Guide: https://developer.android.com/studio/install
)

echo.
echo 🔧 Setup Steps:
echo 1. Installing dependencies...

if not exist "node_modules" (
    call npm install
    echo ✅ Dependencies installed
) else (
    echo ✅ Dependencies already installed
)

echo.
echo 2. Building web application...
call npm run build
echo ✅ Web app built

echo.
echo 3. Syncing with Capacitor...
call npm run mobile:sync
echo ✅ Mobile project synced

echo.
echo 📱 Available Actions:
echo =====================
echo 1. Build Debug APK
echo 2. Open Android Studio
echo 3. Run on Device
echo 4. Clean Build
echo 5. Exit

set /p choice="Select an option (1-5): "

if "%choice%"=="1" (
    echo.
    echo 🔨 Building debug APK...
    if defined ANDROID_HOME (
        cd android
        call gradlew.bat assembleDebug
        echo.
        echo ✅ APK built successfully!
        echo 📍 Location: android\app\build\outputs\apk\debug\app-debug.apk
        echo.
        echo 📲 To install on your phone:
        echo 1. Enable 'Unknown Sources' in Android Settings
        echo 2. Transfer the APK file to your phone
        echo 3. Tap the APK file to install
    ) else (
        echo ❌ Android SDK not configured. Please set ANDROID_HOME
    )
) else if "%choice%"=="2" (
    echo.
    echo 🚀 Opening Android Studio...
    call npx cap open android
) else if "%choice%"=="3" (
    echo.
    echo 📱 Running on connected device...
    echo Make sure your device is connected and USB debugging is enabled
    call npx cap run android
) else if "%choice%"=="4" (
    echo.
    echo 🧹 Cleaning build artifacts...
    call npm run mobile:clean
    call npm run clean
    echo ✅ Clean complete
) else if "%choice%"=="5" (
    echo 👋 Goodbye!
) else (
    echo Invalid option
)

echo.
echo 📚 For more information, see MOBILE_SETUP.md
echo 🐛 For issues, check: https://capacitorjs.com/docs/troubleshooting
pause