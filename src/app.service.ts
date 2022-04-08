import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from 'entity/token.entity';
import { User } from 'entity/user.entity';
import { getConnection, Repository } from 'typeorm';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,
  ) {}

  async checkToken(req) : Promise<boolean> {
    const tokenClient = req.cookies.token_rf;

    const tokenServer  = await this.tokenRepository.findOne({
      where: { token: tokenClient },
    });

    if (tokenServer == undefined) return false;
    else return true;
  }

  async getUserData (req) : Promise<object> {
    const tokenEntity = await getConnection()
            .getRepository(Token)
            .createQueryBuilder('token')
            .leftJoinAndSelect('token.user', 'user')
            .where('token.token = :token', { token: req.cookies.token_rf })
            .getOne();
    
    if (tokenEntity == undefined) throw new UnauthorizedException();
          
    const { password, online, ...user } = tokenEntity.user;
    return user;
  }

  async getConversations (req) : Promise<object[]> {

    return [{}]
  }
}
