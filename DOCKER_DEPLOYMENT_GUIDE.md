# Docker Deployment Guide for PaarcelMate P2P Application

This guide will help you dockerize and deploy the complete PaarcelMate application to Docker Hub.

## 📋 Prerequisites

1. **Docker Desktop** installed and running
   - Download from: https://www.docker.com/products/docker-desktop

2. **Docker Hub Account**
   - Create account at: https://hub.docker.com/signup

3. **Docker CLI** logged in
   ```bash
   docker login
   # Enter your Docker Hub username and password
   ```

---

## 🏗️ Project Structure

```
P2P_App_v3/
├── backend/                    # NestJS Backend API
│   ├── Dockerfile             # Production Dockerfile
│   └── .dockerignore
├── web-dashboard/             # Next.js Frontend
│   ├── Dockerfile             # Production Dockerfile
│   └── .dockerignore
├── docker-compose.yml         # Development setup
├── docker-compose.prod.yml    # Production setup
└── .env.docker.example        # Environment variables template
```

---

## 🚀 Quick Start

### Step 1: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.docker.example .env.docker
   ```

2. Edit `.env.docker` with your actual values:
   ```bash
   # Required: Your Docker Hub username
   DOCKER_USERNAME=your_dockerhub_username

   # Database credentials
   POSTGRES_PASSWORD=your_secure_password

   # JWT secrets (generate random strings)
   JWT_SECRET=your-random-secret-key
   JWT_REFRESH_SECRET=your-random-refresh-key

   # SendGrid API key (if using email)
   SENDGRID_API_KEY=SG.your_api_key
   ```

### Step 2: Build Docker Images

#### Build Backend Image
```bash
cd backend
docker build -t your_dockerhub_username/paarcelmate-backend:latest .
cd ..
```

#### Build Frontend Image
```bash
cd web-dashboard
docker build -t your_dockerhub_username/paarcelmate-frontend:latest .
cd ..
```

#### Or Build All Images at Once
```bash
# Using docker-compose
docker-compose -f docker-compose.prod.yml build
```

---

## 📤 Push to Docker Hub

### Step 1: Login to Docker Hub
```bash
docker login
# Enter your Docker Hub username and password when prompted
```

### Step 2: Tag Images (if not already tagged)
```bash
# Tag backend
docker tag paarcelmate-backend:latest your_dockerhub_username/paarcelmate-backend:latest
docker tag paarcelmate-backend:latest your_dockerhub_username/paarcelmate-backend:v1.0.0

# Tag frontend
docker tag paarcelmate-frontend:latest your_dockerhub_username/paarcelmate-frontend:latest
docker tag paarcelmate-frontend:latest your_dockerhub_username/paarcelmate-frontend:v1.0.0
```

### Step 3: Push Images to Docker Hub
```bash
# Push backend
docker push your_dockerhub_username/paarcelmate-backend:latest
docker push your_dockerhub_username/paarcelmate-backend:v1.0.0

# Push frontend
docker push your_dockerhub_username/paarcelmate-frontend:latest
docker push your_dockerhub_username/paarcelmate-frontend:v1.0.0
```

---

## 🎯 Complete Workflow Script

Create a file called `deploy-to-dockerhub.sh`:

```bash
#!/bin/bash

# Configuration
DOCKER_USERNAME="your_dockerhub_username"
VERSION="v1.0.0"

echo "🔧 Building Docker images..."

# Build backend
echo "📦 Building backend..."
docker build -t $DOCKER_USERNAME/paarcelmate-backend:latest -t $DOCKER_USERNAME/paarcelmate-backend:$VERSION ./backend

# Build frontend
echo "📦 Building frontend..."
docker build -t $DOCKER_USERNAME/paarcelmate-frontend:latest -t $DOCKER_USERNAME/paarcelmate-frontend:$VERSION ./web-dashboard

echo "✅ Build completed!"

# Login to Docker Hub
echo "🔐 Logging in to Docker Hub..."
docker login

# Push images
echo "📤 Pushing images to Docker Hub..."

