@echo off
echo Starting ParcelMate Demo...
echo.

REM Check if Docker Desktop is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker Desktop is not running!
    echo Please start Docker Desktop and try again.
    echo.
    pause
    exit /b 1
)

REM Start infrastructure
echo Starting PostgreSQL and Redis...
docker-compose up -d postgres redis

echo Waiting for services to initialize (30 seconds)...
timeout /t 30 /nobreak >nul

REM Navigate to backend
cd backend

REM Check if .env exists
if not exist ".env" (
    echo Creating .env file...
    copy ..\.env.example .env
)

REM Install dependencies (always run to ensure all packages are present)
echo Checking and installing dependencies...
call npm install

REM Generate Prisma Client and push schema to database
echo Generating Prisma Client and syncing database...
set NODE_TLS_REJECT_UNAUTHORIZED=0
call npx prisma db push
set NODE_TLS_REJECT_UNAUTHORIZED=

REM Seed database
echo Seeding demo data...
call npm run prisma:seed

echo.
echo Setup complete!
echo.
echo Starting API server...
echo.
echo ================================================
echo ParcelMate is ready!
echo ================================================
echo.
echo API:  http://localhost:3000
echo Docs: http://localhost:3000/api/docs
echo.
echo Demo Accounts:
echo   Traveler: traveler1@demo.com ^| Demo123!
echo   Sender:   sender1@demo.com   ^| Demo123!
echo.
echo Press Ctrl+C to stop the server
echo ================================================
echo.

REM Start server
call npm run start:dev
