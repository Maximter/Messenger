import { Module } from '@nestjs/common';
import { SignupService } from './signup.service';
import { SignupController } from './signup.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'entity/user.entity';
import { Token } from 'entity/token.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Token])],
  controllers: [SignupController],
  providers: [SignupService],
})
export class SignupModule {}
 