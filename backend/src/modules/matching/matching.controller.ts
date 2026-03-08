import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MatchingService } from './matching.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('matching')
@Controller('matching')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Get('parcel/:id')
  @ApiOperation({ summary: 'Find matching trips for a parcel' })
  @ApiResponse({ status: 200, description: 'Matches found' })
  async findMatchesForParcel(@Param('id') id: string) {
    return this.matchingService.findMatchesForParcel(id);
  }

  @Get('trip/:id')
  @ApiOperation({ summary: 'Find matching parcels for a trip' })
  @ApiResponse({ status: 200, description: 'Matches found' })
  async findMatchesForTrip(@Param('id') id: string) {
    return this.matchingService.findMatchesForTrip(id);
  }

  @Post('accept/:parcelId/:tripId')
  @ApiOperation({ summary: 'Accept a match (traveler accepts parcel)' })
  @ApiResponse({ status: 200, description: 'Match accepted' })
  async acceptMatch(
    @Param('parcelId') parcelId: string,
    @Param('tripId') tripId: string,
    @Request() req,
  ) {
    return this.matchingService.acceptMatch(parcelId, tripId, req.user.id);
  }
}
