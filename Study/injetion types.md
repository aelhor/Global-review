## Dependency Injection in NestJS: Class vs Token

### Comparison

| Aspect | **Direct Class Injection** | **Token-Based Injection** |
|---|---|---|
| **Definition** | Inject a provider by its class. | Use a token (string, symbol or interface) and `@Inject(...)` to resolve a provider. |
| **Simplicity** | Very simple and idiomatic. | More boilerplate: define provider manually, then inject via token. |
| **Flexibility** | Less flexible — tied to a specific implementation. | Highly flexible — you can swap implementations easily. |
| **Abstraction / Coupling** | Tighter coupling; consumers know the concrete class. | Looser coupling; aligns with clean architecture or DDD. |
| **Testing** | Easy to mock: provide a stub or mock class. | Even more powerful: override the token to provide a mock implementation without touching consumer code. |
| **Use Cases** | - One obvious implementation <br>- Simple services <br>- Controllers/services that don't need to switch impls | - Multiple implementations (e.g. repo layer) <br>- Interface-driven design <br>- Config/factory providers <br>- Clean architecture |

---

### Examples

#### 1. Direct Class Injection

```ts
@Injectable()
export class ReviewService {
  // business logic …
}

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get()
  getAll() {
    return this.reviewService.findAll();
  }
}

@Module({
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
``` 

#### 2. Token-Based Injection (Custom Provider)
```TS
// review-repository.interface.ts
export interface IReviewRepository {
  save(review: Review): Promise<Review>;
  findByEntityId(entityId: number): Promise<Review[]>;
}

// tokens.ts
export const REVIEW_REPOSITORY = Symbol('REVIEW_REPOSITORY');

// prisma implementation
@Injectable()
export class PrismaReviewRepository implements IReviewRepository {
  async save(review: Review) { … }
  async findByEntityId(entityId: number) { … }
}

// in-memory implementation (for testing or dev)
@Injectable()
export class InMemoryReviewRepository implements IReviewRepository {
  private store = new Map<number, Review[]>();
  async save(review: Review) { … }
  async findByEntityId(entityId: number) { … }
}

@Module({
  providers: [
    {
      provide: REVIEW_REPOSITORY,
      useClass: PrismaReviewRepository,
    },
    ReviewService,
  ],
  exports: [REVIEW_REPOSITORY, ReviewService],
})
export class ReviewModule {}

@Injectable()
export class ReviewService {
  constructor(
    @Inject(REVIEW_REPOSITORY)
    private readonly reviewRepo: IReviewRepository,
  ) {}

  async createReview(data) {
    return this.reviewRepo.save(data);
  }
}

```

Testing override:
```TS
const module = await Test.createTestingModule({
  providers: [
    ReviewService,
    {
      provide: REVIEW_REPOSITORY,
      useClass: InMemoryReviewRepository,
    },
  ],
}).compile();
```

### When to Use Which

- Direct Class Injection:
Use this when you have a single concrete implementation, want simplicity, and don’t need to swap out that implementation later.

- Token-Based Injection:
Use this when you want abstraction (e.g., repository interface), need multiple implementations, or follow clean architecture / DDD. Also useful for injecting factories, dynamic values, or mocks in tests.

Summary (Cheat Sheet)

✅ Direct injection: constructor(private readonly MyService: MyService)

✅ Token injection: define a token, provide: TOKEN, useClass/useFactory, inject with @Inject(TOKEN)

💡 Use token-based injection for decoupling, flexible architecture, and better testability

🧪 Use direct injection when you want simplicity and your service design is stable
``