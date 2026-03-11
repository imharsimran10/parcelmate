# PaarcelMate - Complete Demo Guide

## 🎯 Quick Demo Setup (5 Minutes)

This guide will help you run a complete demo of the PaarcelMate P2P parcel delivery platform.

---

## 📋 Prerequisites

- Docker & Docker Compose installed
- Node.js 20+ installed
- Port 3000, 5432, 6379 available

---

## 🚀 Step-by-Step Demo Setup

### 1. Start Infrastructure

```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Wait 30 seconds for services to initialize
```

### 2. Set Up Backend

```bash
cd backend

# Install dependencies (first time only)
npm install

# Create environment file
cp ../.env.example .env

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed with demo data
npm run prisma:seed
```

### 3. Start API Server

```bash
# Start in development mode
npm run start:dev
```

You should see:
```
🚀 PaarcelMate API is running!
📡 URL: http://localhost:3000
📚 Docs: http://localhost:3000/api/docs
🌍 Environment: development
```

---

## 🧪 Demo Accounts

The seed data creates these accounts:

### Travelers (Create trips and deliver parcels)
| Email | Password | Trust Score | Completed Trips |
|-------|----------|-------------|-----------------|
| traveler1@demo.com | Demo123! | 85 | 15 |
| traveler2@demo.com | Demo123! | 92 | 28 |

### Senders (Send parcels)
| Email | Password | Trust Score | Completed Deliveries |
|-------|----------|-------------|----------------------|
| sender1@demo.com | Demo123! | 78 | 10 |
| sender2@demo.com | Demo123! | 65 | 5 |

---

## 🎬 Demo Scenarios

### Scenario 1: Complete User Journey (Traveler)

#### 1.1 Login as Traveler
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "traveler1@demo.com",
    "password": "Demo123!"
  }'
```

**Save the `accessToken` from the response!**

#### 1.2 View Profile
```bash
curl -X GET http://localhost:3000/api/v1/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 1.3 View My Trips
```bash
curl -X GET http://localhost:3000/api/v1/trips \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 1.4 Find Matching Parcels for My Trip
Get a trip ID from step 1.3, then:
```bash
curl -X GET "http://localhost:3000/api/v1/matching/trip/{TRIP_ID}" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 1.5 Accept a Parcel Match
```bash
curl -X POST "http://localhost:3000/api/v1/matching/accept/{PARCEL_ID}/{TRIP_ID}" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### Scenario 2: Complete User Journey (Sender)

#### 2.1 Login as Sender
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sender1@demo.com",
    "password": "Demo123!"
  }'
```

#### 2.2 Create a Parcel Request
```bash
curl -X POST http://localhost:3000/api/v1/parcels \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipientName": "Jane Doe",
    "recipientPhone": "+16175554444",
    "recipientEmail": "jane@example.com",
    "pickupAddress": "Times Square, New York, NY",
    "pickupLat": 40.758,
    "pickupLng": -73.9855,
    "deliveryAddress": "Fenway Park, Boston, MA",
    "deliveryLat": 42.3467,
    "deliveryLng": -71.0972,
    "title": "Birthday Gift",
    "description": "Small package with birthday present",
    "size": "SMALL",
    "weight": 1.5,
    "declaredValue": 80,
    "pickupTimeStart": "2024-12-25T10:00:00Z",
    "pickupTimeEnd": "2024-12-25T16:00:00Z",
    "urgency": "STANDARD",
    "offeredPrice": 28.00
  }'
```

#### 2.3 Publish Parcel to Find Travelers
```bash
curl -X POST "http://localhost:3000/api/v1/parcels/{PARCEL_ID}/publish" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 2.4 Find Matching Travelers
```bash
curl -X GET "http://localhost:3000/api/v1/matching/parcel/{PARCEL_ID}" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 2.5 View My Parcels
```bash
curl -X GET http://localhost:3000/api/v1/parcels \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### Scenario 3: Search & Discovery

#### 3.1 Search for Available Trips (as Sender)
```bash
curl -X POST http://localhost:3000/api/v1/trips/search \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "originLat": 40.7128,
    "originLng": -74.0060,
    "destLat": 42.3601,
    "destLng": -71.0589,
    "radiusKm": 50,
    "minTrustScore": 70
  }'
```

#### 3.2 Search for Available Parcels (as Traveler)
```bash
curl -X POST http://localhost:3000/api/v1/parcels/search \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "maxWeight": 10,
    "size": "SMALL"
  }'
```

---

### Scenario 4: Messaging & Communication

#### 4.1 Send a Message
```bash
curl -X POST http://localhost:3000/api/v1/messages \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "receiverId": "RECEIVER_USER_ID",
    "parcelId": "PARCEL_ID",
    "content": "Hi! When can you pick up the parcel?"
  }'
```

#### 4.2 Get Conversation
```bash
curl -X GET "http://localhost:3000/api/v1/messages/parcel/{PARCEL_ID}" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### Scenario 5: Tracking & Updates

#### 5.1 Get Parcel Tracking Events
```bash
curl -X GET "http://localhost:3000/api/v1/tracking/parcel/{PARCEL_ID}" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 5.2 Update Location (Traveler during delivery)
```bash
curl -X POST http://localhost:3000/api/v1/tracking/location \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "parcelId": "PARCEL_ID",
    "latitude": 41.5,
    "longitude": -72.5
  }'
