# 🚀 Quick Start: Upload to Docker Hub

## Step 1: Login to Docker Hub

Open PowerShell/Terminal and run:
```bash
docker login
```

Enter your Docker Hub credentials when prompted.

---

## Step 2: Run the Automated Deployment Script

### For Windows (PowerShell):
```powershell
.\deploy-to-dockerhub.ps1
```

### For Linux/Mac (Bash):
```bash
chmod +x deploy-to-dockerhub.sh
./deploy-to-dockerhub.sh
```

The script will:
1. ✅ Ask for your Docker Hub username
2. ✅ Ask for version tag (e.g., v1.0.0)
3. ✅ Build backend and frontend images
4. ✅ Tag images with latest and version tags
5. ✅ Push all images to Docker Hub

---

## Step 3: Manual Steps (Alternative)

If you prefer manual control:

### 3.1 Build Images
```bash
# Backend
docker build -t yourusername/parcelmate-backend:latest ./backend

# Frontend
docker build -t yourusername/parcelmate-frontend:latest ./web-dashboard
```

### 3.2 Tag Images
```bash
# Tag with version
docker tag yourusername/parcelmate-backend:latest yourusername/parcelmate-backend:v1.0.0
docker tag yourusername/parcelmate-frontend:latest yourusername/parcelmate-frontend:v1.0.0
```

### 3.3 Push to Docker Hub
```bash
# Push backend
docker push yourusername/parcelmate-backend:latest
docker push yourusername/parcelmate-backend:v1.0.0

# Push frontend
docker push yourusername/parcelmate-frontend:latest
docker push yourusername/parcelmate-frontend:v1.0.0
```

---

## Step 4: Verify Upload

Visit your Docker Hub repositories:
- Backend: `https://hub.docker.com/r/yourusername/parcelmate-backend`
- Frontend: `https://hub.docker.com/r/yourusername/parcelmate-frontend`

You should see your images with tags:
- ✅ `latest`
- ✅ `v1.0.0` (or your version)

---

## 🎯 One-Line Command

Build and push everything at once:

```bash
docker-compose -f docker-compose.prod.yml build && \
docker-compose -f docker-compose.prod.yml push
```

---

## 📊 Image Size Reference

Typical image sizes:
- Backend: ~250-350 MB
- Frontend: ~150-250 MB

---

## ✅ Success Checklist

- [ ] Docker Desktop is running
- [ ] Logged in to Docker Hub (`docker login`)
- [ ] Backend image built successfully
- [ ] Frontend image built successfully
- [ ] Backend image pushed to Docker Hub
- [ ] Frontend image pushed to Docker Hub
- [ ] Images visible on Docker Hub website
- [ ] Images can be pulled: `docker pull yourusername/parcelmate-backend:latest`

---

## 🔧 Troubleshooting

### "docker: command not found"
**Solution:** Install Docker Desktop from https://docker.com

### "denied: requested access to the resource is denied"
**Solution:**
```bash
docker logout
docker login
```

### Build fails with "npm ERR!"
**Solution:**
```bash
# Clean and rebuild
docker builder prune -a
docker build --no-cache -t yourusername/parcelmate-backend:latest ./backend
```

### "no space left on device"
**Solution:**
```bash
# Clean up Docker
docker system prune -a --volumes
```

---

## 🎓 Next Steps

After uploading to Docker Hub:

1. **Deploy to Production Server**
   ```bash
   docker pull yourusername/parcelmate-backend:latest
   docker pull yourusername/parcelmate-frontend:latest
   docker-compose -f docker-compose.prod.yml up -d
   ```

2. **Share with Team**
   - Send them the Docker Hub URL
   - They can pull with: `docker pull yourusername/parcelmate-backend:latest`

3. **Set up CI/CD**
   - Automate builds on code push
   - Use GitHub Actions, GitLab CI, or Jenkins

---

## 📞 Need Help?

- Docker Documentation: https://docs.docker.com
- Docker Hub: https://hub.docker.com
- Full Guide: See `DOCKER_DEPLOYMENT_GUIDE.md`

---

**Happy Deploying! 🎉**
