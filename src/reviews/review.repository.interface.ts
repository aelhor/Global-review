import { CreateReviewDto } from './dto/create-review.dto';
import { Prisma } from '@prisma/client';

// The shape of the data when fetching reviews
export type ReviewDetails = Prisma.ReviewGetPayload<{
    select: {
        id: true;
        rating: true;
        content: true;
        title: true,
        createdAt: true;
        author: {
            select: { username: true };
        };
    };
}>;

// Define the shape of the aggregate data needed for Entity updates
export interface ReviewAggregates {
    average: number;
    count: number;
}

export interface IReviewRepository {
    /**
     * Creates a new review for a given entity and author.
     */
    create(data: Omit<CreateReviewDto, 'entityId'>, entityId: number, authorId: number): Promise<ReviewDetails>;

    /**
     * Finds all reviews for a specific entity.
     */
    findAllByEntity(entityId: number): Promise<ReviewDetails[]>;

    /**
     * Calculates the current average score and total count of reviews for an entity.
     */
    calculateAggregates(entityId: number): Promise<ReviewAggregates>;

    /**
     * Checks if a user has already reviewed a specific entity.
     */
    hasUserReviewed(entityId: number, authorId: number): Promise<boolean>;
}

export const REVIEW_REPOSITORY = 'REVIEW_REPOSITORY';