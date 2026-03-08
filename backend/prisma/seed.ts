import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo users
  const password = await bcrypt.hash('Demo123!', 10);

  const traveler1 = await prisma.user.upsert({
    where: { email: 'traveler1@demo.com' },
    update: {},
    create: {
      email: 'traveler1@demo.com',
      passwordHash: password,
      firstName: 'Sarah',
      lastName: 'Johnson',
      phone: '+14155551001',
      trustScore: 85,
      isVerified: true,
      verificationLevel: 'VERIFIED',
      status: 'ACTIVE',
      completedTrips: 15,
      averageRating: 4.8,
    },
  });

  const traveler2 = await prisma.user.upsert({
    where: { email: 'traveler2@demo.com' },
    update: {},
    create: {
      email: 'traveler2@demo.com',
      passwordHash: password,
      firstName: 'Michael',
      lastName: 'Chen',
      phone: '+14155551002',
      trustScore: 92,
      isVerified: true,
      verificationLevel: 'VERIFIED',
      status: 'ACTIVE',
      completedTrips: 28,
      averageRating: 4.9,
    },
  });

  const sender1 = await prisma.user.upsert({
    where: { email: 'sender1@demo.com' },
    update: {},
    create: {
      email: 'sender1@demo.com',
      passwordHash: password,
      firstName: 'Emily',
      lastName: 'Rodriguez',
      phone: '+14155551003',
      trustScore: 78,
      isVerified: true,
      verificationLevel: 'VERIFIED',
      status: 'ACTIVE',
      completedDeliveries: 10,
      averageRating: 4.7,
    },
  });

  const sender2 = await prisma.user.upsert({
    where: { email: 'sender2@demo.com' },
    update: {},
    create: {
      email: 'sender2@demo.com',
      passwordHash: password,
      firstName: 'David',
      lastName: 'Williams',
      phone: '+14155551004',
      trustScore: 65,
      isVerified: true,
      verificationLevel: 'VERIFIED',
      status: 'ACTIVE',
      completedDeliveries: 5,
      averageRating: 4.5,
    },
  });

  console.log('✅ Created demo users');

  // Create demo trips
  const trip1 = await prisma.trip.create({
    data: {
      userId: traveler1.id,
      originAddress: 'New York, NY, USA',
      originLat: 40.7128,
      originLng: -74.006,
      destAddress: 'Boston, MA, USA',
      destLat: 42.3601,
      destLng: -71.0589,
      departureTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      flexibility: 2,
      maxParcels: 3,
      maxWeight: 10,
      acceptedSizes: ['DOCUMENT', 'SMALL', 'MEDIUM'],
      basePricePerKg: 12,
      pricePerKm: 0.5,
      description: 'Driving to Boston for business, happy to help!',
      transportMode: 'CAR',
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  });

  const trip2 = await prisma.trip.create({
    data: {
      userId: traveler2.id,
      originAddress: 'San Francisco, CA, USA',
      originLat: 37.7749,
      originLng: -122.4194,
      destAddress: 'Los Angeles, CA, USA',
      destLat: 34.0522,
      destLng: -118.2437,
      departureTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      flexibility: 4,
      maxParcels: 2,
      maxWeight: 5,
      acceptedSizes: ['DOCUMENT', 'SMALL'],
      basePricePerKg: 15,
      pricePerKm: 0.6,
      description: 'Regular route, can deliver on time',
      transportMode: 'CAR',
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  });

  const trip3 = await prisma.trip.create({
    data: {
      userId: traveler1.id,
      originAddress: 'Chicago, IL, USA',
      originLat: 41.8781,
      originLng: -87.6298,
      destAddress: 'Detroit, MI, USA',
      destLat: 42.3314,
      destLng: -83.0458,
      departureTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      flexibility: 3,
      maxParcels: 4,
      maxWeight: 15,
      acceptedSizes: ['DOCUMENT', 'SMALL', 'MEDIUM'],
      basePricePerKg: 10,
      pricePerKm: 0.4,
      description: 'Weekend trip, flexible timing',
      transportMode: 'CAR',
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  });

  console.log('✅ Created demo trips');

  // Create demo parcels
  const parcel1 = await prisma.parcel.create({
    data: {
      senderId: sender1.id,
      recipientName: 'John Smith',
      recipientPhone: '+16175552001',
      recipientEmail: 'john.smith@example.com',
      pickupAddress: 'Manhattan, New York, NY, USA',
      pickupLat: 40.7589,
      pickupLng: -73.9851,
      deliveryAddress: 'Back Bay, Boston, MA, USA',
      deliveryLat: 42.3505,
      deliveryLng: -71.0765,
      title: 'Important Documents',
      description: 'Legal documents that need to arrive urgently',
      size: 'DOCUMENT',
      weight: 0.5,
      declaredValue: 100,
      pickupTimeStart: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      pickupTimeEnd: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
      urgency: 'URGENT',
      offeredPrice: 30,
      status: 'REQUESTING',
    },
  });

  const parcel2 = await prisma.parcel.create({
    data: {
      senderId: sender2.id,
      recipientName: 'Lisa Anderson',
      recipientPhone: '+13105552002',
      recipientEmail: 'lisa.anderson@example.com',
      pickupAddress: 'Downtown San Francisco, CA, USA',
      pickupLat: 37.7937,
      pickupLng: -122.3965,
      deliveryAddress: 'Santa Monica, Los Angeles, CA, USA',
      deliveryLat: 34.0195,
      deliveryLng: -118.4912,
      title: 'Small Electronics',
      description: 'Laptop charger and accessories',
      size: 'SMALL',
      weight: 1.2,
      declaredValue: 150,
      pickupTimeStart: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      pickupTimeEnd: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
      urgency: 'STANDARD',
      offeredPrice: 25,
      status: 'REQUESTING',
    },
  });

  console.log('✅ Created demo parcels');

  // Create a matched delivery
  const matchedParcel = await prisma.parcel.create({
    data: {
      senderId: sender1.id,
      tripId: trip1.id,
      recipientName: 'Robert Brown',
      recipientPhone: '+16175552003',
      recipientEmail: 'robert.brown@example.com',
      pickupAddress: 'Brooklyn, New York, NY, USA',
      pickupLat: 40.6782,
      pickupLng: -73.9442,
      deliveryAddress: 'Cambridge, Boston, MA, USA',
      deliveryLat: 42.3736,
      deliveryLng: -71.1097,
      title: 'Books and Documents',
      description: 'Collection of textbooks for college',
      size: 'MEDIUM',
      weight: 3.5,
      declaredValue: 200,
      pickupTimeStart: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      pickupTimeEnd: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
      urgency: 'STANDARD',
      offeredPrice: 45,
      status: 'MATCHED',
      matchScore: 87,
    },
  });

  // Create tracking events for matched parcel
  await prisma.trackingEvent.createMany({
    data: [
      {
        parcelId: matchedParcel.id,
        eventType: 'CREATED',
        description: 'Parcel request created',
      },
      {
        parcelId: matchedParcel.id,
        eventType: 'MATCHED',
        description: 'Matched with traveler',
      },
    ],
  });

  console.log('✅ Created matched delivery with tracking');

  // Create some reviews
  await prisma.review.createMany({
    data: [
      {
        parcelId: matchedParcel.id,
        authorId: sender1.id,
        recipientId: traveler1.id,
        rating: 5,
        comment: 'Excellent service! Very professional and on time.',
        tags: ['FAST', 'PROFESSIONAL', 'FRIENDLY'],
      },
    ],
  });

  console.log('✅ Created reviews');

  // Create notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: traveler1.id,
        type: 'PARCEL_REQUEST',
        title: 'New Parcel Request',
        message: 'A parcel matches your trip to Boston',
        data: { parcelId: parcel1.id },
      },
      {
        userId: sender1.id,
        type: 'TRIP_MATCH',
        title: 'Trip Match Found',
        message: 'We found a traveler for your parcel',
        data: { tripId: trip1.id },
      },
    ],
  });

  console.log('✅ Created notifications');

  console.log('\n🎉 Database seeded successfully!\n');
  console.log('Demo Accounts:');
  console.log('━'.repeat(50));
  console.log('Travelers:');
  console.log('  📧 traveler1@demo.com | 🔑 Demo123!');
  console.log('  📧 traveler2@demo.com | 🔑 Demo123!');
  console.log('\nSenders:');
  console.log('  📧 sender1@demo.com | 🔑 Demo123!');
  console.log('  📧 sender2@demo.com | 🔑 Demo123!');
  console.log('━'.repeat(50));
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
