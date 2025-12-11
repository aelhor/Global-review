# Global-review

A monolithic web application for collecting, managing and reviewing global content (reviews, feedback, or similar domain). This repository contains the monolithic implementation and a clear roadmap to evolve the project:

- Stage 1 (current): monolithic app with full unit and end-to-end (E2E) tests and caching.
- Stage 2 (future): migrate to a microservice architecture to improve scalability, deployment independence and fault isolation.

This README documents how to get started, testing strategy, caching plan, and the migration roadmap.

---

## Table of contents

- [Project overview](#project-overview)
- [Goals & roadmap](#goals--roadmap)
  - [Stage 1 — Monolith (current)](#stage-1-----monolith-current)
  - [Stage 2 — Migration to microservices (planned)](#stage-2-----migration-to-microservices-planned)
- [Tech stack (suggested / editable)](#tech-stack-suggested--editable)
- [Getting started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment variables](#environment-variables)
  - [Install](#install)
  - [Run](#run)
- [Testing](#testing)
  - [Unit tests](#unit-tests)
  - [E2E tests](#e2e-tests)
  - [CI suggestions](#ci-suggestions)
- [Caching strategy (Stage 1)](#caching-strategy-stage-1)
- [Migration plan to microservices (Stage 2)](#migration-plan-to-microservices-stage-2)
- [Development & contribution](#development--contribution)
- [License & contact](#license--contact)

---

## Project overview

Global-review is implemented as a single, modular monolith to enable rapid development and to provide a stable base for implementing comprehensive tests and caching. Modules are structured so each domain area (for example: users, reviews, moderation, notifications) can be separated into independent services during the migration phase.

The repository will host:
- Application source code
- Unit test suites
- End-to-end (E2E) test suites
- Caching integration (e.g., Redis)
- Docker files for local development and testing

---

## Goals & roadmap

### Stage 1 — Monolith (current)
Short-term goals:
- Keep a single deployable application for faster iteration.
- Implement full unit test coverage for core modules and business logic.
- Implement E2E tests covering public workflows (sign-up/login, create review, moderation, list reviews).
- Add caching (Redis or equivalent) for frequently-read endpoints and expensive queries.
- Make code modular and follow clear boundaries so migration is straightforward.

Deliverables:
- Test coverage target (e.g., 80%+ for critical modules).
- CI pipeline that runs unit + E2E tests.
- Performance improvements via caching and targeted optimizations.

### Stage 2 — Migration to microservices (planned)
Mid-term goals:
- Decompose monolith into separate microservices by domain (e.g., auth, reviews, entity, notifications, search).
- Introduce API gateway and service discovery.
- Move shared persistence to per-service databases (or schemas) and migrate data with minimal downtime.
- Add cross-service communication patterns (sync via HTTP/gRPC and async via message broker like RabbitMQ/Kafka).
- Add per-service CI/CD and observability (metrics, logs, tracing).

Migration approach:
- Extract read-only or low-risk services first (e.g., notifications, analytics).
- Introduce contract tests and compatibility layers.
- Incrementally redirect traffic to new services.

---

## Tech stack 

The repo is intentionally technology-agnostic. Suggested stack examples:
- Backend:  NestJS
- Database: Mysql (primary), with Prisma ORM
- Message broker (stage 2): RabbitMQ or Kafka
- Tests: Jest + Supertest (Node), 
- Containerization: Docker / Docker Compose
---

## Getting started

### Prerequisites
- Node.js >= 16 (if Node stack) or appropriate runtime for chosen stack
- npm or yarn
- Docker & Docker Compose (recommended for local DB/Redis)
- Git

### Environment variables

Create a `.env` file (or use `.env.local`) with values similar to:

DB_URL=postgres://user:password@localhost:5432/global_review
PORT=3000
NODE_ENV=development
REDIS_URL=redis://localhost:6379
JWT_SECRET=changeme_in_production



### Install

Install dependencies:

- npm
  npm install

### Run (development)

Start local dependencies (example using Docker Compose):
docker compose up -d postgres redis

Run the app in dev mode:
```bash
npm run dev
```

Run the app in production mode:
```bash
npm start
```
A Dockerfile and docker-compose.yml will be included/added to simplify running the stack.

---

## Testing

Testing is a first-class goal for Stage 1. We will maintain separate commands and CI steps for unit and E2E tests.

- run unit tests and output coverage
```bash
 npm run test 
 ```

- run end-to-end tests (against local or CI environment)
```bash 
npm run test:e2e 
```
- run specific e2e test
```bash 
npm run test:e2e -- --testPathPatterns=test/review.e2e-spec.ts 
```

Unit tests
- Focus on business logic, utilities and repository layer mocks.
- Aim for high coverage in domain-critical modules.
- Use test doubles / mocks for external services (email, 3rd-party APIs).

E2E tests
- Run against a running instance (local docker compose or a CI test environment).
- Cover key user journeys: sign-up/login, create and read reviews, moderation, and error flows.
- Use a deterministic test database and reset state between tests.

CI suggestions
- Run unit tests and fail fast on coverage threshold.
- Start a test DB and Redis service for E2E tests (Docker Compose in CI).
- Run linters and static analysis before merging.

---

## Caching strategy (Stage 1)

Primary objectives:
- Reduce latency and DB load on frequently-read endpoints (list reviews, aggregated counts).
- Cache invalidation patterns should be simple and consistent.

Recommended approach:
- Use Redis for request-level and application-level caching.
- Cache read-heavy endpoints (e.g., GET /reviews?page=1).
- Use short TTLs for dynamic data, longer TTLs for static/rarely-changing data.
- Implement cache invalidation on write events:
  - After creating/updating/deleting a review, invalidate relevant keys (e.g., review list pages, aggregated counts).
  - Use cache-aside pattern: application reads from cache; on cache miss, fetch from DB and populate cache.
- Consider background cache warming for high-traffic endpoints.

Instrumentation:
- Record cache hit/miss metrics to track effectiveness.
- Use these metrics to decide on which endpoints to cache or tune TTLs.

---

## Migration plan to microservices (Stage 2)

High-level steps:
1. Make the monolith modular: clearly separate domain modules and expose well-defined interfaces.
2. Introduce API contracts (OpenAPI / gRPC definitions) for endpoints that will become service boundaries.
3. Identify candidate services for extraction (low coupling, well-defined domain).
4. Implement a strangler pattern:
   - New requests or paths are routed to the new microservice.
   - Keep data migration scripts and adapter layers to support old/new data models.
5. Add infrastructure for service-to-service communication, queuing, and observability.
6. Gradually cut over traffic and decommission monolith pieces when safe.

Focus on:
- Backwards compatibility
- Data consistency during migration
- Deployment automation for independent services
- End-to-end tests covering multi-service flows

---

## Development & contribution

- Follow the repository's style and lint rules.
- Write unit tests for new logic and E2E tests for new user-visible flows.
- Keep commits small and focused; write clear messages.
- For breaking changes, create a migration guide and update the README/CHANGELOG.

Suggested contribution workflow:
1. Fork the repo.
2. Create a branch feature/your-feature-name.
3. Add tests and ensure all tests pass.
4. Open a pull request with a clear description of changes and any migration notes.

Maintainer: @aelhor

---

## License & contact

License: MIT (or choose appropriate license). Update LICENSE file in the repository.

If you have questions, reach out to the maintainer: GitHub: @aelhor

