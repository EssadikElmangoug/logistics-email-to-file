#!/bin/bash
# Docker cleanup script to fix ContainerConfig errors

echo "🧹 Cleaning up Docker containers and volumes..."

# Stop all containers
echo "Stopping containers..."
docker-compose down 2>/dev/null || true

# Remove all containers (including stopped ones)
echo "Removing containers..."
docker-compose rm -f 2>/dev/null || true

# Remove specific containers if they exist
docker rm -f logistics-mongodb logistics-backend logistics-frontend 2>/dev/null || true

# Remove volumes (optional - uncomment if you want to clear data)
# echo "Removing volumes..."
# docker volume rm logistics-email-to-file_mongodb_data 2>/dev/null || true

# Prune system to clean up any corrupted images/containers
echo "Pruning Docker system..."
docker system prune -f

echo "✅ Cleanup complete! You can now run: docker-compose up --build"

