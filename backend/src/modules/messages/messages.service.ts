import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async sendMessage(
    senderId: string,
    receiverId: string,
    parcelId: string,
    content: string,
  ) {
    const message = await this.prisma.message.create({
      data: {
        senderId,
        receiverId,
        parcelId,
        content,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
          },
        },
      },
    });

    return message;
  }

  async getConversation(parcelId: string, userId: string) {
    const messages = await this.prisma.message.findMany({
      where: {
        parcelId,
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
          },
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Mark as read
    await this.prisma.message.updateMany({
      where: {
        parcelId,
        receiverId: userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    return messages;
  }

  async getAllConversations(userId: string) {
    // Get all parcels where user is involved (as sender or traveler)
    const parcels = await this.prisma.parcel.findMany({
      where: {
        OR: [
          { senderId: userId },
          { trip: { userId: userId } },
        ],
        status: { in: ['MATCHED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'] },
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
          },
        },
        trip: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePhoto: true,
              },
            },
          },
        },
      },
    });

    // Get last message and unread count for each parcel
    const conversationsWithMessages = await Promise.all(
      parcels.map(async (parcel) => {
        const lastMessage = await this.prisma.message.findFirst({
          where: { parcelId: parcel.id },
          orderBy: { createdAt: 'desc' },
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePhoto: true,
              },
            },
          },
        });

        const unreadCount = await this.prisma.message.count({
          where: {
            parcelId: parcel.id,
            receiverId: userId,
            isRead: false,
          },
        });

        // Determine the other user in conversation
        const otherUser = parcel.senderId === userId
          ? parcel.trip?.user
          : parcel.sender;

        // Determine current user's role in this parcel
        const userRole = parcel.senderId === userId ? 'sender' : 'traveller';

        return {
          parcelId: parcel.id,
          parcelTitle: parcel.title,
          parcelStatus: parcel.status,
          userRole,
          otherUser,
          lastMessage,
          unreadCount,
          updatedAt: lastMessage?.createdAt || parcel.updatedAt,
        };
      })
    );

    // Return all conversations, including those without messages, sorted by latest
    return conversationsWithMessages
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async markAsRead(parcelId: string, userId: string) {
    await this.prisma.message.updateMany({
      where: {
        parcelId,
        receiverId: userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    return { success: true };
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.message.count({
      where: {
        receiverId: userId,
        isRead: false,
      },
    });

    return { count };
  }
}
