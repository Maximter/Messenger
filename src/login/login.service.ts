import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'entity/user.entity';
import { getConnection, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Token } from 'entity/token.entity';

@Injectable()
export class LoginService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,

        @InjectRepository(Token)
        private tokenRepository: Repository<Token>,
    ) {} 

    async checkRightData (body) : Promise<boolean> {
        const email = body.email.trim(),
            password = body.password.trim()

        const user = await this.userRepository.findOne({
            where: { email: email },
        });

        if (user != undefined) return await bcrypt.compare(password, user.password);
        else return false;
    }

    async getToken (body) : Promise<string> {
        const email = body.email.trim();

        const user = await this.userRepository.findOne({
            where: { email: email },
        });

        const tokenData = await this.tokenRepository.findOne({
            where: { user: user },
        });
            
        return tokenData.token;
    }
} 
