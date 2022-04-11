import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from 'src/app.service';
import { DialogService } from './dialog.service';

@Controller('dialog')
export class DialogController {
  constructor(private readonly dialogService: DialogService,
              private readonly appService: AppService) {}

  // @Get('/getChats')
  // async sendDialogData(@Req() req, @Res() res: Response, @Query() query) {
  //   const user = await this.dialogService.getUser(req);
  //   const chats = await this.dialogService.getChats(user);
  //   console.log(user);
    

    
  //   res.json([]);
  // }
}
