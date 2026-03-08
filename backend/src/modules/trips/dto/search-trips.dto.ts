import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsDateString,
  IsInt,
  Min,
  IsString,
} from 'class-validator';

export class SearchTripsDto {
  @ApiProperty({ example: 40.7128 })
  @IsNumber()
  originLat: number;

  @ApiProperty({ example: -74.006 })
  @IsNumber()
  originLng: number;

  @ApiProperty({ example: 37.7749 })
  @IsNumber()
  destLat: number;

  @ApiProperty({ example: -122.4194 })
  @IsNumber()
  destLng: number;

  @ApiProperty({ example: 50, description: 'Search radius in km', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  radiusKm?: number;

  @ApiProperty({ example: '2024-12-20T00:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  departureAfter?: string;

  @ApiProperty({ example: '2024-12-31T23:59:59Z', required: false })
  @IsOptional()
  @IsDateString()
  departureBefore?: string;

  @ApiProperty({ example: 50, description: 'Minimum trust score', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  minTrustScore?: number;

  @ApiProperty({ example: 'CAR', required: false })
  @IsOptional()
  @IsString()
  transportMode?: string;
}
