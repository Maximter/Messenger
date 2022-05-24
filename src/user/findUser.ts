import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'entity/user.entity';
import { AppService } from 'src/app.service';
import { Repository } from 'typeorm';

export class FindUser {
  constructor(
    private readonly appService: AppService,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findUser(findCodeClient) {
    const foundUser = await this.userRepository.findOne({
      where: { findCode: findCodeClient },
    });

    if (foundUser == undefined) return undefined;

    const { email, password, findCode, online, ...user } = foundUser;

    if (
      await AppService.checkFileExists(
        `./public/img/avatar/${user.id_user}.jpg`,
      )
    )
      user.avatar = user.id_user;
    else user.avatar = 'standard';

    return user;
  }
}