echo "Pushing backend..."
docker push $DOCKER_USERNAME/paarcelmate-backend:latest
docker push $DOCKER_USERNAME/paarcelmate-backend:$VERSION

echo "Pushing frontend..."
docker push $DOCKER_USERNAME/paarcelmate-frontend:latest
docker push $DOCKER_USERNAME/paarcelmate-frontend:$VERSION

echo "✅ All images pushed successfully!"
echo "🎉 Deployment complete!"
echo ""
echo "📋 Your images are now available at:"
echo "   Backend:  https://hub.docker.com/r/$DOCKER_USERNAME/paarcelmate-backend"
echo "   Frontend: https://hub.docker.com/r/$DOCKER_USERNAME/paarcelmate-frontend"
```

Make it executable and run:
```bash
chmod +x deploy-to-dockerhub.sh
./deploy-to-dockerhub.sh
```

---

## 🖥️ Running the Application

### Local Development
```bash
docker-compose up -d
```

### Production Deployment
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f web-dashboard
```

---

## 🌐 Accessing the Application

After deployment:
- **Frontend (Web Dashboard)**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api/docs
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

---

## 🔍 Verify Deployment

### Check Running Containers
```bash
docker ps
```

### Check Container Health
```bash
docker ps --format "table {{.Names}}\t{{.Status}}"
```

### Test Backend API
```bash
curl http://localhost:3000/api/v1/health
```

### Test Frontend
```bash
curl http://localhost:3001
```

---

## 📊 Docker Hub Repository Setup

### 1. Create Repositories on Docker Hub

Visit https://hub.docker.com and create two repositories:
- `paarcelmate-backend`
- `paarcelmate-frontend`

### 2. Make Repositories Public (Optional)
- Go to repository settings
- Change visibility to "Public" if you want others to pull your images

### 3. Add Description and README
Add descriptions to help others understand your images:

**Backend Repository Description:**
```
PaarcelMate P2P Delivery Platform - Backend API
NestJS + PostgreSQL + Redis + Prisma
```

**Frontend Repository Description:**
```
PaarcelMate P2P Delivery Platform - Web Dashboard
Next.js 14 + TypeScript + Tailwind CSS
```

---

## 🔐 Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use secrets management** for production deployments
3. **Change default passwords** in production
4. **Use strong JWT secrets** (generate with: `openssl rand -base64 32`)
5. **Enable HTTPS** in production
6. **Regularly update** base images for security patches

---

## 🛠️ Troubleshooting

### Image Build Fails
```bash
# Clean Docker cache
docker builder prune -a

# Rebuild without cache
docker build --no-cache -t your_username/paarcelmate-backend:latest ./backend
```

### Push Fails with Authentication Error
```bash
# Logout and login again
docker logout
docker login
```

### Container Won't Start
```bash
# Check logs
docker logs paarcelmate-backend
docker logs paarcelmate-web-dashboard

# Check health status
docker inspect paarcelmate-backend | grep -A 5 Health
```

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check network
docker network inspect paarcelmate-network
```

---

## 📈 Monitoring & Maintenance

### View Resource Usage
```bash
docker stats
```

### Clean Up Unused Resources
```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune
```

### Update Images
```bash
# Pull latest images
docker-compose -f docker-compose.prod.yml pull

# Restart services
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🎓 Additional Resources

- **Docker Documentation**: https://docs.docker.com
- **Docker Hub**: https://hub.docker.com
- **Docker Compose**: https://docs.docker.com/compose
- **NestJS Docker Guide**: https://docs.nestjs.com/recipes/docker
- **Next.js Docker Guide**: https://nextjs.org/docs/deployment#docker-image

---

## 📝 Version History

- **v1.0.0** - Initial production release
  - Backend API with NestJS
  - Frontend Dashboard with Next.js
  - PostgreSQL database
  - Redis caching

---

## 🤝 Support

For issues or questions:
- Create an issue on GitHub
- Contact: your-email@example.com

---

**Happy Deploying! 🚀**
