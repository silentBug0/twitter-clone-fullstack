import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is not set');
    }

    super({
      // Method to extract the JWT from the request
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // We delegate the responsibility of ensuring that a JWT has not expired to the Passport module
      ignoreExpiration: false,
      // The secret key to verify the token signature
      secretOrKey: process.env.JWT_SECRET
    });
  }

  /**
   * This method is called after the token is verified.
   * The payload is the decoded JWT object.
   * Whatever you return from here is attached to the request object as `req.user`.
   */
  async validate(payload: any) {
    return { userId: payload.sub, username: payload.username, email: payload.email };
  }
}