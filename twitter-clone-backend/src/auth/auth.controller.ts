import { Body, Controller, Post } from '@nestjs/common';

import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { LoginUserDto } from '../dto/login-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly userService: UsersService) { }

  @Post('login')
  async login(@Body() { email, password }: LoginUserDto) {
    return this.authService.validateUser(email, password);
  }

  @Post('register')
  async register(@Body() { username, email, password }: CreateUserDto) {
    return this.userService.create(username, email, password);
  }
}
