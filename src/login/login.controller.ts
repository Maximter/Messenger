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
    this.loginService.checkData(body);
    res.end();
  }
}
