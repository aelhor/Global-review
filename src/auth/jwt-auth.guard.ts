import { AuthGuard } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
// This guard automatically protects routes by checking for a valid JWT.
// It uses the strategy named 'jwt' that we defined above.
export class JwtAuthGuard extends AuthGuard('jwt') {}