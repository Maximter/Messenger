import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from 'entity/chat.entity';
import { ChatInfo } from 'entity/chat.info.entity';
import { Token } from 'entity/token.entity';
import { User } from 'entity/user.entity';
import { getConnection, getManager, Repository } from 'typeorm';
import * as online from '../online';
import * as uuid from 'uuid'
import { UrlWithStringQuery } from 'url';

export class SocketService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,

    @InjectRepository(ChatInfo)
    private chatInfoRepository: Repository<ChatInfo>,
  ) {}

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

  async createChat (client, payload) : Promise<void> {
    const message = payload[0].trim();
    const id_interlocutor = payload[1];

    if (SocketService.checkExistchat()) return;

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

    const chat_id : string = await uuid.v4();

    await getManager().transaction(async (transactionalEntityManager) => {
      const newChat1: Chat = this.chatRepository.create({
        chat_id: chat_id,
        member: user,
      });

      const newChat2: Chat = this.chatRepository.create({
        chat_id: chat_id,
        member: interlocutor,
      });

      await transactionalEntityManager.save(newChat1);
      await transactionalEntityManager.save(newChat2);

      const newChatInfo: ChatInfo = this.chatInfoRepository.create({
        chat : chat_id,
        last_message_content : message,
        last_message_time : `${Date.now()}`,
        last_message_sender : user.id_user
      });

      await transactionalEntityManager.save(newChatInfo);
    });
  }

  static checkExistchat () : boolean {

    return true;
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