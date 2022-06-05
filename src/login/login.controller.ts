import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { LoginService } from './login.service';

@Controller('login')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  // запрос на страницу входа
  @Get()
  async renderLogin(@Res() res: Response) {
    res.clearCookie('token_rf');
    return res.render('login');
  }

  // запрос на вход
  @Post()
  async loginUser(@Body() body: Body, @Res() res: Response) {
    const rightData: boolean = await this.loginService.checkRightData(body);

    if (rightData) {
      // установка токена
      res.cookie('token_rf', await this.loginService.getToken(body), {
        httpOnly: true,
      });
      return res.redirect('/');
    } else
      return res.render('login', {
        error_message: 'Введена неверная почта или пароль',
      });
  }
}
