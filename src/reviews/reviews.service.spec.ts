import { Test, TestingModule } from '@nestjs/testing';
import { ReviewService } from './reviews.service';
import { IReviewRepository, REVIEW_REPOSITORY, ReviewAggregates, ReviewDetails } from './review.repository.interface';
import { ENTITY_REPOSITORY, EntityDetails, IEntityRepository } from '../entities/entity.repository.interface';
import { CreateReviewDto } from './dto/create-review.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { assert } from 'console';

// --- Global Mocks Definition ---
// Define the mock structures and ensure the functions are typed as Jest Mocks
// This prevents the 'mockResolvedValue' error during assignment
const mockReviewRepository = {
    hasUserReviewed: jest.fn() as jest.Mock,
    create: jest.fn() as jest.Mock,
    calculateAggregates: jest.fn() as jest.Mock,
    findAllByEntity: jest.fn() as jest.Mock,
};

const mockEntityRepository = {
    findOne: jest.fn() as jest.Mock,
    updateAggregates: jest.fn() as jest.Mock,
    // Add other necessary methods to satisfy the IEntityRepository partial interface if needed
};


describe.skip('ReviewService', () => {
    let service: ReviewService;

    // Assign the references to the globally defined mock objects
    // We use the same name as the mock constants for clarity
    let reviewRepoMock: typeof mockReviewRepository;
    let entityRepoMock: typeof mockEntityRepository;

    // Define reusable test data
    const authorId = 1;
    const entityId = 10;
    const mockEntity: Partial<EntityDetails> = { id: entityId, title: 'Test Entity' };
    const createReviewDto: CreateReviewDto = {
        rating: 4,
        title: "Test Review",
        content: 'Test comment',
        entityId: entityId
    };
    // Mock data for the successful review creation test
    const mockReviews: ReviewDetails[] = [
        { id: 101, rating: 5, title: "ٌGreat Review", content: 'Great!', createdAt: new Date(), author: { username: 'userA' } },
        { id: 102, rating: 3, title: "Ok Review", content: 'OK.', createdAt: new Date(), author: { username: 'userB' } },
    ];[]

    const mockCreatedReview: ReviewDetails = {
        id: 200,
        rating: 4,
        title: "Test Review",
        content: 'Test comment',
        createdAt: new Date(),
        author: { username: 'test_author' }
    };

    const mockNewAggregates: ReviewAggregates = {
        average: 4.2,
        count: 5,
    };


    beforeEach(async () => {
        // Reset call counts and mock return values before each test
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReviewService,
                {
                    provide: REVIEW_REPOSITORY,
                    useValue: mockReviewRepository,
                },
                {
                    provide: ENTITY_REPOSITORY,
                    useValue: mockEntityRepository,
                },
            ],
        }).compile();

        service = module.get<ReviewService>(ReviewService);

        // Retrieve the mock instances using the direct constant references
        reviewRepoMock = module.get(REVIEW_REPOSITORY);
        entityRepoMock = module.get(ENTITY_REPOSITORY);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });



    describe('create(dto, authorId)', () => {
        it('should throw ConflictException if user has already reviewed the entity', async () => {
            console.log('Start 2nd test')
            // ARRANGE        
            // 1. Configure mock Entity to exist (prevent NotFound error first)
            entityRepoMock.findOne.mockResolvedValue(mockEntity);


            // 2. Configure mock Review Repo to indicate conflict (Crucial trigger)
            reviewRepoMock.hasUserReviewed.mockResolvedValue(true);

            // ACT & ASSERT: Expect the service call to reject and throw the specific exception
            await expect(service.create(createReviewDto, authorId)).rejects.toThrow(ConflictException);

            // Verification: Ensure the flow stopped at the conflict check
            expect(reviewRepoMock.hasUserReviewed).toHaveBeenCalledWith(entityId, authorId);
            expect(reviewRepoMock.create).not.toHaveBeenCalled();
        });
        it('creates a new review for entity', async () => {
            //ArrangeOne      
            // 1. Entity exists check passes
            entityRepoMock.findOne.mockResolvedValue(mockEntity)

            // 2. Conflict check passes (returns false)
            reviewRepoMock.hasUserReviewed.mockResolvedValue(false);

            // 3. Mock the creation of the review
            reviewRepoMock.create.mockResolvedValue(mockCreatedReview);

            // 4. Mock the calculation of new aggregates
            reviewRepoMock.calculateAggregates.mockResolvedValue(mockNewAggregates);

            // 5. Mock the entity update (it should be called, but we don't need a specific return value)
            entityRepoMock.updateAggregates.mockResolvedValue({} as EntityDetails);

            //ACT 
            const result = await service.create(createReviewDto, authorId);

            //ASSERT
            expect(result).toEqual(mockCreatedReview);

            // 2. Verify creation was performed (F2)
            const { entityId: dtoEntityId, ...reviewData } = createReviewDto;
            expect(reviewRepoMock.create).toHaveBeenCalledWith(reviewData, entityId, authorId);

            // 3. Verify aggregate calculation was performed
            expect(reviewRepoMock.calculateAggregates).toHaveBeenCalledWith(entityId);
            // 4. Verify entity update was performed with the *calculated* results (F4)
            expect(entityRepoMock.updateAggregates).toHaveBeenCalledWith(
                entityId,
                mockNewAggregates.average,
                mockNewAggregates.count
            );
        })

        it('should throw NotFoundException if the entity does not exist', async () => {

            // ARRANGE
            entityRepoMock.findOne.mockResolvedValue(null)
            // ACT 
            expect(service.create(createReviewDto, authorId)).rejects.toThrow(NotFoundException)

            // ASSERT 
            expect(reviewRepoMock.hasUserReviewed).not.toHaveBeenCalled()
            expect(reviewRepoMock.create).not.toHaveBeenCalled()
            expect(entityRepoMock.updateAggregates).not.toHaveBeenCalled()

        });
    })

    describe('findAllByEntity(entityId)', () => {
        it('should successfully return reviews for an existing entity', async () => {
            // ARRANGE
            entityRepoMock.findOne.mockResolvedValue(mockEntity)
            reviewRepoMock.findAllByEntity.mockResolvedValue(mockReviews)
            //ACT 
            const reviews = await service.findAllByEntity(entityId)
            // ASSERT 
            expect(reviews).toEqual(mockReviews)
            expect(entityRepoMock.findOne).toHaveBeenCalledWith(entityId)
            expect(reviewRepoMock.findAllByEntity).toHaveBeenCalledWith(entityId)
        })

        it('should throw NotFoundException if the entity is missing', async () => {
            // arranage
            entityRepoMock.findOne.mockResolvedValue(null)

            // act 
            expect(await service.findAllByEntity(entityId)).rejects.toThrow(NotFoundException)

            // assert
            expect(entityRepoMock.findOne).toHaveBeenCalledWith(entityId)
            expect(reviewRepoMock.findAllByEntity).not.toHaveBeenCalled()
        })
    })
});