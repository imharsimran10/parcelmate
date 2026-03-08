import { PartialType, ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CreateParcelDto } from './create-parcel.dto';

export class UpdateParcelDto extends PartialType(CreateParcelDto) {
  @ApiProperty({ required: false, description: 'Trip ID to assign parcel to' })
  @IsOptional()
  @IsString()
  tripId?: string;
}
