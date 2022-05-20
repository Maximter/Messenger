import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from 'entity/token.entity';
import { User } from 'entity/user.entity';
import { getConnection, getRepository, Repository } from 'typeorm';
import { access, constants } from 'fs';
import { Chat } from 'entity/chat.entity';
import { ChatInfo } from 'entity/chat.info.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,

    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,

    @InjectRepository(ChatInfo)
    private chatInfoRepository: Repository<ChatInfo>,
  ) {}

  async checkToken(req): Promise<boolean> {
    const tokenClient = req.cookies.token_rf;

    const tokenServer = await this.tokenRepository.findOne({
      where: { token: tokenClient },
    });

    if (tokenServer == undefined) return false;
    else return true;
  }

  async getUserData(req): Promise<object> {
    const tokenEntity = await getConnection()
      .getRepository(Token)
      .createQueryBuilder('token')
      .leftJoinAndSelect('token.user', 'user')
      .where('token.token = :token', { token: req.cookies.token_rf })
      .getOne();

    if (tokenEntity == undefined) throw new UnauthorizedException();

    const { password, online, ...user } = tokenEntity.user;

    if (await AppService.existAvatar(user.id_user)) user.avatar = user.id_user;
    else user.avatar = 'standard';

    return user;
  }

  static async existAvatar(id): Promise<boolean> {
    let exist: boolean;

    await access(`./public/img/avatar/${id}.jpg`, (err) => {
      if (err) exist = false;
      else exist = true;
    });

    return exist;
  }
}
