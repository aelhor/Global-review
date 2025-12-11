import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '@prisma/client';

// Define the structure of the token payload received from the client
interface JwtPayload {
  sub: number; // The user ID
  username: string;
  iat: number;
  exp: number;
}

@Injectable()
// Extends the Passport Strategy for JWT, registering it as 'jwt'
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      // 1. Specifies how the JWT is extracted from the request (from the Authorization header)
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 2. Specifies that the Passport strategy should not ignore the token expiration (handled by default)
      ignoreExpiration: false,
      // 3. Gets the secret key from the environment variables to verify the token signature
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  /**
   * Validation method: runs after the token is verified.
   * This method extracts the user data and injects it into the request object (req.user).
   * @param payload The decoded JWT payload (sub, username)
   * @returns The User object to be attached to the request
   */
  async validate(payload: JwtPayload): Promise<User> {
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      // If the user ID in the token doesn't exist (e.g., account deleted)
      throw new UnauthorizedException('User not found or token expired.');
    }

    // We return the full User object (minus the passwordHash) which will be injected into req.user
    const { passwordHash, ...result } = user;
    return result as User;
  }
}