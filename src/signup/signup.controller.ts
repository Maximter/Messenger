import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { SignupService } from './signup.service';

@Controller('signup')
export class SignupController {
  constructor(private readonly signupService: SignupService) {}

  // получение страницы регистрации
  @Get()
  async renderSignup(@Req() req, @Res() res: Response) {
    res.clearCookie('token_rf');
    return res.render('signup');
  }

  // отправка данных на регистрацию
  @Post()
  async signupUser(@Body() body: Body, @Res() res: Response) {
    let answer = await this.signupService.checkData(body);

    if (answer != 'okay')
      return res.render('signup', { error_message: answer });

    this.signupService.signup(body);
    return res.redirect('/login');
  }
}
