import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { Prisma } from '@prisma/client';

interface MatchScore {
  tripId: string;
  score: number;
  routeMatch: number;
  timeMatch: number;
  trustScore: number;
  priceMatch: number;
  distance: number;
}

@Injectable()
export class MatchingService {
  constructor(private prisma: PrismaService) {}

  async findMatchesForParcel(parcelId: string) {
    const parcel = await this.prisma.parcel.findUnique({
      where: { id: parcelId },
    });

    if (!parcel) {
      throw new Error('Parcel not found');
    }

    // Find trips that are published and within timeframe
    const trips = await this.prisma.trip.findMany({
      where: {
        status: 'PUBLISHED',
        departureTime: {
          gte: parcel.pickupTimeStart,
          lte: parcel.pickupTimeEnd,
        },
        maxWeight: {
          gte: parcel.weight,
        },
        acceptedSizes: {
          has: parcel.size,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
            trustScore: true,
            averageRating: true,
            isVerified: true,
          },
        },
        parcels: {
          where: {
            status: { notIn: ['CANCELLED', 'DELIVERED'] },
          },
        },
      },
    });

    // Calculate match scores
    const matches: MatchScore[] = trips
      .map((trip) => {
        // Check if trip has capacity
        if (trip.parcels.length >= trip.maxParcels) {
          return null;
        }

        // Calculate route match (origin and destination proximity)
        const originDistance = this.calculateDistance(
          parcel.pickupLat,
          parcel.pickupLng,
          trip.originLat,
          trip.originLng,
        );

        const destDistance = this.calculateDistance(
          parcel.deliveryLat,
          parcel.deliveryLng,
          trip.destLat,
          trip.destLng,
        );

        // Route match score (0-100)
        const maxDeviation = 50; // km
        const avgDistance = (originDistance + destDistance) / 2;
        const routeMatch = Math.max(0, 100 - (avgDistance / maxDeviation) * 100);

        // Time match score (0-100)
        const timeDiff = Math.abs(
          trip.departureTime.getTime() - parcel.pickupTimeStart.getTime(),
        );
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        const timeMatch = Math.max(0, 100 - (hoursDiff / 24) * 100);

        // Trust score (normalized to 0-100)
        const trustScore = trip.user.trustScore;

        // Price match score (0-100)
        const estimatedPrice = this.calculatePrice(
          parcel.weight,
          avgDistance,
          trip.basePricePerKg,
          trip.pricePerKm || 0,
        );
        const priceDiff = Math.abs(parcel.offeredPrice - estimatedPrice);
        const priceMatch = Math.max(0, 100 - (priceDiff / parcel.offeredPrice) * 100);

        // Overall match score
        const score =
          routeMatch * 0.4 + timeMatch * 0.3 + trustScore * 0.2 + priceMatch * 0.1;

        return {
          tripId: trip.id,
          score,
          routeMatch,
          timeMatch,
          trustScore,
          priceMatch,
          distance: avgDistance,
        };
      })
      .filter((match): match is MatchScore => match !== null && match.score > 30) // Min 30% match
      .sort((a, b) => b.score - a.score)
      .slice(0, 10); // Top 10 matches

    // Get full trip details for matches
    const matchedTrips = await this.prisma.trip.findMany({
      where: {
        id: { in: matches.map((m) => m.tripId) },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
            trustScore: true,
            averageRating: true,
            isVerified: true,
            completedTrips: true,
          },
        },
      },
    });

    // Combine trips with match scores
    const results = matches.map((match) => ({
      trip: matchedTrips.find((t) => t.id === match.tripId),
      matchScore: Math.round(match.score),
      details: {
        routeMatch: Math.round(match.routeMatch),
        timeMatch: Math.round(match.timeMatch),
        trustScore: Math.round(match.trustScore),
        priceMatch: Math.round(match.priceMatch),
        distance: Math.round(match.distance * 10) / 10,
      },
    }));

    return results;
  }

  async findMatchesForTrip(tripId: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
    });

    if (!trip) {
      throw new Error('Trip not found');
    }

    // Find parcels that match this trip
    const parcels = await this.prisma.parcel.findMany({
      where: {
        status: 'REQUESTING',
        pickupTimeStart: {
          lte: new Date(trip.departureTime.getTime() + trip.flexibility * 3600000),
        },
        pickupTimeEnd: {
          gte: trip.departureTime,
        },
        weight: {
          lte: trip.maxWeight,
        },
        size: {
          in: trip.acceptedSizes as any,
        },
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
            trustScore: true,
            averageRating: true,
          },
        },
      },
    }) as Array<Prisma.ParcelGetPayload<{
      include: { sender: { select: { id: true; firstName: true; lastName: true; profilePhoto: true; trustScore: true; averageRating: true } } }
    }>>;

    // Calculate match scores for each parcel
    const matches = parcels
      .map((parcel) => {
        const originDistance = this.calculateDistance(
          parcel.pickupLat,
          parcel.pickupLng,
          trip.originLat,
          trip.originLng,
        );

        const destDistance = this.calculateDistance(
          parcel.deliveryLat,
          parcel.deliveryLng,
          trip.destLat,
          trip.destLng,
        );

        const maxDeviation = 50;
        const avgDistance = (originDistance + destDistance) / 2;
        const routeMatch = Math.max(0, 100 - (avgDistance / maxDeviation) * 100);

        const timeDiff = Math.abs(
          trip.departureTime.getTime() - parcel.pickupTimeStart.getTime(),
        );
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        const timeMatch = Math.max(0, 100 - (hoursDiff / 24) * 100);

        const trustScore = parcel.sender.trustScore || 50;

        const estimatedPrice = this.calculatePrice(
          parcel.weight,
          avgDistance,
          trip.basePricePerKg,
          trip.pricePerKm || 0,
        );
        const priceDiff = Math.abs(parcel.offeredPrice - estimatedPrice);
        const priceMatch = Math.max(0, 100 - (priceDiff / parcel.offeredPrice) * 100);

        const score =
          routeMatch * 0.4 + timeMatch * 0.3 + trustScore * 0.2 + priceMatch * 0.1;

        return {
          parcel,
          matchScore: Math.round(score),
          details: {
            routeMatch: Math.round(routeMatch),
            timeMatch: Math.round(timeMatch),
            trustScore: Math.round(trustScore),
            priceMatch: Math.round(priceMatch),
            distance: Math.round(avgDistance * 10) / 10,
          },
        };
      })
      .filter((match) => match.matchScore > 30)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 20);

    return matches;
  }

  async acceptMatch(parcelId: string, tripId: string, travelerId: string) {
    // Verify trip ownership
    const trip = await this.prisma.trip.findFirst({
      where: { id: tripId, userId: travelerId },
    });

    if (!trip) {
      throw new Error('Trip not found or unauthorized');
    }

    // Update parcel with trip
    const parcel = await this.prisma.parcel.update({
      where: { id: parcelId },
      data: {
        tripId,
        status: 'MATCHED',
      },
      include: {
        sender: true,
        trip: {
          include: {
            user: true,
          },
        },
      },
    });

    // TODO: Create notification for sender
    // TODO: Create tracking event

    return parcel;
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private calculatePrice(
    weight: number,
    distance: number,
    basePricePerKg: number,
    pricePerKm: number,
  ): number {
    return weight * basePricePerKg + distance * pricePerKm;
  }
}
