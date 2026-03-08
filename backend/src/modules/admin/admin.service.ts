import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [totalUsers, totalTrips, totalParcels, activeDeliveries] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.trip.count(),
        this.prisma.parcel.count(),
        this.prisma.parcel.count({
          where: {
            status: { in: ['MATCHED', 'PICKED_UP', 'IN_TRANSIT'] },
          },
        }),
      ]);

    return {
      totalUsers,
      totalTrips,
      totalParcels,
      activeDeliveries,
    };
  }

  async getAllUsers(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          trustScore: true,
          isVerified: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count(),
    ]);

    return {
      data: users,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async suspendUser(userId: string, reason: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { status: 'SUSPENDED' },
    });
  }

  async activateUser(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { status: 'ACTIVE' },
    });
  }
}
