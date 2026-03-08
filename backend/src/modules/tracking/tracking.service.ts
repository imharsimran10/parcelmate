import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';

@Injectable()
export class TrackingService {
  constructor(private prisma: PrismaService) {}

  async createEvent(
    parcelId: string,
    eventType: string,
    location?: string | null,
    latitude?: number,
    longitude?: number,
    description?: string,
    metadata?: any,
  ) {
    return this.prisma.trackingEvent.create({
      data: {
        parcelId,
        eventType,
        location,
        latitude,
        longitude,
        description,
        metadata,
      },
    });
  }

  async getParcelTracking(parcelId: string) {
    return this.prisma.trackingEvent.findMany({
      where: { parcelId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateLocation(parcelId: string, latitude: number, longitude: number) {
    await this.createEvent(
      parcelId,
      'LOCATION_UPDATE',
      null,
      latitude,
      longitude,
      'Location updated',
    );

    return { success: true, latitude, longitude };
  }
}
