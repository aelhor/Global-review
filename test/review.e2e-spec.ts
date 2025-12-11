
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ReviewDetails } from '../src/reviews/review.repository.interface';
import { ReviewModule } from '../src/reviews/reviews.module';
import { ReviewService } from '../src/reviews/reviews.service';
import request from 'supertest';

import { CreateReviewDto } from '../src/reviews/dto/create-review.dto';
import { AppModule } from '../src/app.module';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../src/prisma/prisma.service';


describe('Review_e2e', () => {
    // define test data 
    let app: INestApplication
    let jwtService: JwtService
    let server: any
    let prisma: PrismaService
    // Test Data 
    let authToken
    let createdReviewId
    const entityId = 1
    const userId = 99
    const username = 'test_userII'
    const createReivewDto: CreateReviewDto = {
        title: 'Test',
        rating: 4,
        entityId: entityId
    }
    beforeAll(async () => {
        // create test module and ini nest app 
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile()

        // 2. Create the application instance
        app = moduleFixture.createNestApplication();
        await app.init();

        // Inject services needed for setup
        jwtService = moduleFixture.get<JwtService>(JwtService);
        prisma = moduleFixture.get<PrismaService>(PrismaService); // <--- GET PRISMA SERVICE
        server = app.getHttpServer();

        // Create User Record for Foreign Key Integrity ---
        try {
            const creatdUser = await prisma.user.upsert({
                where: { id: userId },
                update: { username: username }, // Update if it somehow exists
                create: {
                    id: userId,
                    username: username,
                    email: `${username}@test.com`,
                    passwordHash: 'e2e_hash_123'
                },
            });

        } catch (e) {
            // If user creation fails, the entire test suite will fail.
            console.error("Failed to set up test user:", e);
            throw e;
        }

        // 3. Generate a Test Authentication Token
        const payload: {
            sub: number; // User ID
            username: string;
        } = { sub: userId, username: username };
        authToken = jwtService.sign(payload);


    })

    // @Post(':entityId')
    describe('POST /reviews:entityId', () => {
        it('Should create a review for the entity eith id = entityId and return it', async () => {
            // need auth user
            const response = await request(server)
                .post(`/reviews/${entityId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(createReivewDto)
                .expect(HttpStatus.CREATED);
            // console.log('response:', response)
            expect(response.body).toBeDefined();
            expect(response.body.title).toEqual(createReivewDto.title);
            // Verify author details are correctly mapped from the existing user
            expect(response.body.author.username).toEqual(username);

            expect(response.body.id).toBeDefined();
            createdReviewId = response.body.id;

        })

        it('should return 401 Unauthorized without token', async () => {
            const response = await request(server)
                .post(`/reviews/${entityId}`)
                .send(createReivewDto)
                .expect(HttpStatus.UNAUTHORIZED)
        })
    })

    /*
    GET /reviews/:entityId
   * Public route: Retrieves all reviews for a specific entity.
    */
    describe(' GET /reviews/:entityId', () => {
        it('Should retrive all reviews for entity with id = entityId', async () => {
            const response = await request(server)
                .get(`/reviews/${entityId}`)
                .expect(HttpStatus.OK);

            expect(Array.isArray(response.body)).toBe(true);
            const foundReview = response.body.find((e: any) => e.id === createdReviewId);
            expect(foundReview).toBeDefined();
        })
    })



    afterAll(async () => {
        try {
            if (createdReviewId) {
                await prisma.review.delete({ where: { id: createdReviewId } });
            }
            await prisma.user.delete({ where: { id: userId } });
        } catch (e) {
            console.error('Cleanup failed', e);
        } finally {
            await app.close();
        }
    });

})