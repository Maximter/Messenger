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

  // запрос на получение диалогов
  @Get('/getChats')
  async sendChatsData(@Req() req, @Res() res: Response, @Query() query) {
    const user = await this.dialogService.getUser(req);
    const idchats = await this.dialogService.getIdChats(user);
    const chats_info = await this.dialogService.getChatsInfo(user, idchats);

    res.json(chats_info);
  }
  // запрос на получение сообщений из диалога
  @Get('/getMessages')
  async sendMessages(@Req() req, @Res() res: Response, @Query() query) {
    const user = await this.dialogService.getUser(req);
    const messages = await this.dialogService.getMessages(
      req.query.id_chat,
      user.id_user,
    );

    res.json(messages);
  }

  // получение сообщений из диалога через поисковик
  @Get('/getMessagesById')
  async sendMessagesById(@Req() req, @Res() res: Response, @Query() query) {
    const user = await this.dialogService.getUser(req);
    const id_chat = await this.dialogService.getChatById(
      req.query.id_user,
      user.id_user,
    );
    const messages = await this.dialogService.getMessages(
      id_chat,
      user.id_user,
    );

    res.json(messages);
  }

  // сообщение прочитано
  @Get('/read')
  async read(@Req() req, @Res() res: Response, @Query() query) {
    const user = await this.dialogService.getUser(req);
    this.dialogService.readMessage(req.query.id_chat, user.id_user);
  }

  // сообщение непрочитано
  @Get('/unread')
  async unread(@Req() req, @Res() res: Response, @Query() query) {
    const user = await this.dialogService.getUser(req);
    this.dialogService.unreadMessage(req.query.id_chat, user.id_user);
  }
}
