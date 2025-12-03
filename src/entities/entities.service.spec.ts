import { Test, TestingModule } from '@nestjs/testing';
import { EntityService } from './entities.service';
import { ENTITY_REPOSITORY, EntityDetails } from './entity.repository.interface';
import { CreateEntityDto } from './dto/create-entity.dto';
import { assert } from 'console';



// 1- mock the entity repo 
const EntityRepoMock = {
  create: jest.fn() as jest.Mock,
  findOne: jest.fn() as jest.Mock,
  findAll: jest.fn() as jest.Mock,
  updateAggregates: jest.fn() as jest.Mock
}
describe.skip('EntityService', () => {
  // 2- declare service under test and mock repo
  let service: EntityService; // service under test 
  let entityMockRepo: typeof EntityRepoMock


  // 3 - define test data 
  const entityId = 1
  const authorId = 1
  // Define CONST mockEntity (the expected return value for findOne/create)
  const mockEntity: EntityDetails = {
    id: 1,
    title: 'mock entity',
    description: 'description',
    category: 'Cat_1',
    averageRating: 0,
    reviewCount: 0,
    createdAt: new Date(),
    author: { username: 'author' },
  }

  const mockEntityList: EntityDetails[] = [{
    id: 1,
    title: 'mock entity',
    description: 'description',
    category: 'Cat_1',
    averageRating: 0,
    reviewCount: 0,
    createdAt: new Date(),
    author: { username: 'author' },
  },
  {
    id: 1,
    title: 'search entity',
    description: 'description',
    category: 'Cat_1',
    averageRating: 0,
    reviewCount: 0,
    createdAt: new Date(),
    author: { username: 'author' },
  }]
  // Define CONST createDto (the required input for the create method)
  // DEFINE CONST createDto AS OBJECT
  const createEntityDto: CreateEntityDto = {
    title: 'mock entity',
    description: 'description',
    category: 'Cat_1',
  }

  // 4- befor each test rins setup 
  beforeEach(async () => {
    // 4(1)- clean all mock 
    jest.clearAllMocks()
    // 4(2)- Configure the Testing Module
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EntityService,
        {
          provide: ENTITY_REPOSITORY,
          useValue: EntityRepoMock,
        }
      ]
    }).compile();
    // 4(3) Get the initialized service instance
    service = module.get<EntityService>(EntityService);

    // 4. Get the mock reference (CRUCIAL step for calling .mockResolvedValue later)
    entityMockRepo = module.get(ENTITY_REPOSITORY)
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });



  describe('create(dto, authorId)', () => {
    it('should successfully call the repository create method and return the result', async () => {
      // ARRANGE
      // 1. Configure entityRepoMock.create to return your mockEntity object (simulating a successful save)
      entityMockRepo.create.mockResolvedValue(mockEntity)
      // ACT
      // 2. Call service.create with createDto and authorId
      let newEntity = await service.create(createEntityDto, authorId)

      // ASSERT
      // 3. Assert the result EXACTLY equals the mockEntity
      expect(newEntity).toEqual(mockEntity)
      // 4. Assert entityRepoMock.create was called with the correct parameters (createDto, authorId)
      expect(entityMockRepo.create).toHaveBeenCalledWith(createEntityDto, authorId)
    })

    it('should throw the repository error if creation fails', async () => {
      // arrange  
      const mockError = new Error('Database connection failed')
      entityMockRepo.create.mockRejectedValue(mockError)

      // act // assert 
      await expect(service.create(createEntityDto, authorId)).rejects.toThrow(mockError);

      expect(entityMockRepo.create).toHaveBeenCalledWith(createEntityDto, authorId);

    })
  })


  describe('Query Methods (findAll and findOne)', () => {
    it('should successfully find a single entity by ID', async () => {
      // arrange 
      entityMockRepo.findOne.mockResolvedValue(mockEntity)

      //act 
      const entity = await service.findOne(entityId)

      // assert 
      expect(entity).toEqual(mockEntity)

      expect(entityMockRepo.findOne).toHaveBeenCalledWith(entityId)

    })

    it('should return null if the entity ID is not found', async () => {
      entityMockRepo.findOne.mockResolvedValue(null)

      const entity = await service.findOne(99)

      expect(entity).toBeNull()
      expect(entityMockRepo.findOne).toHaveBeenCalledWith(99)
    });

    it('should return all entities when no search term is provided', async () => {
      entityMockRepo.findAll.mockResolvedValue([mockEntity])
      // act 
      const entities = await service.findAll()
      // assert 
      expect(entities).toEqual([mockEntity])
      expect(entityMockRepo.findAll).toHaveBeenCalled()
    })
    it('should return filtered entities when a search term is provided', async () => {
      // Arrange
      const expectedEntity = mockEntityList[1];
      entityMockRepo.findAll.mockResolvedValue([expectedEntity]);
      // act 
      const result = await service.findAll('search');
      // Assert 
      expect(result).toEqual([expectedEntity]);
      expect(entityMockRepo.findAll).toHaveBeenCalledWith('search');
    })

    it('should return an empty array if no entities are found', async () => {
      entityMockRepo.findAll.mockResolvedValue([])

      let res = await service.findAll()

      expect(res).toEqual([])
      expect(entityMockRepo.findAll).toHaveBeenCalled()
    });
  })



});