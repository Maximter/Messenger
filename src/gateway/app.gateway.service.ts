import { InjectRepository } from '@nestjs/typeorm';
import { Token } from 'entity/token.entity';
import { User } from 'entity/user.entity';
import { getConnection, Repository } from 'typeorm';
import * as online from '../online';

export class SocketService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
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
