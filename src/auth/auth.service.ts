import { 
  Injectable, 
  ConflictException, 
  UnauthorizedException, 
  InternalServerErrorException 
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

// Define the structure of the JWT payload
interface JwtPayload {
  sub: number; // User ID
  username: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Generates a JWT token for a given user.
   */
  private async getJwtToken(userId: number, username: string): Promise<string> {
    const payload: JwtPayload = { sub: userId, username };
    return this.jwtService.sign(payload);
  }

  /**
   * Registers a new user.
   */
  async register(registerDto: RegisterDto) {
    const { username, email, password } = registerDto;
    
    // 1. Check for existing user
    const existingUser = await this.prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existingUser) {
      throw new ConflictException('Email or Username already in use.');
    }

    try {
      // 2. Hash the password
      const saltRounds = this.configService.get<number>('SALT_ROUNDS') || 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // 3. Create the user
      const user = await this.prisma.user.create({
        data: {
          username,
          email,
          passwordHash,
        },
      });

      // 4. Generate and return JWT
      const token = await this.getJwtToken(user.id, user.username);
      return { token, user: { id: user.id, username: user.username, email: user.email } };

    } catch (error) {
      // Catch any unexpected Prisma or hashing errors
      throw new InternalServerErrorException('Failed to register user.');
    }
  }

  /**
   * Authenticates a user and issues a JWT token.
   */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // 1. Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    // 2. Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    // 3. Generate and return JWT
    const token = await this.getJwtToken(user.id, user.username);
    return { token, user: { id: user.id, username: user.username, email: user.email } };
  }
}