import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from 'entity/chat.entity';
import { ChatInfo } from 'entity/chat.info.entity';
import { Message } from 'entity/message.entity';
import { Token } from 'entity/token.entity';
import { User } from 'entity/user.entity';
import { getConnection, getManager, getRepository, Repository } from 'typeorm';
const fs = require('fs');

@Injectable()
export class DialogService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,

    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,

    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async getUser(req): Promise<User> {
    const tokenEntity = await getConnection()
      .getRepository(Token)
      .createQueryBuilder('token')
      .leftJoinAndSelect('token.user', 'user')
      .where('token.token = :token', { token: req.cookies.token_rf })
      .getOne();

    if (tokenEntity == undefined) throw new UnauthorizedException();

    return tokenEntity.user;
  }

  async getIdChats(user): Promise<Chat[]> {
    const chats = await this.chatRepository.find({
      where: { member: user },
    });

    return chats;
  }

  async getChatsInfo(user, id_chats): Promise<ChatInfo[]> {
    const id_user = user.id_user;
    const id: number[] = [];

    for (let i = 0; i < id_chats.length; i++) id.push(id_chats[i].chat_id);

    const chats = await getRepository(ChatInfo)
      .createQueryBuilder('chatInfo')
      .where('chatInfo.chat IN (:...id)', { id: id })
      .getMany();

    for (let i = 0; i < id_chats.length; i++) {
      if (chats[i].last_message_sender == id_user) chats[i]['sender'] = 'Вы: ';
      else chats[i]['sender'] = '';

      chats[i]['unread'] = id_chats[i]['unread'];

      const chatsEntity = await getConnection()
        .getRepository(Chat)
        .createQueryBuilder('chat')
        .leftJoinAndSelect('chat.member', 'member')
        .where('chat.chat_id = :id', { id: id[i] })
        .getMany();

      chatsEntity.forEach((element) => {
        if (element.member.id_user != user.id_user) {
          chats[i]['name'] = element.member.name;
          chats[i]['lastname'] = element.member.lastname;
          chats[i]['online'] = element.member.online;
          chats[i]['avatar'] = element.member.avatar;
          if (
            fs.existsSync(`./public/img/avatar/${element.member.id_user}.jpg`)
          ) {
            chats[i]['avatar'] = `img/avatar/${element.member.id_user}.jpg`;
          } else chats[i]['avatar'] = `img/avatar/standard.jpg`;
        }
      });
    }

    return chats;
  }

  async getMessages(id_chat, id_user): Promise<Message[]> {
    const messages = await this.messageRepository.find({
      where: { id_chat: id_chat },
      // take : 20,
    });

    messages.forEach((element) => {
      if (element.id_sender != id_user) delete element.id_sender;
    });

    return messages;
  }
}
