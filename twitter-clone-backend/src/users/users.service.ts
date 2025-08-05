import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService extends PrismaService {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findByUsername(username: string, currentUserId: number) {
    return this.prisma.user.findUnique({
      where: { username },
      // The 'include' option tells Prisma to also fetch related data
      include: {
        tweets: {
          orderBy: {
            createdAt: 'desc', // Order tweets by creation date
          },
          include: { // Also include the author for the tweet list
            author: {
              select: {
                id: true,
                username: true,
              }
            },
            _count: {
              select: { likes: true }, // Include the count of likes
            }
          },
        },
        // Include followers to check if the current user is following this profile
        followers: {
          where: { followerId: currentUserId },
          select: { followerId: true }
        },
        _count: {
          select: { following: true, followers: true },
        }
      },
    });
  }


  async findById(id: number) {
    return this.user.findUnique({
      where: { id },
      select: { email: true, username: true }
    });
  }


  async findAll(currentUserId: number) {
    const users = await this.user.findMany({
      where: {
        id: { not: currentUserId } // Exclude the current user from the list
      },
      select: {
        email: true, username: true, id: true, createdAt: true,
      }
    });

    // Now, check the follow status for each user
    const following = await this.following.findMany({
      where: { followerId: currentUserId },
    });

    return users.map(user => ({
      ...user,
      isFollowing: following.some(f => f.followeeId === user.id)
    }));
  }
  async create(username: string, email: string, password: string) {
    const userByEmail = await this.user.findUnique({
      where: { email },
    });

    const userByUsername = await this.user.findUnique({
      where: { username },
    });
    console.log(email, userByEmail, userByUsername);

    if (userByEmail) throw new UnauthorizedException('user already exists');
    if (userByUsername) throw new UnauthorizedException('user name already taken');

    let encryptPassword = bcrypt.hashSync(password, 10);

    const newUser = await this.user.create({
      data: { username, email, password: encryptPassword },
    });

    const { password: _, ...newUserWithoutPassword } = newUser;

    return newUserWithoutPassword;
  }

  // Add a new method to follow a user
  async follow(followerId: number, followeeId: number) {
    if (followerId === followeeId) {
      throw new Error('You cannot follow yourself.');
    }

    try {
      return this.following.create({
        data: {
          followerId,
          followeeId,
        },
      });
    } catch (e) {
      if (e && typeof e === 'object' && (e as any).code === 'P2002') {
        throw new Error('You are already following this user.');
      }
      throw e;
    }
  }

  // Add a new method to unfollow a user
  async unfollow(followerId: number, followeeId: number) {
    try {
      return this.following.delete({
        where: {
          followerId_followeeId: { followerId, followeeId },
        },
      });
    } catch (e) {
      if (e && typeof e === 'object' && (e as any).code === 'P2025') {
        throw new Error('You are not following this user.');
      }
      throw e;
    }
  }
}
