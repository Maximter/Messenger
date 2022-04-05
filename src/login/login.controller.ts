import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { LoginService } from './login.service';

@Controller('login')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @Get()
  async renderLogin(@Req() req, @Res() res: Response) {
    res.clearCookie('token_rf'); 
    return res.render('login');
  }

  @Post()
  async loginUser(@Body() body: Body, @Res() res: Response) {
    const rightData : boolean = await this.loginService.checkRightData(body);

    if (rightData) {
      res.cookie('token_rf', await this.loginService.getToken(body), { httpOnly: true })
      return res.redirect('/')
    } else return res.render('login', { error_message: "Введена неверная почта или пароль" });
  }
}
