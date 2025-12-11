import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

import { PrismaReviewRepository } from './prisma-review.repository';
import { REVIEW_REPOSITORY } from './review.repository.interface';
import { ReviewController } from './reviews.controller';
import { ReviewService } from './reviews.service';
import { EntitiesModule } from '../entities/entities.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule, 
    EntitiesModule, //Import EntityModule to gain access to the exported EntityService/Repository
  ],
  controllers: [ReviewController],
  providers: [
    ReviewService,
    // Custom Provider setup for the Review Repository
    {
      provide: REVIEW_REPOSITORY,
      useClass: PrismaReviewRepository,
    },
  ],
})
export class ReviewModule {}