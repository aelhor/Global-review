import { Controller, Get, Req } from '@nestjs/common';
import { AppService } from './app.service';


@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Public endpoint - no token required
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // 2. Protected endpoint - Requires a valid JWT
  // @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req) { 
    return { 
      message: "Access granted! This is your profile.", 
      user: req.user 
    };
  }
}