import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoginModule } from './login/login.module';
import { SignupModule } from './signup/signup.module';

import { User } from 'entity/user.entity';

@Module({
  imports: [TypeOrmModule.forRoot(), TypeOrmModule.forFeature([User]), LoginModule, SignupModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
