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
  constructor(private readonly tweetService: TweetsService) { }
  @Post()
  @UseGuards(AuthGuard('jwt'))
  async createTweet(@getUser() req: UserPayload, @Body() { content }: CreateTweetDto) {
    return this.tweetService.create(req.userId, content)
  }

  @Get()
  async findAll() {
    return this.tweetService.findAllTweets();
  }

  @Get('user/:id')
  async findTweetsByUser(@Param('id', ParseIntPipe) id: number) {
    return this.tweetService.findTweetsByUser(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async deleteTweet(@getUser() req: UserPayload, @Param('id', ParseIntPipe) id: number) {
    return this.tweetService.deleteTweet(req.userId, id);
  }
}
