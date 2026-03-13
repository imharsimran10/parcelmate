import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        profilePhoto: true,
        dateOfBirth: true,
        bio: true,
        languages: true,
        address: true,
        city: true,
        state: true,
        country: true,
        postalCode: true,
        emergencyContactName: true,
        emergencyContactPhone: true,
        emergencyContactRelation: true,
        idDocumentUrl: true,
        driverLicenseUrl: true,
        proofOfAddressUrl: true,
        trustScore: true,
        isVerified: true,
        verificationLevel: true,
        completedTrips: true,
        completedDeliveries: true,
        averageRating: true,
        responseTime: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        trustScore: true,
        isVerified: true,
        averageRating: true,
      },
    });
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    // Convert dateOfBirth string to Date if provided
    const data: any = { ...updateProfileDto };
    if (data.dateOfBirth) {
      data.dateOfBirth = new Date(data.dateOfBirth);
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        profilePhoto: true,
        dateOfBirth: true,
        bio: true,
        languages: true,
        address: true,
        city: true,
        state: true,
        country: true,
        postalCode: true,
        emergencyContactName: true,
        emergencyContactPhone: true,
        emergencyContactRelation: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async updatePassword(userId: string, updatePasswordDto: UpdatePasswordDto) {
    const { currentPassword, newPassword } = updatePasswordDto;

    // Get user with password
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { message: 'Password updated successfully' };
  }

  async uploadProfilePhoto(userId: string, photoUrl: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { profilePhoto: photoUrl },
      select: {
        id: true,
        profilePhoto: true,
      },
    });

    return user;
  }

  async getUserStatistics(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        trustScore: true,
        completedTrips: true,
        completedDeliveries: true,
        averageRating: true,
        responseTime: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get additional statistics with error handling for new users
    try {
      const [totalEarnings, receivedReviews, givenReviews] = await Promise.all([
        this.prisma.payment.aggregate({
          where: {
            senderId: userId,
            status: 'RELEASED',
          },
          _sum: {
            parcelFee: true,
          },
        }).catch(() => ({ _sum: { parcelFee: null } })),
        this.prisma.review.count({
          where: { recipientId: userId },
        }).catch(() => 0),
        this.prisma.review.count({
          where: { authorId: userId },
        }).catch(() => 0),
      ]);

      return {
        ...user,
        totalEarnings: totalEarnings._sum.parcelFee || 0,
        receivedReviews,
        givenReviews,
      };
    } catch (error) {
      // Return default statistics if queries fail
      return {
        ...user,
        totalEarnings: 0,
        receivedReviews: 0,
        givenReviews: 0,
      };
    }
  }

  async getUserReviews(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { recipientId: userId },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePhoto: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.review.count({
        where: { recipientId: userId },
      }),
    ]);

    return {
      data: reviews,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async searchUsers(query: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: {
          OR: [
            { firstName: { contains: query, mode: 'insensitive' } },
            { lastName: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
          status: 'ACTIVE',
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profilePhoto: true,
          trustScore: true,
          isVerified: true,
          averageRating: true,
        },
        skip,
        take: limit,
      }),
      this.prisma.user.count({
        where: {
          OR: [
            { firstName: { contains: query, mode: 'insensitive' } },
            { lastName: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
          status: 'ACTIVE',
        },
      }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async deleteAccount(userId: string) {
    // Check if user has active trips or parcels
    const [activeTrips, activeParcels] = await Promise.all([
      this.prisma.trip.count({
        where: {
          userId,
          status: { in: ['PUBLISHED', 'IN_PROGRESS'] },
        },
      }),
      this.prisma.parcel.count({
        where: {
          senderId: userId,
          status: { in: ['REQUESTING', 'MATCHED', 'PICKED_UP', 'IN_TRANSIT'] },
        },
      }),
    ]);

    if (activeTrips > 0 || activeParcels > 0) {
      throw new BadRequestException(
        'Cannot delete account with active trips or parcels',
      );
    }

    // Soft delete by updating status
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        status: 'SUSPENDED',
        email: `deleted_${userId}@deleted.com`,
      },
    });

    return { message: 'Account deleted successfully' };
  }

  /**
   * Calculate and update user trust score based on multiple factors
   * Trust Score Formula:
   * - Email verified: +5
   * - Phone verified: +5
   * - ID verified: +10
   * - Completed deliveries: +2 each
   * - Positive reviews (4-5 stars): +3 each
   * - Negative reviews (1-2 stars): -5 each
   * - On-time delivery rate: +20 if > 90%, +10 if > 75%
   * - Low cancellation rate: +10 if < 10%
   * - Fast response time: +5 if < 60 minutes
   */
  async calculateTrustScore(userId: string): Promise<number> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        isVerified: true,
        verificationLevel: true,
        completedDeliveries: true,
        responseTime: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let trustScore = 0;

    // Base verification points
    if (user.isVerified) {
      trustScore += 5; // Email verified
    }

    // ID verification bonus
    if (user.verificationLevel === 'VERIFIED') {
      trustScore += 10;
    }

    // Completed deliveries bonus (2 points each, max 50 points)
    trustScore += Math.min(user.completedDeliveries * 2, 50);

    // Get review statistics
    const [positiveReviews, negativeReviews, totalReviews] = await Promise.all([
      this.prisma.review.count({
        where: {
          recipientId: userId,
          rating: { gte: 4 },
        },
      }),
      this.prisma.review.count({
        where: {
          recipientId: userId,
          rating: { lte: 2 },
        },
      }),
      this.prisma.review.count({
        where: { recipientId: userId },
      }),
    ]);

    // Positive reviews bonus (3 points each, max 30 points)
    trustScore += Math.min(positiveReviews * 3, 30);

    // Negative reviews penalty (5 points each)
    trustScore -= negativeReviews * 5;

    // Calculate on-time delivery rate
    const onTimeDeliveries = await this.prisma.parcel.count({
      where: {
        OR: [
          { senderId: userId },
          { trip: { userId } },
        ],
        status: 'DELIVERED',
        // Assuming we track delivery time vs expected time
      },
    });

    if (user.completedDeliveries > 0) {
      const onTimeRate = (onTimeDeliveries / user.completedDeliveries) * 100;
      if (onTimeRate > 90) {
        trustScore += 20;
      } else if (onTimeRate > 75) {
        trustScore += 10;
      }
    }

    // Cancellation rate penalty
    const cancelledCount = await this.prisma.parcel.count({
      where: {
        senderId: userId,
        status: 'CANCELLED',
      },
    });

    const totalParcels = await this.prisma.parcel.count({
      where: { senderId: userId },
    });

    if (totalParcels > 0) {
      const cancellationRate = (cancelledCount / totalParcels) * 100;
      if (cancellationRate < 10) {
        trustScore += 10;
      }
    }

    // Fast response time bonus
    if (user.responseTime && user.responseTime < 60) {
      trustScore += 5;
    }

    // Ensure trust score is non-negative and capped at 100
    trustScore = Math.max(0, Math.min(trustScore, 100));

    // Update user trust score
    await this.prisma.user.update({
      where: { id: userId },
      data: { trustScore },
    });

    return trustScore;
  }

  /**
   * Get trust score level and badge based on score
   */
  getTrustScoreLevel(score: number): {
    level: string;
    badge: string;
    color: string;
  } {
    if (score >= 80) {
      return { level: 'Excellent', badge: '⭐⭐⭐⭐⭐', color: 'green' };
    } else if (score >= 60) {
      return { level: 'Very Good', badge: '⭐⭐⭐⭐', color: 'blue' };
    } else if (score >= 40) {
      return { level: 'Good', badge: '⭐⭐⭐', color: 'yellow' };
    } else if (score >= 20) {
      return { level: 'Fair', badge: '⭐⭐', color: 'orange' };
    } else {
      return { level: 'New User', badge: '⭐', color: 'gray' };
    }
  }
}
