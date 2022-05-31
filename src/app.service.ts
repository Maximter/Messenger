import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from 'entity/token.entity';
import { getConnection, Repository } from 'typeorm';
import * as fs from 'fs';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,
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

    if (
      await AppService.checkFileExists(
        `./public/img/avatar/${user.id_user}.jpg`,
      )
    )
      user.avatar = user.id_user;
    else user.avatar = 'standard';

    return user;
  }

  static async checkFileExists(file) {
    return fs.promises
      .access(file, fs.constants.F_OK)
      .then(() => true)
      .catch(() => false);
  }
}
