# Docker cleanup script for Windows PowerShell to fix ContainerConfig and cache corruption errors

Write-Host "🧹 Cleaning up Docker containers, volumes, and build cache..." -ForegroundColor Cyan

# Stop all containers
Write-Host "Stopping containers..." -ForegroundColor Yellow
docker-compose down 2>$null

# Remove all containers (including stopped ones)
Write-Host "Removing containers..." -ForegroundColor Yellow
docker-compose rm -f 2>$null

# Remove specific containers if they exist
Write-Host "Removing specific containers..." -ForegroundColor Yellow
docker rm -f logistics-mongodb logistics-backend logistics-frontend 2>$null

# Remove build cache to fix snapshot corruption
Write-Host "Removing build cache..." -ForegroundColor Yellow
docker builder prune -af 2>$null

# Remove corrupted images
Write-Host "Removing corrupted images..." -ForegroundColor Yellow
docker rmi logistics-email-to-file-frontend logistics-email-to-file-backend 2>$null

# Prune system to clean up any corrupted images/containers
Write-Host "Pruning Docker system..." -ForegroundColor Yellow
docker system prune -f

Write-Host "✅ Cleanup complete! You can now run: docker-compose up --build" -ForegroundColor Green

