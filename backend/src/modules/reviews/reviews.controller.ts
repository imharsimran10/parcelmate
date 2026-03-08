import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('reviews')
@Controller('reviews')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a review' })
  async create(
    @Request() req,
    @Body()
    body: {
      parcelId: string;
      recipientId: string;
      rating: number;
      comment?: string;
      tags?: string[];
    },
  ) {
    return this.reviewsService.create(
      req.user.id,
      body.parcelId,
      body.recipientId,
      body.rating,
      body.comment,
      body.tags,
    );
  }
}
