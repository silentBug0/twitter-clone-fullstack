import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { TweetsService } from './tweets.service';
import { getUser } from '../auth/get-user.decorator';
import { CreateTweetDto } from '../dto/create-tweet.dto';

interface UserPayload {
  userId: number
  username: string
  email: string
}


@Controller('tweets')
export class TweetsController {
  constructor(private readonly tweetsService: TweetsService) { }
  @Post()
  @UseGuards(AuthGuard('jwt'))
  async createTweet(@getUser() req: UserPayload, @Body() { content }: CreateTweetDto) {
    return this.tweetsService.create(req.userId, content)
  }

  @Get()
  async findAll() {
    return this.tweetsService.findAllTweets();
  }

  @Get('user/:id')
  async findTweetsByUser(@Param('id', ParseIntPipe) id: number) {
    return this.tweetsService.findTweetsByUser(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async deleteTweet(@getUser() req: UserPayload, @Param('id', ParseIntPipe) id: number) {
    return this.tweetsService.deleteTweet(req.userId, id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/like')
  async like(@getUser() req: UserPayload, @Param('id', ParseIntPipe) id: number) {
    return this.tweetsService.likeTweet(id, req.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id/like')
  async unlike(@getUser() req: UserPayload, @Param('id', ParseIntPipe) id: number) {
    return this.tweetsService.unlikeTweet(id, req.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('timeline')
  async findTimeline(@getUser() req: UserPayload) {
    const currentUserId = req.userId;
    return this.tweetsService.findTimeline(currentUserId);
  }
}
