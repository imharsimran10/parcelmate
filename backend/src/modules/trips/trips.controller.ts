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
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { SearchTripsDto } from './dto/search-trips.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('trips')
@Controller('trips')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new trip' })
  @ApiResponse({ status: 201, description: 'Trip created successfully' })
  async create(@Request() req, @Body() createTripDto: CreateTripDto) {
    return this.tripsService.create(req.user.id, createTripDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all trips for current user' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Trips retrieved' })
  async findAll(
    @Request() req,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ) {
    return this.tripsService.findAll(req.user.id, page, limit);
  }

  @Post('search')
  @ApiOperation({ summary: 'Search for trips' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Trips found' })
  async search(
    @Body() searchTripsDto: SearchTripsDto,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
  ) {
    return this.tripsService.search(searchTripsDto, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get trip by ID' })
  @ApiResponse({ status: 200, description: 'Trip found' })
  @ApiResponse({ status: 404, description: 'Trip not found' })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.tripsService.findOne(id, req.user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update trip' })
  @ApiResponse({ status: 200, description: 'Trip updated successfully' })
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateTripDto: UpdateTripDto,
  ) {
    return this.tripsService.update(id, req.user.id, updateTripDto);
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish trip to make it available for matching' })
  @ApiResponse({ status: 200, description: 'Trip published successfully' })
  async publish(@Param('id') id: string, @Request() req) {
    return this.tripsService.publish(id, req.user.id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel trip' })
  @ApiResponse({ status: 200, description: 'Trip cancelled successfully' })
  async cancel(@Param('id') id: string, @Request() req) {
    return this.tripsService.cancel(id, req.user.id);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Mark trip as completed' })
  @ApiResponse({ status: 200, description: 'Trip completed successfully' })
  async complete(@Param('id') id: string, @Request() req) {
    return this.tripsService.complete(id, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete trip' })
  @ApiResponse({ status: 200, description: 'Trip deleted successfully' })
  async remove(@Param('id') id: string, @Request() req) {
    return this.tripsService.remove(id, req.user.id);
  }
}
