# 🧪 Testing Strategy: Decoupling & Coverage

This document outlines the testing approach to ensure correctness, maintainability, and confidence across all application layers. We follow a three-layer strategy:

## 1. Unit Tests (Service-Level Business Logic)

**Goal:** Test business logic in complete isolation.

### EntityService – Test Cases

#### [create()](cci:1://file:///e:/Personal%20projects/global-review-platform/src/reviews/reviews.service.ts:23:2-50:3)
- Confirms the service calls [entityRepository.create()](cci:1://file:///e:/Personal%20projects/global-review-platform/src/reviews/reviews.service.ts:23:2-50:3) with the correct DTO and `authorId`.

#### [findAll()](cci:1://file:///e:/Personal%20projects/global-review-platform/src/entities/entities.service.ts:24:4-30:5)
- Ensures the search term is forwarded correctly to [IEntityRepository.findAll()](cci:1://file:///e:/Personal%20projects/global-review-platform/src/entities/entities.service.ts:24:4-30:5).

### ReviewService – Test Cases

#### Conflict Handling
- If [hasUserReviewed()](cci:1://file:///e:/Personal%20projects/global-review-platform/src/reviews/review.repository.interface.ts:39:4-42:73) returns true, the service must throw `ConflictException`.

#### Aggregate Update Flow
Verifies the sequence:
1. [calculateAggregates()](cci:1://file:///e:/Personal%20projects/global-review-platform/src/reviews/review.repository.interface.ts:34:4-37:68)
2. `entityRepository.updateAggregates()`

> All repository methods are mocked to assert call order and behavior.

## 2. Integration Tests (HTTP Layer + Dependency Injection)

**Goal:** Validate end-to-end wiring of controllers, services, modules, guards, and request handling.

### EntityController – Test Cases
- `POST /entities` without JWT → 401 Unauthorized
  - Confirms `JwtAuthGuard` is active.
- `GET /entities?search=term` forwards the query
  - Ensures query parameters are passed correctly to the service.

### ReviewController – Test Cases
- `POST /reviews/:entityId` maps route parameters correctly
  - Validates that `entityId` is extracted from the URL and passed to the service layer.

## 3. Repository Tests (Deep DB Integration)

**Goal:** Validate Prisma repository behavior using a real test database.

### PrismaEntityRepository – Test Cases

#### Search Logic
- [findAll('search term')](cci:1://file:///e:/Personal%20projects/global-review-platform/src/entities/entities.service.ts:24:4-30:5) returns only matching entities.
- Verifies use of `contains + mode: 'insensitive'`.

### PrismaReviewRepository – Test Cases

#### Aggregate Calculation
Insert reviews (e.g., scores 5, 5, 2).

[calculateAggregates()](cci:1://file:///e:/Personal%20projects/global-review-platform/src/reviews/review.repository.interface.ts:34:4-37:68) should return:
- `avg: 4.0`
- `count: 3`

## Summary

| Test Layer          | What It Covers                     | Purpose                                  |
|---------------------|-----------------------------------|------------------------------------------|
| Unit Tests         | Services (business logic)         | Validate logic in isolation using mocks. |
| Integration Tests  | Controllers + DI + Guards         | Validate request flow and module wiring. |
| Repository Tests   | Prisma DB Queries                 | Validate real database behavior.         |

This multi-layer strategy provides strong safety and confidence—ensuring each part of the system behaves correctly on its own and as part of the whole.