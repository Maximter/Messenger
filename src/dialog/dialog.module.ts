import { Module } from '@nestjs/common';
import { DialogService } from './dialog.service';
import { DialogController } from './dialog.controller';
import { AppService } from 'src/app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from 'entity/token.entity';
import { User } from 'entity/user.entity';
import { Chat } from 'entity/chat.entity';
import { ChatInfo } from 'entity/chat.info.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Token, Chat, ChatInfo]),],
  controllers: [DialogController],
  providers: [DialogService, AppService]
})
export class DialogModule {}