import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreateEntityDto } from '../src/entities/dto/create-entity.dto';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../src/prisma/prisma.service'; // <--- NEW IMPORT

describe('EntityController (e2e)', () => {
  let app: INestApplication;
  let server: any;
  let jwtService: JwtService;
  let prisma: PrismaService;

  // Test data for authentication and creation
  const testUserId = 9999; // Use a high ID to avoid collisions
  const testUsername = 'e2e_test_user';
  let authToken: string;
  let createdEntityId: number;

  const createDto: CreateEntityDto = {
    category: 'E2E Test Category',
    title: 'E2E Test Title',
    description: 'This entity was created during end-to-end testing.'
  };

  /**
   * Step 1: Initialize the full NestJS application environment & create the test user.
   */
  beforeAll(async () => {
    // 1. Compile the full module structure
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    // 2. Create the application instance
    app = moduleFixture.createNestApplication();
    await app.init();

    // Inject services needed for setup
    jwtService = moduleFixture.get<JwtService>(JwtService);
    prisma = moduleFixture.get<PrismaService>(PrismaService); 
    server = app.getHttpServer();

    // Create User Record for Foreign Key Integrity ---
    try {
      const creatdUser = await prisma.user.upsert({
        where: { id: testUserId },
        update: { username: testUsername }, // Update if it somehow exists
        create: {
          id: testUserId,
          username: testUsername,
          email: `${testUsername}@test.com`,
          passwordHash: 'e2e_hash_123'
        },
      });
      console.log(`Created test user ID: ${creatdUser}`);
    } catch (e) {
      // If user creation fails, the entire test suite will fail.
      console.error("Failed to set up test user:", e);
      throw e;
    }

    // 3. Generate a Test Authentication Token
    const payload: {
      sub: number; // User ID
      username: string;
    } = { sub: testUserId, username:testUsername };
    authToken = jwtService.sign(payload);
    console.log('authToken: ', authToken)
  });

  describe('POST /entities', () => {
    it('should create a new entity and return 201', async () => {
      const response = await request(server)
        .post('/entities')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(HttpStatus.CREATED);

      expect(response.body).toBeDefined();
      expect(response.body.title).toEqual(createDto.title);
      // Verify author details are correctly mapped from the existing user
      expect(response.body.author.username).toEqual(testUsername);

      expect(response.body.id).toBeDefined();
      createdEntityId = response.body.id;
    });

    it('should return 401 Unauthorized without token', () => {
      return request(server)
        .post('/entities')
        .send(createDto)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /entities/:id', () => {
    it('should retrieve the newly created entity and return 200', async () => {
      const response = await request(server)
        .get(`/entities/${createdEntityId}`)
        .expect(HttpStatus.OK);

      expect(response.body.id).toEqual(createdEntityId);
      expect(response.body.description).toEqual(createDto.description);
    });

    it('should return 404 Not Found for a non-existent ID', () => {
      const nonExistentId = 999999999;

      return request(server)
        .get(`/entities/${nonExistentId}`)
        .expect(HttpStatus.NOT_FOUND)
        .expect((res) => {
          expect(res.body.statusCode).toEqual(404);
          expect(res.body.message).toContain('not found');
        });
    });

    it('should return 400 Bad Request for a non-numeric ID (Pipe Failure)', () => {
      return request(server)
        .get('/entities/abc')
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.statusCode).toEqual(400);
          expect(res.body.message).toContain('Validation failed');
        });
    });
  });

  describe('GET /entities', () => {
    it('should return a list of entities and include the created entity', async () => {
      const response = await request(server)
        .get('/entities')
        .expect(HttpStatus.OK);

      expect(Array.isArray(response.body)).toBe(true);

      const foundEntity = response.body.find((e: any) => e.id === createdEntityId);
      expect(foundEntity).toBeDefined();
    });

    it('should return a list of entities when searching', async () => {
      const response = await request(server)
        .get('/entities')
        .query({ search: createDto.title })
        .expect(HttpStatus.OK);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
    });
  });


  /**
   * Step 6: Teardown - Clean up created data in reverse order.
   * This is CRITICAL for preventing test pollution.
   */
  afterAll(async () => {
    // 1. Delete the created entity
    if (createdEntityId) {
      await prisma.entity.delete({ where: { id: createdEntityId } });
      console.log(`Deleted entity ID: ${createdEntityId}`);
    }

    // 2. Delete the test user (This MUST be done last if the user is an FK owner)
    await prisma.user.delete({ where: { id: testUserId } });
    console.log(`Deleted test user ID: ${testUserId}`);

    // 3. Close the application
    await app.close();
  });
});