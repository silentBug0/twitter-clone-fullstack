import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TweetsService extends PrismaService {

  async getSingleTweet(tweetId: number, userId: number) {
    return this.tweet.findUnique({
      where: { id: tweetId },
      include: {
        _count: {
          select: { likes: true }
        },
        likes: {
          where: { userId },
          select: { userId: true }
        }
      }
    })

  }

  async create(authorId: number, content: string,) {
    return this.tweet.create({
      data: {
        content, authorId
      },
      select: { id: true }
    });
  }

  async findAllTweets() {
    return this.tweet.findMany({
      include: {
        author: {
          select: { username: true, id: true }
        },
        _count: {
          select: { likes: true }, // Include the count of likes
        }
      }
    });
  }

  async findTweetsByUser(authorId: number) {
    return this.tweet.findMany({
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

    await this.tweet.delete({
      where: {
        id: tweetId
      }
    });

    return { message: 'Tweet deleted successfully' };
  }

  async likeTweet(tweetId: number, userId: number) {
    try {
      return this.like.create({
        data: {
          tweet: { connect: { id: tweetId } },
          user: { connect: { id: userId } },
        }
      });
    } catch (error) {
      // If the user has already liked the tweet, we can return the existing record
      if (
        typeof error === 'object' &&
        error &&
        'code' in error &&
        (error as any).code === 'P2002' // Prisma's unique constraint violation code
      ) { 
        return this.like.findUnique({
          where: { userId_tweetId: { userId, tweetId } },
        });
      }
      throw error;
    }
  }

  // Add a new method to unlike a tweet
  async unlikeTweet(tweetId: number, userId: number) {
    try {
      return this.like.delete({
        where: {
          userId_tweetId: { userId, tweetId },
        },
      });
    } catch (error) {
      // If the like doesn't exist, we can just return a success message
      if (typeof error === 'object' &&
        error &&
        'code' in error &&
        (error as any).code === 'P2025') { // Prisma's record not found code
        return { message: 'Like not found' };
      }
      throw error;
    }
  }

  async findTimeline(currentUserId: number) {
    // Find all the users that the current user is following
    const following = await this.following.findMany({
      where: { followerId: currentUserId },
      select: { followeeId: true },
    });

    const followedUserIds = following.map(f => f.followeeId);

    // Also include the current user's ID so they see their own tweets
    followedUserIds.push(currentUserId);

    // Now, find all tweets from these users
    return this.tweet.findMany({
      where: {
        authorId: {
          in: followedUserIds,
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            username: true,
          }
        },
        _count: {
          select: { likes: true },
        }
      }
    });
  }
}
