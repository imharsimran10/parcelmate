import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ParcelsService } from './parcels.service';
import { CreateParcelDto } from './dto/create-parcel.dto';
import { UpdateParcelDto } from './dto/update-parcel.dto';
import { SearchParcelsDto } from './dto/search-parcels.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('parcels')
@Controller('parcels')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ParcelsController {
  constructor(private readonly parcelsService: ParcelsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new parcel request' })
  @ApiResponse({ status: 201, description: 'Parcel created successfully' })
  async create(@Request() req, @Body() createParcelDto: CreateParcelDto) {
    return this.parcelsService.create(req.user.id, createParcelDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all parcels for current user' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Parcels retrieved' })
  async findAll(
    @Request() req,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ) {
    return this.parcelsService.findAll(req.user.id, page, limit);
  }

  @Post('search')
  @ApiOperation({ summary: 'Search for parcels' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Parcels found' })
  async search(
    @Body() searchParcelsDto: SearchParcelsDto,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
  ) {
    return this.parcelsService.search(searchParcelsDto, page, limit);
  }

  @Get('match-requests')
  @ApiOperation({ summary: 'Get pending match requests for current user' })
  @ApiResponse({ status: 200, description: 'Match requests retrieved' })
  async getMatchRequests(@Request() req) {
    return this.parcelsService.getMatchRequestsForUser(req.user.id);
  }

  @Get('my-deliveries')
  @ApiOperation({ summary: 'Get all parcels assigned to traveler (for carrying)' })
  @ApiResponse({ status: 200, description: 'Deliveries retrieved' })
  async getMyDeliveries(@Request() req) {
    return this.parcelsService.getMyDeliveries(req.user.id);
  }

  @Get('my-sent-parcels')
  @ApiOperation({ summary: 'Get all sent parcels with assigned travelers' })
  @ApiResponse({ status: 200, description: 'Sent parcels retrieved' })
  async getMySentParcels(@Request() req) {
    return this.parcelsService.getMySentParcels(req.user.id);
  }

  @Post('match-requests/:id/approve')
  @ApiOperation({ summary: 'Approve match request' })
  @ApiResponse({ status: 200, description: 'Match request approved' })
  async approveMatchRequest(@Param('id') id: string, @Request() req) {
    return this.parcelsService.approveMatchRequest(id, req.user.id);
  }

  @Post('match-requests/:id/reject')
  @ApiOperation({ summary: 'Reject match request' })
  @ApiResponse({ status: 200, description: 'Match request rejected' })
  async rejectMatchRequest(@Param('id') id: string, @Request() req) {
    return this.parcelsService.rejectMatchRequest(id, req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get parcel by ID' })
  @ApiResponse({ status: 200, description: 'Parcel found' })
  @ApiResponse({ status: 404, description: 'Parcel not found' })
  async findOne(@Param('id') id: string) {
    return this.parcelsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update parcel' })
  @ApiResponse({ status: 200, description: 'Parcel updated successfully' })
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateParcelDto: UpdateParcelDto,
  ) {
    return this.parcelsService.update(id, req.user.id, updateParcelDto);
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish parcel to find travelers' })
  @ApiResponse({ status: 200, description: 'Parcel published successfully' })
  async publish(@Param('id') id: string, @Request() req) {
    return this.parcelsService.publish(id, req.user.id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel parcel' })
  @ApiResponse({ status: 200, description: 'Parcel cancelled successfully' })
  async cancel(@Param('id') id: string, @Request() req) {
    return this.parcelsService.cancel(id, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete parcel' })
  @ApiResponse({ status: 200, description: 'Parcel deleted successfully' })
  async remove(@Param('id') id: string, @Request() req) {
    return this.parcelsService.remove(id, req.user.id);
  }

  @Post(':id/accept')
  @ApiOperation({ summary: 'Accept parcel for delivery (traveler)' })
  @ApiResponse({ status: 200, description: 'Parcel accepted successfully' })
  async acceptParcel(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { tripId: string },
  ) {
    return this.parcelsService.acceptParcel(id, body.tripId, req.user.id);
  }

  @Post(':id/request')
  @ApiOperation({ summary: 'Request traveler for parcel delivery (sender)' })
  @ApiResponse({ status: 200, description: 'Traveler requested successfully' })
  async requestTraveler(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { tripId: string },
  ) {
    return this.parcelsService.requestTraveler(id, body.tripId, req.user.id);
  }
}
