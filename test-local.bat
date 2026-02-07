@echo off
REM 🧪 Idea Weaver Local Test Script for Windows
REM Tests the deployment process locally without deploying

echo.
echo ================================
echo 🧪 Idea Weaver Local Testing
echo ================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo [ERROR] This script must be run from the Idea Weaver project root directory
    exit /b 1
)

if not exist "src\App.tsx" (
    echo [ERROR] This script must be run from the Idea Weaver project root directory
    exit /b 1
)

REM Step 1: Environment Setup
echo [INFO] Checking environment variables...
if not exist ".env.local" (
    echo [WARNING] .env.local not found. Creating default...
    (
        echo # Idea Weaver Environment Variables
        echo REACT_APP_API_URL=http://localhost:3000
        echo REACT_APP_VERSION=1.0.0
        echo.
        echo # Optional: Analytics
        echo REACT_APP_GA_ID=your_google_analytics_id
        echo.
        echo # Optional: Error Tracking
        echo REACT_APP_SENTRY_DSN=your_sentry_dsn
    ) > .env.local
    echo [INFO] Created .env.local file. Please review and update with your actual values if needed.
) else (
    echo [SUCCESS] .env.local already exists, preserving existing configuration.
)

REM Step 2: Install Dependencies
echo.
echo [INFO] Installing dependencies...
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies. Please check your package.json and try again.
    exit /b 1
)
echo [SUCCESS] Dependencies installed successfully!

REM Step 3: Build Project
echo.
echo [INFO] Building project...
call npm run build
if errorlevel 1 (
    echo [ERROR] Build failed! Please check the errors above and fix them before testing.
    exit /b 1
)
echo [SUCCESS] Build completed successfully!

REM Step 4: Provide instructions
echo.
echo ================================
echo ✅ Local Build Complete!
echo ================================
echo.
echo Your application is ready for testing!
echo.
echo To test your build locally, choose one of these options:
echo.
echo Option 1: Development Server (recommended for development)
echo   npm start
echo   Opens at http://localhost:3000
echo.
echo Option 2: Production Build Server
echo   npx serve -s build
echo   Opens at http://localhost:3000 or http://localhost:5000
echo.
echo Option 3: Python HTTP Server
echo   python -m http.server 8000 -d build
echo   Opens at http://localhost:8000
echo.
echo Option 4: Node.js HTTP Server
echo   npx http-server build -p 8000
echo   Opens at http://localhost:8000
echo.
echo Press any key to start the development server now, or close this window to exit...
pause >nul

REM Start development server
echo.
echo [INFO] Starting development server...
call npm start

