import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(
    authorId: string,
    parcelId: string,
    recipientId: string,
    rating: number,
    comment?: string,
    tags?: string[],
  ) {
    // Verify parcel exists and user is involved
    const parcel = await this.prisma.parcel.findUnique({
      where: { id: parcelId },
      include: { trip: true },
    });

    if (!parcel || parcel.status !== 'DELIVERED') {
      throw new BadRequestException('Can only review completed deliveries');
    }

    // Check if already reviewed
    const existing = await this.prisma.review.findUnique({
      where: {
        parcelId_authorId: {
          parcelId,
          authorId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Already reviewed this delivery');
    }

    const review = await this.prisma.review.create({
      data: {
        parcelId,
        authorId,
        recipientId,
        rating,
        comment,
        tags: tags || [],
      },
    });

    // Update recipient's average rating
    await this.updateUserRating(recipientId);

    return review;
  }

  private async updateUserRating(userId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { recipientId: userId },
    });

    if (reviews.length > 0) {
      const avgRating =
        reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

      await this.prisma.user.update({
        where: { id: userId },
        data: { averageRating: avgRating },
      });
    }
  }
}
