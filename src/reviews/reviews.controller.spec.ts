import { Test } from '@nestjs/testing';
import { ReviewController } from './reviews.controller';
import { ReviewService } from './reviews.service';
import { ReviewDetails } from './review.repository.interface';
import { ModuleMocker, MockMetadata } from 'jest-mock';

const moduleMocker = new ModuleMocker(global);


describe('ReviewController', () => {
    let reviewController: ReviewController
    let reviewService: ReviewService
    const reviews: ReviewDetails[] = [{
        id: 1, title: 'test', content: 'content', rating: 2, createdAt: new Date(), author: { username: 'test' }
    }]
    beforeEach(async () => {
        let moduleRef = await Test.createTestingModule({
            controllers: [ReviewController],
            // providers: [ReviewService]
        })
            .useMocker((token) => {

                if (token === ReviewService) {
                    return { findAllByEntity: jest.fn().mockResolvedValue(reviews) };
                }
                if (typeof token === 'function') {
                    const mockMetadata = moduleMocker.getMetadata(
                        token,
                    ) as MockMetadata<any, any>;
                    const Mock = moduleMocker.generateFromMetadata(
                        mockMetadata,
                    ) as ObjectConstructor;
                    return new Mock();
                }
            })
            .compile()

        reviewController = moduleRef.get(ReviewController)
        reviewService = moduleRef.get(ReviewService)
    })

    describe("FindAllByEntity", () => {
        it('Should return all reviews for a specific entity', async () => {


            const result = await reviewController.findAllByEntity(1);
            expect(result).toEqual(reviews);

        })

    })


})
