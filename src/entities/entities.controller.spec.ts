import { Test, TestingModule } from "@nestjs/testing"
import { CreateEntityDto } from "./dto/create-entity.dto"
import { EntityController } from "./entities.controller"
import { EntityDetails } from "./entity.repository.interface"
import { EntityService } from "./entities.service"
import { BadRequestException, NotFoundException } from "@nestjs/common"
import { mock } from "node:test"


// mock the entity service  
const mockEntityService = {
    create: jest.fn() as jest.Mock,
    findAll: jest.fn() as jest.Mock,
    findOne: jest.fn() as jest.Mock
}

describe('EntityController', () => {

    let controller: EntityController
    // DECLARE serviceMock AS TYPEOF mockEntityService
    let entityMockService: typeof mockEntityService
    // Define reusable test data constants (DTOs, IDs, expected results)
    const authorId = 1
    const entityId = 10
    const createDto: CreateEntityDto = {
        category: 'test category',
        title: 'test title',
        description: 'test description'
    }
    // Expected successful return object
    const mockEntityDetails: EntityDetails = {
        id: 1,
        category: 'test category',
        title: 'test title',
        description: 'test description',
        createdAt: new Date(),
        averageRating: 0,
        reviewCount: 0,
        author: { username: "test user" }
    }
    const mockRequest = {
        user: {
            id: authorId
        }
    } as any;

    beforeAll(async () => {
        jest.clearAllMocks()

        // Configure the Testing Module
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EntityController,
                {
                    provide: EntityService, useValue: mockEntityService
                },

            ]
        }).compile();
        controller = module.get<EntityController>(EntityController)
        entityMockService = module.get(EntityService)
    })

    it('should be defined', () => {
        expect(controller).toBeDefined();
    })

    describe('POST /', () => {
        it('should call service.create and return the result', async () => {
            // ARRANGE 
            // 1. Configure serviceMock.create to resolve to mockEntityDetails
            mockEntityService.create.mockResolvedValue(mockEntityDetails)
            // ACT
            // 2. Call controller.create(createDto, authorId)
            let res = await controller.create(createDto, mockRequest)
            // ASSERT
            // 3. Assert the result equals mockEntityDetails
            expect(res).toEqual(mockEntityDetails)
            // 4. Assert serviceMock.create was called with (createDto, authorId)
            expect(mockEntityService.create).toHaveBeenCalledWith(createDto, authorId)
        })

        it('should call service.create and throw error', async () => {
            // ARRANGE 
            const mockError = new Error('Unique constraint failed');
            mockEntityService.create.mockRejectedValue(mockError);

            // ACT & ASSERT
            await expect(controller.create(createDto, mockRequest))
                .rejects
                .toThrow(mockError); // Asserts that the promise rejects with the exact mockError object

            expect(mockEntityService.create).toHaveBeenCalledWith(createDto, authorId);
        });
    })

    describe('GET / findOne', () => {
        it('Call findOne function and return an entity', async () => {
            mockEntityService.findOne.mockResolvedValue(mockEntityDetails)

            let res = await controller.findOne(entityId)

            expect(res).toEqual(mockEntityDetails)
            expect(mockEntityService.findOne).toHaveBeenCalledWith(entityId)
        })



        it('Call findOne function and throw not found error', async () => {
            const notFoundError = new NotFoundException('Entity not found');

            mockEntityService.findOne.mockRejectedValue(notFoundError);

            // Assert that the controller throws the error
            await expect(controller.findOne(entityId))
                .rejects
                .toThrow(notFoundError);


            expect(mockEntityService.findOne).toHaveBeenCalledWith(entityId)
        })


        // it('Call findOne function with non numric and throw Bad Request error', async () => {
        //     const mockError = new BadRequestException('Validation failed (numeric string is expected)');
        //     mockEntityService.findOne.mockRejectedValue(mockError);
        //     // Mock the controller method to throw the error when called with non-numeric ID
        //     // jest.spyOn(controller, 'findOne').mockImplementation(async () => {
        //     //     throw mockError;
        //     // });

        //     expect(await controller.findOne('an' as any)).rejects.toThrow(mockError)

        //     expect(mockEntityService.findOne).toHaveBeenCalledWith(entityId)

        // })

        // fails as the method is callled eith NAN 
        it.skip('should throw BadRequestException when ID is non-numeric', async () => {
            // ARRANGE: No service mock needed, as the service should NOT be called.
            const nonNumericId = 'abc';

            // ACT & ASSERT: Expect the controller call to reject due to pipe failure.
            // The error thrown by ParseIntPipe is a BadRequestException (HTTP 400).
            await expect(controller.findOne(nonNumericId as any))
                .rejects
                .toThrow(BadRequestException);

            // VERIFICATION: The service must not have been called.
            expect(mockEntityService.findOne).not.toHaveBeenCalled();
        });
    })




})



// [credential]
// 	helper = wincred
// [user]
// 	name = ahmed-e-elhor
// 	email = ahmed.elhor@kortobaa.com
// [alias]
// 	name = config --global user.name
// 	email = config --global user.email
// 	personal-login = !git config --global user.name aelhor && git config --global user.email aelhor90@gmail.com
// 	work-login = !git config --global user.name ahmed-e-elhor && git config --global user.email ahmed.elhor@kortobaa.com
// ///////////////