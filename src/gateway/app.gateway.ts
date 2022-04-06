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
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    constructor(private readonly socketService: SocketService) {}

    @WebSocketServer() 
    server: Server;

    private logger: Logger = new Logger('AppGateway');
    
    @SubscribeMessage('read')
    ahh(client: Socket, payload: string): void { 
    this.server.emit('msgToClient', payload);
    }

    afterInit(server: Server) {
        this.logger.log('Init');
    }

    handleDisconnect(client: Socket) {
        this.socketService.deleteFromOnline(client)
    }

    handleConnection(client: Socket) {
        this.socketService.pushToOnline(client)
    }
}