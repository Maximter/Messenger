import { Controller, Get, Req, Res, Render } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async checkAuthAndRenderPage(@Req() req, @Res() res: Response) {
    const rightToken : boolean = await this.appService.checkToken(req);
    
    if (!rightToken) return res.redirect('/login');
    return res.render('index');
  }
}
