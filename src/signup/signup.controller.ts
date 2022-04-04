import { Controller, Get, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { SignupService } from './signup.service';

@Controller('signup')
export class SignupController {
  constructor(private readonly signupService: SignupService) {}

  @Get()
  async renderLogin(@Req() req, @Res() res: Response) {
    res.clearCookie('token_rf');
    return res.render('signup');
  }
}
