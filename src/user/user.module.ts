import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AppService } from 'src/app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from 'entity/token.entity';
import { User } from 'entity/user.entity';
import { Chat } from 'entity/chat.entity';
import { ChatInfo } from 'entity/chat.info.entity';
import { Message } from 'entity/message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Token, Chat, ChatInfo, Message])],
  controllers: [UserController],
  providers: [UserService, AppService],
})
export class UserModule {}
