import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService, private readonly jwtService: JwtService) { }


  async generateToken(user: any) {
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email
    }

    const accessToken = this.jwtService.signAsync(payload)

    return accessToken;
  }

  async validateUser(email: string, password: string) {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });
    console.log(user);

    if (!user) return null;

    const isMatch = bcrypt.compareSync(password, user.password);

    if (!isMatch) {
      return new UnauthorizedException('User does not exists');
    }

    return { user, accessToken: this.generateToken(user) };
  }
}
