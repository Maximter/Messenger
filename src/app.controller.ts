import { Controller, Get, Req, Res, Render } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async checkAuthAndRenderPage(@Req() req, @Res() res: Response) {
    // let token = req.cookies['token_m'];
    // const books = await this.appService.getDifferentTypesOfBooks();

    // if (!token) return res.render('index', { guest: true, books: books });
    // else {
    //   if (await this.appService.checkValidToken(token)) {
    //     const readingBooks = await this.appService.getUserReadingBooks(token);
    //     return res.render('index', {
    //       user: true,
    //       books: books,
    //       readingBooks: readingBooks,
    //     });
    //   } else {
    //     res.clearCookie('token');
    return res.render('index');
    // }
    // }
  }
}
