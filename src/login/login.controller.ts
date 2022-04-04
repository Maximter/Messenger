import { Controller, Get, Req, Res } from '@nestjs/common';
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
}
