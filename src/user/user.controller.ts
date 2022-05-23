import { Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from 'src/app.service';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly appService: AppService,
  ) {}

  @Post('/changePassword')
  async changePassword(@Req() req, @Res() res: Response, @Query() query) {
    const user = await this.userService.getUser(req);
    const valid_password: boolean = await this.userService.check_valid_password(
      user,
      req.body.old_password,
    );

    if (valid_password) {
      this.userService.change_password(user, req.body.new_password);
      res.json('Valid');
    } else res.json('Invalid');
  }
}
