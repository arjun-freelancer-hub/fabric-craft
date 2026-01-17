# PowerShell script to seed database with demo credentials in Docker

Write-Host "Seeding database with demo credentials..." -ForegroundColor Cyan

# Check if containers are running
$backendRunning = docker-compose ps | Select-String "fabric-craft-backend.*Up"
if (-not $backendRunning) {
    Write-Host "Backend container is not running. Please start containers first:" -ForegroundColor Red
    Write-Host "   docker-compose up -d" -ForegroundColor Yellow
    exit 1
}

# Run the seed command using the helper script which constructs DATABASE_URL correctly
# The helper script ensures DATABASE_URL uses the Docker service name (mysql) instead of localhost
docker-compose exec backend /usr/local/bin/seed-helper.sh

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Demo credentials seeded successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Demo Credentials:" -ForegroundColor Yellow
    Write-Host "   Admin: admin@fabriccraft.com / admin123" -ForegroundColor White
    Write-Host "   Staff: staff@fabriccraft.com / staff123" -ForegroundColor White
} else {
    Write-Host "Failed to seed database" -ForegroundColor Red
    exit 1
}
