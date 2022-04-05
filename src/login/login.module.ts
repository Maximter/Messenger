import { Module } from '@nestjs/common';
import { LoginService } from './login.service';
import { LoginController } from './login.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'entity/user.entity';
import { Token } from 'entity/token.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Token])],
  controllers: [LoginController],
  providers: [LoginService],
}) 
export class LoginModule {}