```

---

### Scenario 6: Reviews & Ratings

#### 6.1 Leave a Review (After delivery)
```bash
curl -X POST http://localhost:3000/api/v1/reviews \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "parcelId": "PARCEL_ID",
    "recipientId": "TRAVELER_USER_ID",
    "rating": 5,
    "comment": "Excellent service, very professional!",
    "tags": ["FAST", "PROFESSIONAL", "FRIENDLY"]
  }'
```

#### 6.2 View User Reviews
```bash
curl -X GET http://localhost:3000/api/v1/users/reviews \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### Scenario 7: Notifications

#### 7.1 Get My Notifications
```bash
curl -X GET http://localhost:3000/api/v1/notifications \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 7.2 Mark All as Read
```bash
curl -X PUT http://localhost:3000/api/v1/notifications/read-all \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### Scenario 8: Admin Operations

#### 8.1 Get Dashboard Stats
```bash
curl -X GET http://localhost:3000/api/v1/admin/stats \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 8.2 List All Users
```bash
curl -X GET "http://localhost:3000/api/v1/admin/users?page=1&limit=50" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🌐 Interactive API Testing

The easiest way to test is using Swagger UI:

1. Open: http://localhost:3000/api/docs
2. Click "Authorize" button at top right
3. Enter your access token (from login response)
4. Try any endpoint by clicking "Try it out"

---

## 📊 Demo Data Overview

After running the seed script, you'll have:

### Users
- ✅ 4 demo users (2 travelers, 2 senders)
- ✅ All verified with good trust scores
- ✅ Different experience levels

### Trips
- ✅ 3 published trips
  - New York → Boston (2 days from now)
  - San Francisco → Los Angeles (3 days from now)
  - Chicago → Detroit (5 days from now)

### Parcels
- ✅ 2 parcels requesting delivery
- ✅ 1 matched parcel (already connected with a trip)
- ✅ Various sizes and urgency levels

### Other Data
- ✅ Tracking events for matched parcel
- ✅ Sample review
- ✅ Notifications for users

---

## 🎯 Testing the Matching Algorithm

The matching algorithm considers:
- **Route Match (40%)**: Origin & destination proximity
- **Time Match (30%)**: Departure time alignment
- **Trust Score (20%)**: User reliability
- **Price Match (10%)**: Price vs. estimated cost

### Test Matching

1. Login as sender1@demo.com
2. Create a parcel from NY to Boston
3. Publish the parcel
4. Call: `GET /api/v1/matching/parcel/{id}`
5. See matched trips with scores!

---

## 🔍 Health Check

Check if API is healthy:
```bash
curl http://localhost:3000/api/v1/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-12-17T10:30:00.000Z",
  "database": "connected",
  "uptime": 123.456
}
```

---

## 📱 Testing WebSocket (Real-time Tracking)

Using a WebSocket client (like wscat):

```bash
# Install wscat
npm install -g wscat

# Connect to WebSocket
wscat -c "ws://localhost:3000"

# Join parcel tracking
{"event": "joinParcelTracking", "data": {"parcelId": "PARCEL_ID"}}

# Update location
{"event": "updateLocation", "data": {"parcelId": "PARCEL_ID", "latitude": 41.0, "longitude": -73.0}}
```

---

## 🐛 Troubleshooting

### Can't connect to database
```bash
# Restart PostgreSQL
docker-compose restart postgres

# Check if running
docker-compose ps
```

### Port 3000 already in use
```bash
# Kill process on port 3000
# Linux/Mac:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Prisma Client not generated
```bash
cd backend
npx prisma generate
```

### Reset database
```bash
cd backend
npx prisma migrate reset
npm run prisma:seed
```

---

## 📈 Performance Testing

Test API performance:
```bash
# Install Apache Bench
# Mac: brew install httpd
# Ubuntu: sudo apt-get install apache2-utils

# Load test health endpoint
ab -n 1000 -c 10 http://localhost:3000/api/v1/health
```

---

## 🎓 Learning the API

### Best Practices Demonstrated

1. **Authentication**: JWT-based with bearer tokens
2. **Validation**: Comprehensive input validation with DTOs
3. **Error Handling**: Proper HTTP status codes
4. **Pagination**: Cursor-based pagination on list endpoints
5. **Security**: Rate limiting, CORS, Helmet
6. **Real-time**: WebSocket integration for live updates
7. **Geospatial**: PostGIS for location-based matching
8. **Caching**: Redis for performance
9. **API Docs**: OpenAPI/Swagger specification

---

## 🚀 Next Steps

1. **Explore Swagger UI**: http://localhost:3000/api/docs
2. **Test all endpoints** with different scenarios
3. **Create your own trips and parcels**
4. **Test the matching algorithm** with various routes
5. **Try the messaging system**
6. **Explore admin endpoints**

---

## 💡 Demo Tips

- **Use Postman**: Import OpenAPI spec for easier testing
- **Check logs**: Watch the console for real-time feedback
- **Try edge cases**: Test validation, errors, edge cases
- **Monitor health**: Keep an eye on `/health` endpoint
- **Explore database**: Use `npx prisma studio` to view data

---

## 📞 Support

If you encounter issues:
1. Check [QUICK_START.md](./QUICK_START.md)
2. Review [README.md](./README.md)
3. Check API docs at http://localhost:3000/api/docs
4. Verify Docker containers are running: `docker-compose ps`

---

**Happy Testing! 🎉**
