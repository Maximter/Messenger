import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from 'entity/token.entity';
import { User } from 'entity/user.entity';
import { getConnection, Repository } from 'typeorm';

@Injectable()
export class DialogService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,

        @InjectRepository(Token)
        private tokenRepository: Repository<Token>,
    ) {}

    async getUser (req) : Promise<object> {
        const tokenEntity = await getConnection()
            .getRepository(Token)
            .createQueryBuilder('token')
            .leftJoinAndSelect('token.user', 'user')
            .where('token.token = :token', { token: req.cookies.token_rf })
            .getOne();

        if (tokenEntity == undefined) throw new UnauthorizedException();
        
        return tokenEntity.user;
    }

    async getChats (user) : Promise<object[]> {

        return [{}]
    }
}
