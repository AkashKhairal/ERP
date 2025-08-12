@echo off
echo Starting Database Seeding...
echo.
echo This will:
echo - Delete ALL existing users, roles, projects, teams, and tasks
echo - Create 5 new roles with proper permissions
echo - Create 10 new users with realistic data
echo - Create 3 new projects
echo - Create 7 new teams (3-4 per project)
echo - Create sample tasks
echo.
echo WARNING: This will completely reset your database!
echo.
set /p confirm="Are you sure you want to continue? (y/N): "
if /i "%confirm%"=="y" (
    echo.
    echo Running database seeding...
    node seed-database.js
    echo.
    echo Seeding completed!
    pause
) else (
    echo.
    echo Seeding cancelled.
    pause
)
