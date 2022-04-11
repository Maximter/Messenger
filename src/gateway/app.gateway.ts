import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { SocketService } from './app.gateway.service';

@WebSocketGateway()
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly socketService: SocketService) {}

  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('AppGateway');

  @SubscribeMessage('sendFirstMessage')
  async sendFirstMessage(client: Socket, payload: string): Promise<void> {
    await this.socketService.createChat(client, payload);
    
  }

  afterInit(server: Server):void {
    this.logger.log('Init');
  }

  handleDisconnect(client: Socket):void {
    this.socketService.deleteFromOnline(client);
  }

  handleConnection(client: Socket):void {
    this.socketService.pushToOnline(client);
  }
}

    // this.server.emit('msgToClient', payload);