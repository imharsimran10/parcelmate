import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('messages')
@Controller('messages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @ApiOperation({ summary: 'Send a message' })
  async sendMessage(
    @Request() req,
    @Body() body: { receiverId: string; parcelId: string; content: string },
  ) {
    return this.messagesService.sendMessage(
      req.user.id,
      body.receiverId,
      body.parcelId,
      body.content,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all conversations for current user' })
  async getAllConversations(@Request() req) {
    return this.messagesService.getAllConversations(req.user.id);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread message count' })
  async getUnreadCount(@Request() req) {
    return this.messagesService.getUnreadCount(req.user.id);
  }

  @Get('parcel/:parcelId')
  @ApiOperation({ summary: 'Get conversation for a parcel' })
  async getConversation(@Param('parcelId') parcelId: string, @Request() req) {
    return this.messagesService.getConversation(parcelId, req.user.id);
  }

  @Post('parcel/:parcelId/mark-read')
  @ApiOperation({ summary: 'Mark messages as read' })
  async markAsRead(@Param('parcelId') parcelId: string, @Request() req) {
    return this.messagesService.markAsRead(parcelId, req.user.id);
  }
}
