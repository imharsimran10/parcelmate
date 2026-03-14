import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, MinLength, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';

// Helper to transform empty strings to undefined
const TransformEmptyStringToUndefined = () =>
  Transform(({ value }) => (value === '' ? undefined : value));

export class UpdateProfileDto {
  @ApiProperty({ example: 'John', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  firstName?: string;

  @ApiProperty({ example: 'Doe', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  lastName?: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: '1990-01-01', required: false })
  @IsOptional()
  @IsDateString()
  @TransformEmptyStringToUndefined()
  dateOfBirth?: string;

  @ApiProperty({ example: 'Passionate traveler and reliable courier', required: false })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ example: ['English', 'Spanish', 'French'], required: false })
  @IsOptional()
  @IsArray()
  languages?: string[];

  @ApiProperty({ example: '123 Main St', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'New York', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: 'NY', required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ example: 'USA', required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ example: '10001', required: false })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiProperty({ example: 'Jane Doe', required: false })
  @IsOptional()
  @IsString()
  emergencyContactName?: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsOptional()
  @IsString()
  emergencyContactPhone?: string;

  @ApiProperty({ example: 'Sister', required: false })
  @IsOptional()
  @IsString()
  emergencyContactRelation?: string;
}
