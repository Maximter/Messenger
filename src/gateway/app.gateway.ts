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
import * as online from '../online';

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
    if (!(await this.socketService.createChat(client, payload))) {
    }
  }

  @SubscribeMessage('sendMessage')
  async sendMessage(client: Socket, payload: string): Promise<void> {
    this.socketService.saveMessageToDB(client, payload);
    const token = await this.socketService.getInterlocutorsToken(
      client,
      payload[1],
    );

    token.forEach((element) => {
      this.server.to(element).emit('getMessage', payload[0], payload[1]);
    });
  }

  @SubscribeMessage('isTyping')
  async isTyping(client: Socket, payload: string): Promise<void> {
    const token = await this.socketService.getInterlocutorsToken(
      client,
      payload,
    );

    token.forEach((element) => {
      this.server.to(element).emit('getTyping', payload);
    });
  }

  @SubscribeMessage('read')
  async read(client: Socket, payload: string): Promise<void> {
    const token = await this.socketService.getInterlocutorsToken(
      client,
      payload,
    );

    token.forEach((element) => {
      this.server.to(element).emit('getRead', payload);
    });
  }

  afterInit(server: Server): void {
    this.logger.log('Init');
  }

  async handleDisconnect(client: Socket): Promise<void> {
    this.socketService.deleteFromOnline(client);
    const interlocutors = await this.socketService.getAllUserInterlocutors(
      client,
    );

    interlocutors.forEach((element) => {
      if (online[`${element['token']}`]) {
        for (let i = 0; i < online[`${element['token']}`].length; i++) {
          this.server
            .to(online[`${element['token']}`][i])
            .emit('changeStatus', interlocutors[i]['id_chat'], 'delete');
        }
      }
    });
  }

  async handleConnection(client: Socket): Promise<void> {
    this.socketService.pushToOnline(client);
    const interlocutors = await this.socketService.getAllUserInterlocutors(
      client,
    );

    interlocutors.forEach((element) => {
      if (online[`${element['token']}`]) {
        for (let i = 0; i < online[`${element['token']}`].length; i++) {
          this.server
            .to(online[`${element['token']}`][i])
            .emit('changeStatus', interlocutors[i]['id_chat'], 'add');
        }
      }
    });
  }
}
