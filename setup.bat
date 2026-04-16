@echo off
REM 🚀 Watchverse Setup and Run Script for Windows
REM This script helps set up and run Watchverse for development and production

setlocal enabledelayedexpansion

echo.
echo 🎬 Welcome to Watchverse Setup!
echo ================================

REM Check Node.js
echo.
echo Checking prerequisites...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js 18+
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js: %NODE_VERSION%

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ npm not found
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✅ npm: %NPM_VERSION%

REM Menu
echo.
echo What would you like to do?
echo 1. Setup development environment
echo 2. Run development server ^& client (Requires 2 terminals)
echo 3. Build for production
echo 4. Run production build
echo 5. Deploy to Google Cloud
echo 6. View logs
echo q. Quit
set /p choice="Enter choice [1-6, q]: "

if "%choice%"=="1" goto setup
if "%choice%"=="2" goto dev
if "%choice%"=="3" goto build
if "%choice%"=="4" goto run_prod
if "%choice%"=="5" goto deploy
if "%choice%"=="6" goto logs
if "%choice%"=="q" goto quit
echo Invalid choice
goto menu

:setup
echo.
echo Setting up development environment...

REM Setup backend
echo.
echo Setting up backend...
cd server
if not exist .env (
    copy .env.example .env
    echo ✅ Created .env file
    echo ⚠️  Please edit server\.env with your actual values
) else (
    echo .env already exists
)
call npm install
cd ..
echo ✅ Backend setup complete

REM Setup frontend
echo.
echo Setting up frontend...
cd client
if not exist .env.local (
    copy .env.example .env.local
    echo ✅ Created .env.local file
    echo ⚠️  Please edit client\.env.local with your API URL
) else (
    echo .env.local already exists
)
call npm install
cd ..
echo ✅ Frontend setup complete

echo.
echo ✅ Setup complete! Next steps:
echo 1. Edit server\.env with your actual values
echo 2. Edit client\.env.local with your API URL
echo 3. Run 'setup.bat' and choose option 2 to start development
pause
goto end

:dev
echo.
echo Starting development servers...

REM Check if setup is complete
if not exist server\.env (
    echo ❌ server\.env not found. Run setup first.
    pause
    exit /b 1
)

if not exist client\.env.local (
    echo ❌ client\.env.local not found. Run setup first.
    pause
    exit /b 1
)

echo.
echo Starting backend on port 5000 (in new terminal)...
start "Watchverse Backend" cmd /k "cd server && npm run dev"

echo ✅ Backend starting in new terminal
echo.
echo To start frontend:
echo 1. Open another terminal
echo 2. Run: cd client && npm start
echo 3. Frontend will open at http://localhost:3000
echo.
pause
goto end

:build
echo.
echo Building for production...

REM Build client
echo.
echo Building React frontend...
cd client
(
    echo REACT_APP_API_URL=https://your-api-domain.com/api
) > .env.production.local
call npm run build
cd ..
echo ✅ Frontend build complete: client\build\

echo.
echo ✅ All builds complete!
echo Backend is ready to run with: npm start
pause
goto end

:run_prod
echo.
echo Running production build...

if not exist server\.env (
    echo ❌ server\.env not found
    pause
    exit /b 1
)

if not exist client\build (
    echo ❌ Frontend build not found. Run setup and build first.
    pause
    exit /b 1
)

echo Starting server in production mode...
cd server
set NODE_ENV=production
call npm start
cd ..
goto end

:deploy
echo.
echo Deploying to Google Cloud...

where gcloud >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Google Cloud SDK not found
    echo Please install: https://cloud.google.com/sdk/docs/install
    pause
    exit /b 1
)

echo Checking Google Cloud authentication...
set /p PROJECT_ID="Enter your Google Cloud Project ID: "
call gcloud config set project %PROJECT_ID%

echo.
echo Building and deploying backend...
cd server
call gcloud app deploy
cd ..

echo.
echo Building and deploying frontend...
cd client
call npm run build
echo ✅ Frontend build ready in client\build\
echo Use: gsutil -m rsync -r -d build gs://watchverse-app
echo Or use: firebase deploy
cd ..

echo.
echo ✅ Deployment complete!
pause
goto end

:logs
echo.
echo Viewing logs...

if exist server\logs (
    echo.
    echo Recent errors:
    for /f "tokens=*" %%i in ('dir /b server\logs\error-*.log 2^>nul') do (
        echo Showing last 20 lines of %%i:
        for /f "skip=20" %%j in ('type "server\logs\%%i"') do echo %%j
    )
    
    echo.
    echo Recent info:
    for /f "tokens=*" %%i in ('dir /b server\logs\info-*.log 2^>nul') do (
        echo Showing last 20 lines of %%i:
        for /f "skip=20" %%j in ('type "server\logs\%%i"') do echo %%j
    )
) else (
    echo No logs directory found
)
pause
goto end

:quit
echo Goodbye!
exit /b 0

:end
pause
