import {
  Controller,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { AppService } from 'src/app.service';
import { UserService } from './user.service';
import { Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly appService: AppService,
  ) {}

  // запрос на смену пароля
  @Post('/changePassword')
  async changePassword(@Req() req, @Res() res: Response, @Query() query) {
    const user = await this.userService.getUser(req);
    const valid_password: boolean = await this.userService.check_valid_password(
      user,
      req.body.old_password,
    );

    if (valid_password)
      this.userService.change_password(user, req.body.new_password);
    res.json(valid_password);
  }

  // запрос на смену имени
  @Post('/changeName')
  async changeName(@Req() req, @Res() res: Response, @Query() query) {
    const user = await this.userService.getUser(req);
    this.userService.change_name(user, req.body.name, req.body.lastname);

    res.json(true);
  }

  // запрос на смену аватара
  @Post('/changeAvatar')
  // загрузка фото
  @UseInterceptors(FileInterceptor('avatar', { dest: 'public/img/rowImg' }))
  async changeAvatar(
    @Req() req,
    @Res() res: Response,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const user = await this.userService.getUser(req);

    this.userService.change_avatar(user, file);

    res.writeHead(302, { Location: '/' });
    res.end();
  }
}
