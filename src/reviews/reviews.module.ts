import { Module } from '@nestjs/common';

import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
// import { EntityModule } from 'src/entities/entity.module'; // <-- Crucial: Needed for EntityService/Repository
import { PrismaReviewRepository } from './prisma-review.repository';
import { REVIEW_REPOSITORY } from './review.repository.interface';
import { ReviewController } from './reviews.controller';
import { ReviewService } from './reviews.service';
import { EntitiesModule } from 'src/entities/entities.module';

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