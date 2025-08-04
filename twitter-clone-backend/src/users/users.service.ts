import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService extends PrismaService {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findByUsername(username: string) {
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
            }
          }
        }
      }
    });
  }


  async findById(id: number) {
    return this.user.findUnique({
      where: { id },
      select: { email: true, username: true }
    });
  }


  async findAll() {
    return this.user.findMany({ select: { email: true, username: true, id: true } });
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
}
