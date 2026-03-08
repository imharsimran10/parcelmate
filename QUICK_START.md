# Quick Start Guide - ParcelMate

This guide will help you get the ParcelMate application running locally in under 10 minutes.

## Prerequisites

Ensure you have the following installed:
- **Node.js** 20+ ([Download](https://nodejs.org/))
- **Docker** & **Docker Compose** ([Download](https://www.docker.com/products/docker-desktop))
- **Git** ([Download](https://git-scm.com/))

## Step 1: Clone & Setup

```bash
# Navigate to project directory
cd P2P_App_v2

# Create environment file
cp .env.example backend/.env
```

## Step 2: Configure Environment

Edit `backend/.env` with your preferred text editor. For quick local development, you can use the defaults, but make sure to change:

```env
JWT_SECRET=change-this-to-a-random-secret-string
JWT_REFRESH_SECRET=change-this-to-another-random-secret-string
```

## Step 3: Start Infrastructure

```bash
# Start PostgreSQL, Redis, and Kafka using Docker Compose
docker-compose up -d postgres redis kafka
```

Wait about 30 seconds for services to initialize.

## Step 4: Set Up Database

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Seed database with sample data
npm run prisma:seed
```

## Step 5: Start Backend Server

```bash
# Start in development mode with hot-reload
npm run start:dev
```

You should see:
```
🚀 ParcelMate API is running!
📡 URL: http://localhost:3000
📚 Docs: http://localhost:3000/api/docs
🌍 Environment: development
```

## Step 6: Test the API

Open your browser and go to:
- **Swagger API Docs**: http://localhost:3000/api/docs

### Test Registration

Using Swagger UI or cURL:

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890"
  }'
```

### Test Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

You'll receive an access token that you can use for authenticated requests.

## Step 7: Explore the Database (Optional)

```bash
# Open Prisma Studio - a visual database browser
npx prisma studio
```

This opens a web interface at http://localhost:5555 where you can view and edit your database.

## Common Commands

### Backend Development

```bash
# Start with hot-reload
npm run start:dev

# Build for production
npm run build

# Run tests
npm run test

# Run linter
npm run lint

# Format code
npm run format
```

### Database

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Generate Prisma Client after schema changes
npx prisma generate

# Open Prisma Studio
npx prisma studio
```

### Docker

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f backend

# Rebuild services
docker-compose up -d --build
```

## Troubleshooting

### Port Already in Use

If port 3000 is already in use:

```bash
# Find process using port 3000
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process or change API_PORT in .env
```

### Database Connection Error

```bash
# Ensure PostgreSQL is running
docker-compose ps

# Restart PostgreSQL
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

### Prisma Client Not Generated

```bash
# Generate Prisma Client
npx prisma generate

# If that fails, delete and reinstall
rm -rf node_modules/.prisma
npm install
npx prisma generate
```

### Redis Connection Error

```bash
# Restart Redis
docker-compose restart redis

# Check if Redis is running
docker-compose ps redis
```

## What's Working Now?

✅ **Authentication System**
- User registration with validation
- Login with JWT tokens
- Secure password hashing
- Protected routes

✅ **Database**
- Complete schema with 12+ models
- Geospatial support with PostGIS
- Proper relationships and indexes

✅ **Infrastructure**
- PostgreSQL database
- Redis caching
- Kafka event streaming
- Docker containerization

✅ **API Documentation**
- Interactive Swagger UI
- All endpoints documented
- Try-it-out functionality

## What's Next?

To continue building the application, refer to [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) for:

1. **Core Modules**: Users, Trips, Parcels, Matching
2. **Payment System**: Stripe Connect integration
3. **Trust & Safety**: Verification and scoring
4. **Mobile App**: React Native application
5. **Web Dashboard**: Next.js frontend

## Need Help?

- Check [README.md](./README.md) for architecture details
- Review [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) for progress
- Check API docs at http://localhost:3000/api/docs
- Review Prisma schema at `backend/prisma/schema.prisma`

## Useful Development URLs

- **API Server**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api/docs
- **Prisma Studio**: http://localhost:5555 (run `npx prisma studio`)
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **Kafka**: localhost:9092

---

Happy coding! 🚀
