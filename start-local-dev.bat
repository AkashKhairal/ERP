@echo off
echo Starting Local Development Environment...
echo.

echo 1. Starting Backend Server...
cd backend
start "Backend Server" cmd /k "npm run dev"
cd ..

echo 2. Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo 3. Starting Frontend Server...
cd frontend-nextjs
start "Frontend Server" cmd /k "npm run dev"
cd ..

echo.
echo Local Development Environment Started!
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause > nul

