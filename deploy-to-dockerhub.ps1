# PowerShell Script to Deploy PaarcelMate to Docker Hub
# Usage: .\deploy-to-dockerhub.ps1

# Configuration
$DOCKER_USERNAME = Read-Host "imharsimran10"
$VERSION = Read-Host "Enter version tag (e.g., v1.0.0)"

Write-Host "🔧 Building Docker images..." -ForegroundColor Cyan
Write-Host ""

# Build backend
Write-Host "📦 Building backend..." -ForegroundColor Yellow
docker build -t "${DOCKER_USERNAME}/paarcelmate-backend:latest" -t "${DOCKER_USERNAME}/paarcelmate-backend:${VERSION}" ./backend

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Backend build successful!" -ForegroundColor Green
Write-Host ""

# Build frontend
Write-Host "📦 Building frontend..." -ForegroundColor Yellow
docker build -t "${DOCKER_USERNAME}/paarcelmate-frontend:latest" -t "${DOCKER_USERNAME}/paarcelmate-frontend:${VERSION}" ./web-dashboard

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Frontend build successful!" -ForegroundColor Green
Write-Host ""

# Login to Docker Hub
Write-Host "🔐 Logging in to Docker Hub..." -ForegroundColor Cyan
docker login

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker login failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Push images
Write-Host "📤 Pushing images to Docker Hub..." -ForegroundColor Cyan
Write-Host ""

Write-Host "Pushing backend:latest..." -ForegroundColor Yellow
docker push "${DOCKER_USERNAME}/paarcelmate-backend:latest"

Write-Host "Pushing backend:${VERSION}..." -ForegroundColor Yellow
docker push "${DOCKER_USERNAME}/paarcelmate-backend:${VERSION}"

Write-Host "Pushing frontend:latest..." -ForegroundColor Yellow
docker push "${DOCKER_USERNAME}/paarcelmate-frontend:latest"

Write-Host "Pushing frontend:${VERSION}..." -ForegroundColor Yellow
docker push "${DOCKER_USERNAME}/paarcelmate-frontend:${VERSION}"

Write-Host ""
Write-Host "✅ All images pushed successfully!" -ForegroundColor Green
Write-Host "🎉 Deployment complete!" -ForegroundColor Magenta
Write-Host ""
Write-Host "📋 Your images are now available at:" -ForegroundColor Cyan
Write-Host "   Backend:  https://hub.docker.com/r/${DOCKER_USERNAME}/paarcelmate-backend" -ForegroundColor White
Write-Host "   Frontend: https://hub.docker.com/r/${DOCKER_USERNAME}/paarcelmate-frontend" -ForegroundColor White
Write-Host ""
Write-Host "🚀 To pull and run your images:" -ForegroundColor Cyan
Write-Host "   docker pull ${DOCKER_USERNAME}/paarcelmate-backend:${VERSION}" -ForegroundColor Gray
Write-Host "   docker pull ${DOCKER_USERNAME}/paarcelmate-frontend:${VERSION}" -ForegroundColor Gray
