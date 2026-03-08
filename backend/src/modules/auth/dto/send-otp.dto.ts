import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, IsPhoneNumber } from 'class-validator';

export class SendOtpDto {
  @ApiProperty({ example: 'john.doe@example.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '+919876543210', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'email' })
  @IsString()
  type: 'email' | 'phone';
}
