import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserLoginDTO } from './dto/user-login.dto';
import { UserRegisterDTO } from './dto/user-register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  async register(@Body() body: UserRegisterDTO) {
    const token = await this.authService.register(body);

    return token;
  }

  @Post('/login')
  async login(@Body() body: UserLoginDTO) {
    const token = await this.authService.login(body);

    return token;
  }
}
