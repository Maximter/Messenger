import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from 'entity/token.entity';
import { User } from '../entity/user.entity';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppGateway } from './gateway/app.gateway';
import { SocketService } from './gateway/app.gateway.service';
import { LoginModule } from './login/login.module';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { SignupModule } from './signup/signup.module';
import { FindUser } from './user/findUser';

@Module({
  imports: [
    TypeOrmModule.forRoot(),
    TypeOrmModule.forFeature([User, Token]),
    LoginModule,
    SignupModule,
  ],
  controllers: [AppController],
  providers: [AppService, SocketService, FindUser, AppGateway],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(AppController);
  }
}
