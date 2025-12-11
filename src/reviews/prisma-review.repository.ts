import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IReviewRepository, ReviewDetails, ReviewAggregates } from './review.repository.interface';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class PrismaReviewRepository implements IReviewRepository {
    constructor(
        private prisma: PrismaService
    ) { }

    private readonly selection = {
        id: true,
        rating: true,
        content: true,
        title:true,
        createdAt: true,
        author: {
            select: { username: true },
        },
    };

    async create(data: Omit<CreateReviewDto, 'entityId'>, entityId: number, authorId: number): Promise<ReviewDetails> {
        // Note: We already check for conflict in the Service layer, but the repository handles the persistence.

        const review = await this.prisma.review.create({
            data: {
                ...data,
                entityId: entityId,
                authorId
            },
            select: this.selection,
        });

        
        return review;
    }

    async findAllByEntity(entityId: number): Promise<ReviewDetails[]> {
        return this.prisma.review.findMany({
            where: { entityId },
            select: this.selection,
            orderBy: { createdAt: 'desc' },
        });
    }

    async hasUserReviewed(entityId: number, authorId: number): Promise<boolean> {
        const count = await this.prisma.review.count({
            where: { entityId, authorId },
        });
        return count > 0;
    }

    /**
     * Uses Prisma's native aggregate function to calculate the average and count 
     * of all reviews for a specific entity ID.
     */
    async calculateAggregates(entityId: number): Promise<ReviewAggregates> {
        const result = await this.prisma.review.aggregate({
            where: { entityId },
            _avg: { rating: true },
            _count: true,
        });

        const average = result._avg.rating ? parseFloat(result._avg.rating.toFixed(2)) : 0;
        const count = result._count;

        return { average, count };
    }
}