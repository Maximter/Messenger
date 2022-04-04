import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoginModule } from './login/login.module';
import { SignupModule } from './signup/signup.module';

@Module({
  imports: [LoginModule, SignupModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
