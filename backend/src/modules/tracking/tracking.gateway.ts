import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class TrackingGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('joinParcelTracking')
  handleJoinTracking(
    @MessageBody() data: { parcelId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`parcel_${data.parcelId}`);
    return { event: 'joined', parcelId: data.parcelId };
  }

  @SubscribeMessage('updateLocation')
  handleLocationUpdate(
    @MessageBody() data: { parcelId: string; latitude: number; longitude: number },
  ) {
    this.server.to(`parcel_${data.parcelId}`).emit('locationUpdate', {
      parcelId: data.parcelId,
      latitude: data.latitude,
      longitude: data.longitude,
      timestamp: new Date(),
    });
  }

  broadcastParcelUpdate(parcelId: string, update: any) {
    this.server.to(`parcel_${parcelId}`).emit('parcelUpdate', update);
  }
}
