import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TweetsService extends PrismaService {
  async create(authorId: number, content: string,) {
    return this.tweet.create({
      data: {
        content, authorId
      },
      select: { id: true }
    });
  }

  async findAllTweets() {
    return this.tweet.findMany({ select: { id: true, authorId: true, content: true, } });
  }

  async findTweetsByUser(authorId: number) {
    return this.tweet.findMany({
      select: { content: true, id: true },
      where: { authorId }
    });

  }

  async deleteTweet(authorId: number, tweetId: number) {
    const tweet = await this.tweet.findUnique({
      where: {
        id: tweetId
      },
      select: {
        authorId: true
      }
    })

    if (!tweet) throw new UnauthorizedException('Tweet does not exists');
    if (tweet.authorId !== authorId) throw new UnauthorizedException('you dont have permission to delete others tweet');

    return this.tweet.delete({
      where: {
        id: tweetId
      }
    });
  }

}
