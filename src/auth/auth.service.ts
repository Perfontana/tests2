import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';

import { User } from '../user/user.model';
import { UserRegisterDTO } from './dto/user-register.dto';
import { UserLoginDTO } from './dto/user-login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
    private jwtService: JwtService,
  ) {}

  public async register({ email, password, username }: UserRegisterDTO) {
    const existingUser = await this.userModel.findOne({ where: { email } });

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const user = await this.userModel.create({
      username,
      password,
      email,
    });

    return {
      access_token: await this.getTokenForUser(user),
    };
  }

  public async login({ email, password }: UserLoginDTO) {
    const user = await this.userModel
      .scope('withPassword')
      .findOne({ where: { email } });

    if (!user) {
      throw new BadRequestException('Invalid password or email');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      throw new BadRequestException('Invalid password or email');
    }

    return {
      access_token: await this.getTokenForUser(user),
    };
  }

  private async getTokenForUser(user: User) {
    return await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });
  }
}
