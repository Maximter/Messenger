import {
  Controller,
  Get,
  Req,
  Res,
  Render,
  Param,
  Query,
} from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';
import { FindUser } from './user/findUser';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly findUser: FindUser,
  ) {}

  @Get()
  async checkAuthAndRenderPage(@Req() req, @Res() res: Response) {
    const rightToken: boolean = await this.appService.checkToken(req);
    if (!rightToken) return res.redirect('/login');

    const user: object = await this.appService.getUserData(req);
    const conversations: object[] = await this.appService.getConversations(req);

    return res.render('index', { user: user, conversations: conversations });
  }

  @Get('/findUser')
  async sendUser(@Res() res: Response, @Query() query) {
    res.json(await this.findUser.findUser(query.findCode));
  }
}
