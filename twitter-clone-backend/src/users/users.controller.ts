import { Controller, Get, UseGuards, Request, Param, UnauthorizedException, Post, Delete, Req, NotFoundException, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TweetsService } from '../tweets/tweets.service';
import { getUser } from '../auth/get-user.decorator';

interface UserPayload {
  userId: number
  username: string
  email: string
}


@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService, private readonly tweetsService: TweetsService) { }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@getUser() req: UserPayload) {
    return this.usersService.findAll(req.userId);
  }

  @Get(':username')
  @UseGuards(JwtAuthGuard)
  async findByUsername(@Param('username') username: string, @getUser() req: UserPayload) {
    const currentUserId = req.userId;
    const user = await this.usersService.findByUsername(username, currentUserId);

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async findMe(@getUser() req: UserPayload) {
    const user = await this.usersService.findById(req.userId);

    if (user) {
      return user;
    }

    throw new UnauthorizedException('User does not exists');
  }

  // Add this new route for following a user
  @UseGuards(JwtAuthGuard)
  @Post(':id/follow')
  async follow(@Param('id', ParseIntPipe) followeeId: number, @getUser() req: UserPayload) {
    const followerId = req.userId;
    console.log(followeeId, req.userId);

    return this.usersService.follow(followerId, followeeId);
  }

  // Add this new route for unfollowing a user
  @UseGuards(JwtAuthGuard)
  @Delete(':id/follow')
  async unfollow(@Param('id', ParseIntPipe) followeeId: number, @getUser() req: UserPayload) {
    const followerId = req.userId;
    return this.usersService.unfollow(followerId, followeeId);
  }
}
