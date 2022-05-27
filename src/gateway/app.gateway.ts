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
    const existed_chat = await this.socketService.createChat(client, payload);
    if (existed_chat['exist'])
      this.sendMessage(client, [payload[0], existed_chat['id_chat']]);
    else {
      const interlocutorInfo = await this.socketService.getInterlocutorsInfo(payload[1], payload[0]);
      const userTokens = await this.socketService.getUserTokens(client);
      userTokens.forEach(element => {
        this.server
          .to(element)
          .emit('addNewConversation', interlocutorInfo, existed_chat['id_chat']);
      });

      const interlocutorToken = await this.socketService.getInterlocutorsToken(
        client,
        existed_chat['id_chat'],
      );
      if (interlocutorToken == undefined) return;
      const user = await this.socketService.getUserInfo(client, payload);
      
      interlocutorToken.forEach((element) => {
        this.server
          .to(element)
          .emit('addNewConversation', user, existed_chat['id_chat']);
      });
    }
  }

  @SubscribeMessage('sendMessage')
  async sendMessage(client: Socket, payload: string[]): Promise<void> {
    this.socketService.saveMessageToDB(client, payload);
    const token = await this.socketService.getInterlocutorsToken(
      client,
      payload[1],
    );
    if (token == undefined) return;

    token.forEach((element) => {
      this.server.to(element).emit('getMessage', payload[0], payload[1]);
    });
  }

  @SubscribeMessage('isTyping')
  async isTyping(client: Socket, payload: string): Promise<void> {
    if (payload == null) return;
    const token = await this.socketService.getInterlocutorsToken(
      client,
      payload,
    );
    if (token == undefined) return;

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
    if (token == undefined) return;

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
    if (interlocutors == undefined) return;

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
    if (interlocutors == undefined) return;

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
