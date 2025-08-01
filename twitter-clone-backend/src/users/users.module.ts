import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TweetsService } from '../tweets/tweets.service';

@Module({
  providers: [UsersService, TweetsService],
  controllers: [UsersController],
})
export class UsersModule {}
