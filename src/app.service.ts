import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from 'entity/token.entity';
import { Repository } from 'typeorm';

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
}
