import { Controller, Get, Req, Res, Param, Query } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // обработчик на запрос главной страницы
  @Get()
  async checkAuthAndRenderPage(@Req() req, @Res() res: Response) {
    // проверка валидности токена
    const rightToken: boolean = await this.appService.checkToken(req);
    if (!rightToken) return res.redirect('/login');

    const user: object = await this.appService.getUserData(req);

    // отправка данных
    return res.render('index', { user: user });
  }
}
