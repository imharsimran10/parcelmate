import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  async getProfile(@Request() req) {
    return this.usersService.findById(req.user.id);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.id, updateProfileDto);
  }

  @Put('password')
  @ApiOperation({ summary: 'Update user password' })
  @ApiResponse({ status: 200, description: 'Password updated successfully' })
  async updatePassword(@Request() req, @Body() updatePasswordDto: UpdatePasswordDto) {
    return this.usersService.updatePassword(req.user.id, updatePasswordDto);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get user statistics' })
  @ApiResponse({ status: 200, description: 'User statistics retrieved' })
  async getStatistics(@Request() req) {
    return this.usersService.getUserStatistics(req.user.id);
  }

  @Get('reviews')
  @ApiOperation({ summary: 'Get user reviews' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Reviews retrieved' })
  async getReviews(
    @Request() req,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ) {
    return this.usersService.getUserReviews(req.user.id, page, limit);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search users' })
  @ApiQuery({ name: 'q', required: true, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Users found' })
  async searchUsers(
    @Query('q') query: string,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ) {
    return this.usersService.searchUsers(query, page, limit);
  }

  @Get('trust-score/level')
  @ApiOperation({ summary: 'Get trust score level information' })
  @ApiResponse({ status: 200, description: 'Trust score level retrieved' })
  async getTrustScoreLevel(@Request() req) {
    const user = await this.usersService.findById(req.user.id);
    const level = this.usersService.getTrustScoreLevel(user.trustScore);
    return {
      trustScore: user.trustScore,
      ...level,
    };
  }

  @Put('trust-score/calculate')
  @ApiOperation({ summary: 'Calculate and update trust score' })
  @ApiResponse({ status: 200, description: 'Trust score calculated' })
  async calculateTrustScore(@Request() req) {
    const score = await this.usersService.calculateTrustScore(req.user.id);
    const level = this.usersService.getTrustScoreLevel(score);
    return {
      trustScore: score,
      ...level,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Post('upload-photo')
  @ApiOperation({ summary: 'Upload profile photo' })
  @ApiResponse({ status: 200, description: 'Photo uploaded successfully' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadPhoto(@Request() req, @UploadedFile() file: Express.Multer.File) {
    // In production, upload to S3/Cloud Storage
    // For now, just return a mock URL
    const photoUrl = `/uploads/profile-photos/${req.user.id}-${Date.now()}.jpg`;
    return this.usersService.uploadProfilePhoto(req.user.id, photoUrl);
  }

  @Post('upload-document')
  @ApiOperation({ summary: 'Upload verification document' })
  @ApiResponse({ status: 200, description: 'Document uploaded successfully' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body('documentType') documentType: string,
  ) {
    // In production, upload to S3/Cloud Storage
    // For now, just return a mock URL
    const documentUrl = `/uploads/documents/${req.user.id}-${documentType}-${Date.now()}.pdf`;

    // Update user with document URL based on type
    const updateData: any = {};
    if (documentType === 'id') {
      updateData.idDocumentUrl = documentUrl;
    } else if (documentType === 'license') {
      updateData.driverLicenseUrl = documentUrl;
    } else if (documentType === 'address') {
      updateData.proofOfAddressUrl = documentUrl;
    }

    await this.usersService.updateProfile(req.user.id, updateData);
    return { url: documentUrl, type: documentType };
  }

  @Delete('account')
  @ApiOperation({ summary: 'Delete user account' })
  @ApiResponse({ status: 200, description: 'Account deleted successfully' })
  async deleteAccount(@Request() req) {
    return this.usersService.deleteAccount(req.user.id);
  }
}
