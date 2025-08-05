import { Controller, Get, UseGuards, Request, Param, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGaurd } from '../auth/jwt-auth.guard';
import { TweetsService } from '../tweets/tweets.service';
import { getUser } from '../auth/get-user.decorator';

interface UserPayload {
  userId: number
  username: string
  email: string
}


@Controller('users')
@UseGuards(JwtAuthGaurd)
export class UsersController {
  constructor(private readonly usersService: UsersService, private readonly tweetsService: TweetsService) { }

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':username')
  async findByUsername(@Param('username') username: string) {
    let a = await this.usersService.findByUsername(username);
    console.log('findByUsername',a);
    return a;
    
  }

  @Get('me')
  async findMe(@getUser() req: UserPayload,) {
    const user = await this.usersService.findById(req.userId);

    if (user) {
      return user;
    }

    throw new UnauthorizedException('User does not exists');
  }
}
