import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TrackingService } from './tracking.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('tracking')
@Controller('tracking')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Get('parcel/:id')
  @ApiOperation({ summary: 'Get tracking events for a parcel' })
  async getParcelTracking(@Param('id') id: string) {
    return this.trackingService.getParcelTracking(id);
  }

  @Post('location')
  @ApiOperation({ summary: 'Update parcel location' })
  async updateLocation(
    @Body() body: { parcelId: string; latitude: number; longitude: number },
  ) {
    return this.trackingService.updateLocation(
      body.parcelId,
      body.latitude,
      body.longitude,
    );
  }
}
