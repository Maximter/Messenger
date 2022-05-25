import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from 'entity/chat.entity';
import { ChatInfo } from 'entity/chat.info.entity';
import { Token } from 'entity/token.entity';
import { User } from 'entity/user.entity';
import { getConnection, getManager, getRepository, Repository } from 'typeorm';
import * as online from '../online';
import * as uuid from 'uuid';
import { UrlWithStringQuery } from 'url';
import { Message } from 'entity/message.entity';

export class SocketService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,

    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,

    @InjectRepository(ChatInfo)
    private chatInfoRepository: Repository<ChatInfo>,

    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async saveMessageToDB(client, payload): Promise<void> {
    const message = payload[0];
    const id_chat = payload[1];
    const date = `${Date.now()}`;

    const token = await SocketService.getToken(client);
    const tokenEntity = await getConnection()
      .getRepository(Token)
      .createQueryBuilder('token')
      .leftJoinAndSelect('token.user', 'user')
      .where('token.token = :token', { token: token })
      .getOne();

    const user = tokenEntity.user;

    const ai_chat = await this.chatInfoRepository.findOne({
      where: { chat: id_chat },
    });

    this.chatInfoRepository.save({
      id_chat_info: ai_chat.id_chat_info,
      last_message_content: message,
      last_message_sender: user.id_user,
      last_message_time: date,
    });

    this.messageRepository.save({
      id_chat: id_chat,
      content: message,
      id_sender: user.id_user,
      message_sent: date,
    });
  }

  async getInterlocutorsToken(client, id_chat): Promise<string[]> {
    const my_token = await SocketService.getToken(client);
    const my_tokenEntity = await getConnection()
      .getRepository(Token)
      .createQueryBuilder('token')
      .leftJoinAndSelect('token.user', 'user')
      .where('token.token = :token', { token: my_token })
      .getOne();

    const user = my_tokenEntity.user;

    const members = await getConnection()
      .getRepository(Chat)
      .createQueryBuilder('chat')
      .leftJoinAndSelect('chat.member', 'member')
      .where('chat.chat_id = :id', { id: id_chat })
      .getMany();

    let interlocutor;

    for (let i = 0; i < members.length; i++) {
      if (members[i].member.id_user != user.id_user) {
        interlocutor = members[i].member;
        break;
      }
    }
    const interlocutor_token = await this.tokenRepository.findOne({
      where: { user: interlocutor },
    });

    return online[`${interlocutor_token.token}`];
  }

  async createChat(client, payload): Promise<string> {
    const message = payload[0].trim();
    const id_interlocutor = payload[1];

    const token = await SocketService.getToken(client);
    const tokenEntity = await getConnection()
      .getRepository(Token)
      .createQueryBuilder('token')
      .leftJoinAndSelect('token.user', 'user')
      .where('token.token = :token', { token: token })
      .getOne();

    const user = tokenEntity.user;
    const interlocutor = await this.userRepository.findOne({
      where: { id_user: id_interlocutor },
    });

    const existed_chat = await this.checkExistchat(user, interlocutor);

    if (existed_chat != '') return existed_chat;

    const chat_id: string = await uuid.v4();

    await getManager().transaction(async (transactionalEntityManager) => {
      const newChat1: Chat = this.chatRepository.create({
        chat_id: chat_id,
        member: user,
      });

      const newChat2: Chat = this.chatRepository.create({
        chat_id: chat_id,
        member: interlocutor,
      });

      this.messageRepository.save({
        id_chat: chat_id,
        content: message,
        id_sender: user.id_user,
        message_sent: `${Date.now()}`,
      });

      await transactionalEntityManager.save(newChat1);
      await transactionalEntityManager.save(newChat2);

      const newChatInfo: ChatInfo = this.chatInfoRepository.create({
        chat: chat_id,
        last_message_content: message,
        last_message_time: `${Date.now()}`,
        last_message_sender: user.id_user,
      });

      await transactionalEntityManager.save(newChatInfo);
    });

    return '';
  }

  async checkExistchat(user, interlocutor): Promise<string> {
    const userChats = [];
    const userEntityChats = await this.chatRepository.find({
      where: { member: user },
    });

    if (userEntityChats.length == 0) return '';

    for (let i = 0; i < userEntityChats.length; i++)
      userChats.push(userEntityChats[i].chat_id);

    const membersTheChat = await getRepository(Chat)
      .createQueryBuilder('chat')
      .leftJoinAndSelect('chat.member', 'member')
      .where('chat.chat_id IN (:...id)', { id: userChats })
      .getMany();

    for (let i = 0; i < membersTheChat.length; i++)
      if (membersTheChat[i].member.id_user == interlocutor.id_user)
        return membersTheChat[i].chat_id;

    return '';
  }

  async pushToOnline(client): Promise<void> {
    const token = await SocketService.getToken(client);

    if (online[`${token}`] == undefined) online[`${token}`] = [client.id];
    else online[`${token}`].push(client.id);

    const tokenEntity = await getConnection()
      .getRepository(Token)
      .createQueryBuilder('token')
      .leftJoinAndSelect('token.user', 'user')
      .where('token.token = :token', { token: token })
      .getOne();

    const id_user = tokenEntity.user.id_user;
    this.userRepository.save({
      id_user: id_user,
      online: `0`,
    });
  }

  async deleteFromOnline(client): Promise<void> {
    const token = await SocketService.getToken(client);

    online[`${token}`].splice(online[`${token}`].indexOf(client.id), 1);
    if (online[`${token}`].length == 0) delete online[`${token}`];

    const tokenEntity = await getConnection()
      .getRepository(Token)
      .createQueryBuilder('token')
      .leftJoinAndSelect('token.user', 'user')
      .where('token.token = :token', { token: token })
      .getOne();

    const id_user = tokenEntity.user.id_user;
    this.userRepository.save({
      id_user: id_user,
      online: `${Date.now()}`,
    });
  }

  async getAllUserInterlocutors(client): Promise<object[]> {
    const my_token = await SocketService.getToken(client);
    const my_tokenEntity = await getConnection()
      .getRepository(Token)
      .createQueryBuilder('token')
      .leftJoinAndSelect('token.user', 'user')
      .where('token.token = :token', { token: my_token })
      .getOne();

    const user = my_tokenEntity.user;
    const userchats = await getConnection()
      .getRepository(Chat)
      .createQueryBuilder('chat')
      .leftJoinAndSelect('chat.member', 'member')
      .where('chat.member = :member', { member: user.id_user })
      .getMany();

    let info = [];

    for (let i = 0; i < userchats.length; i++) {
      const chats = await getConnection()
        .getRepository(Chat)
        .createQueryBuilder('chat')
        .leftJoinAndSelect('chat.member', 'member')
        .where('chat.chat_id = :id', { id: userchats[i].chat_id })
        .getMany();

      chats.forEach((element) => {
        if (element.member.id_user != user.id_user)
          info.push({
            id_user: element.member.id_user,
            id_chat: element.chat_id,
          });
      });
    }

    for (let i = 0; i < info.length; i++) {
      const interlocutor_token = await this.tokenRepository.findOne({
        where: { user: info[i].id_user },
      });
      info[i]['token'] = interlocutor_token.token;
    }

    return info;
  }

  static getToken(client): string {
    let cookies = client.handshake.headers.cookie;
    let token = '';
    for (
      let i = cookies.indexOf('token_rf') + 9;
      cookies[i] !== ';' && i < cookies.length;
      i++
    ) {
      token += cookies[i];
    }

    return token;
  }
}
