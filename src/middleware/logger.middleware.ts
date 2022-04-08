import {
  ForbiddenException,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from 'entity/token.entity';
import { Repository } from 'typeorm';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const tokenClient = req.cookies.token_rf;

    const tokenServer = await this.tokenRepository.findOne({
      where: { token: tokenClient },
    });

    if (tokenServer == undefined) res.redirect('/login');
    else next();
  }
}
