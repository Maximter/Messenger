import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from 'src/app.service';
import { DialogService } from './dialog.service';

@Controller('dialog')
export class DialogController {
  constructor(
    private readonly dialogService: DialogService,
    private readonly appService: AppService,
  ) {}

  @Get('/getChats')
  async sendChatsData(@Req() req, @Res() res: Response, @Query() query) {
    const user = await this.dialogService.getUser(req);
    const idchats = await this.dialogService.getIdChats(user);
    const chats_info = await this.dialogService.getChatsInfo(user, idchats);

    res.json(chats_info);
  }

  @Get('/getMessages')
  async sendMessages(@Req() req, @Res() res: Response, @Query() query) {
    const user = await this.dialogService.getUser(req);
    const messages = await this.dialogService.getMessages(
      req.query.id_chat,
      user.id_user,
    );

    res.json(messages);
  }
}
