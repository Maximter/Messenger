import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from 'entity/chat.entity';
import { ChatInfo } from 'entity/chat.info.entity';
import { Message } from 'entity/message.entity';
import { Token } from 'entity/token.entity';
import { User } from 'entity/user.entity';
import { getConnection, getManager, getRepository, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

const saltForHash: number = 7;

@Injectable()
export class UserService {
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

  async getUser(req): Promise<User> {
    const tokenEntity = await getConnection()
      .getRepository(Token)
      .createQueryBuilder('token')
      .leftJoinAndSelect('token.user', 'user')
      .where('token.token = :token', { token: req.cookies.token_rf })
      .getOne();

    if (tokenEntity == undefined) throw new UnauthorizedException();

    return tokenEntity.user;
  }

  async check_valid_password(user, old_password): Promise<boolean> {
    return await bcrypt.compare(old_password, user.password);
  }

  async change_password(user, new_password): Promise<void> {
    const hashPassword: string = await bcrypt.hash(new_password, saltForHash);

    this.userRepository.save({
      id_user: user.id_user,
      password: hashPassword,
    });
  }
}
