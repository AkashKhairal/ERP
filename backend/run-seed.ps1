Write-Host "Starting Database Seeding..." -ForegroundColor Green
Write-Host ""
Write-Host "This will:" -ForegroundColor Yellow
Write-Host "- Delete ALL existing users, roles, projects, teams, and tasks" -ForegroundColor Red
Write-Host "- Create 5 new roles with proper permissions" -ForegroundColor Cyan
Write-Host "- Create 10 new users with realistic data" -ForegroundColor Cyan
Write-Host "- Create 3 new projects" -ForegroundColor Cyan
Write-Host "- Create 7 new teams (3-4 per project)" -ForegroundColor Cyan
Write-Host "- Create sample tasks" -ForegroundColor Cyan
Write-Host ""
Write-Host "WARNING: This will completely reset your database!" -ForegroundColor Red
Write-Host ""

$confirm = Read-Host "Are you sure you want to continue? (y/N)"
if ($confirm -eq "y" -or $confirm -eq "Y") {
    Write-Host ""
    Write-Host "Running database seeding..." -ForegroundColor Green
    node seed-database.js
    Write-Host ""
    Write-Host "Seeding completed!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Seeding cancelled." -ForegroundColor Yellow
}

Read-Host "Press Enter to continue"
