import { 
  Injectable, 
  Inject, 
  NotFoundException, 
  ConflictException 
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { ENTITY_REPOSITORY } from '../entities/entity.repository.interface';
// import { IReviewRepository, REVIEW_REPOSITORY, ReviewDetails } from './review.repository.interface';
import type { IReviewRepository, ReviewDetails } from './review.repository.interface';
import type { IEntityRepository } from '../entities/entity.repository.interface';
import { REVIEW_REPOSITORY } from './review.repository.interface';


@Injectable()
export class ReviewService {
  constructor(
    // Inject the Review Repository for Review data access
    @Inject(REVIEW_REPOSITORY) private readonly reviewRepository: IReviewRepository,
    // Inject the Entity Repository to check for entity existence and update aggregates (F4)
    @Inject(ENTITY_REPOSITORY) private readonly entityRepository: IEntityRepository,
  ) {}

  /**
   * F2: Handles the submission of a new review, including conflict checks and aggregate update.
   */
  async create(createReviewDto: CreateReviewDto, authorId: number): Promise<ReviewDetails> {
    const { entityId, ...reviewData } = createReviewDto;
    
    // 1. Check if the entity exists
    const entity = await this.entityRepository.findOne(entityId);
    if (!entity) {
      throw new NotFoundException(`Entity with ID ${entityId} not found.`);
    }

    // 2. Check for duplicate review (Conflict)
    const alreadyReviewed = await this.reviewRepository.hasUserReviewed(entityId, authorId);
    if (alreadyReviewed) {
      throw new ConflictException('You have already submitted a review for this entity.');
    }

    // 3. Create the review
    const review = await this.reviewRepository.create(reviewData, entityId, authorId);

    // 4. Recalculate and update Entity aggregates (F4)
    const { average, count } = await this.reviewRepository.calculateAggregates(entityId);
    
    await this.entityRepository.updateAggregates(entityId, average, count);

    return review;
  }

  /**
   * Retrieves all reviews for a specific entity.
   */
  async findAllByEntity(entityId: number): Promise<ReviewDetails[]> {
    // Check if the entity exists first
    const entity = await this.entityRepository.findOne(entityId);
    if (!entity) {
        throw new NotFoundException(`Entity with ID ${entityId} not found.`);
    }
    
    return this.reviewRepository.findAllByEntity(entityId);
  }
}