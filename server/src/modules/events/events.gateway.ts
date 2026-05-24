import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        this.logger.warn(`Connection rejected: No token provided (clientId: ${client.id})`);
        client.disconnect();
        return;
      }

      const secret = this.configService.get('JWT_SECRET', 'cashflow-jwt-secret-key-2024');
      const payload = this.jwtService.verify(token, { secret });

      client.data.user = payload;
      this.logger.log(`Client authenticated: user ${payload.email} (role: ${payload.role})`);

      // 1. Join user-specific room
      client.join(`user_${payload.sub}`);

      // 2. Join role-specific rooms
      if (payload.role === 'OWNER') {
        client.join('owners');
        this.logger.log(`Client ${client.id} joined 'owners' room`);
      } else if (payload.role === 'SUPERVISOR') {
        // Automatically join assigned site room
        const site = await this.prisma.site.findFirst({
          where: { supervisorId: payload.sub },
        });
        if (site) {
          client.join(`site_${site.id}`);
          this.logger.log(`Client ${client.id} automatically joined room 'site_${site.id}'`);
        }
      }
    } catch (err: any) {
      this.logger.error(`Connection rejected: Verification failed - ${err.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_site')
  async handleJoinSite(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { siteId: string },
  ) {
    if (!client.data.user) {
      return { success: false, error: 'Unauthorized' };
    }
    const { siteId } = data;
    if (siteId) {
      client.join(`site_${siteId}`);
      this.logger.log(`Client ${client.id} joined room 'site_${siteId}' on demand`);
      return { success: true };
    }
    return { success: false, error: 'No siteId provided' };
  }

  // Helper to emit updates
  sendDashboardUpdate(siteId: string) {
    this.logger.log(`Broadcasting dashboard update for site: ${siteId}`);
    // Emit to owners
    this.server.to('owners').emit('owner_dashboard_update');
    // Emit to supervisor of that specific site
    if (siteId) {
      this.server.to(`site_${siteId}`).emit('supervisor_dashboard_update', { siteId });
    }
  }

  sendNotificationUpdate(userId: string) {
    this.logger.log(`Emitting notification update to user: ${userId}`);
    this.server.to(`user_${userId}`).emit('notification_update');
  }
}
