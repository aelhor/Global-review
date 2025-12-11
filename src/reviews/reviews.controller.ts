import { 
  Controller, 
  Post, 
  Body, 
  Param, 
  UseGuards, 
  Request, 
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Get,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';

import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '@prisma/client';
import { ReviewService } from './reviews.service';

@Controller('reviews')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  /**
   * F2: POST /reviews/:entityId
   * Protected route: Allows an authenticated user to submit a review for an entity.
   * Checks for entity existence and duplicate submission is handled in the service.
   */
  @UseGuards(JwtAuthGuard)
  @Post(':entityId')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('entityId', ParseIntPipe) entityId: number,
    @Body() createReviewDto: CreateReviewDto,
    @Request() req: { user: User },
  ) {
    // Attach the entityId from the path parameter to the DTO for service consumption
    createReviewDto.entityId = entityId;
    const authorId = req.user.id;
    
    return this.reviewService.create(createReviewDto, authorId);
  }

  /**
   * GET /reviews/:entityId
   * Public route: Retrieves all reviews for a specific entity.
   */
  @Get(':entityId')
  findAllByEntity(@Param('entityId', ParseIntPipe) entityId: number) {
    return this.reviewService.findAllByEntity(entityId);
  }
}