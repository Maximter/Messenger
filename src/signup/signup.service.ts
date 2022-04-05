import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'entity/user.entity';
import { getManager, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as uuid from 'uuid';
import { Token } from 'entity/token.entity';

const saltForHash: number = 7;

@Injectable()
export class SignupService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,
  ) {}

  async checkData(body): Promise<String> {
    const email = body.email.trim(),
      name = body.name.trim(),
      lastname = body.lastname.trim(),
      password = body.password.trim();

    const validEmail: RegExp = /^[\w-\.]+@[\w-]+\.[a-z]{2,4}$/i;
    const validNameLastname: RegExp = /^[a-zA-Zа-яА-Я]+$/;

    if (!validEmail.test(email)) return 'Введена неверная почта';
    if (password.length < 8) return 'Введен слишком короткий пароль';
    if (!validNameLastname.test(name) || !validNameLastname.test(lastname))
      return 'Имя и фамилия должны содержать только буквы';
    if (name == '' || lastname == '') return 'Ошибка в имени или фамилии';
    if (name.length >= 13 || lastname.length >= 13)
      return 'Слишком длинное имя или фамилия';

    const user = await this.userRepository.findOne({
      where: { email: email },
    });

    if (user != undefined)
      return 'Данная почта принадлежит другому пользователю';

    return 'okay';
  }

  async signup(body): Promise<void> {
    const email: string = body.email.trim(),
      name: string = body.name.trim(),
      lastname: string = body.lastname.trim(),
      password: string = body.password.trim();

    const hashPassword: string = await bcrypt.hash(password, saltForHash);
    const findCode: string = await SignupService.getRandomString(6);

    await getManager().transaction(async (transactionalEntityManager) => {
      const newUser: User = this.userRepository.create({
        email: email,
        name: name,
        lastname: lastname,
        password: hashPassword,
        findCode: findCode,
      });

      await transactionalEntityManager.save(newUser);

      const token: Token = this.tokenRepository.create({
        user: newUser,
        token: await uuid.v4(),
      });

      transactionalEntityManager.save(token);
    });
  }

  static getRandomString(length): string {
    let simbols = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let rs = '';

    while (rs.length < length)
      rs += simbols[Math.floor(Math.random() * simbols.length)];

    return rs;
  }
}
