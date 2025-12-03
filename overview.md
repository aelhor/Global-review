Global Review Platform (Phase 1: MVP)

🌟 Project Overview

This project is the initial Minimum Viable Product (MVP) for a Global Review Platform. The goal is to create a service where authenticated users can write reviews and assign ratings to virtually "anything in the world" (referred to as an Entity), and where all users (authenticated and unauthenticated) can search for and view this public data in real-time.

This repository focuses on building a robust and scalable backend using the NestJS framework.

⚙️ Core Technology Stack

This project follows a Monolith-First approach with a modern, performance-focused stack:

Framework: NestJS (Node.js)

Language: TypeScript

Database: PostgreSQL or MySQL (Flexible, using a common relational schema)

ORM: Prisma

Authentication: JWT (JSON Web Tokens) for authenticated actions.

✅ Phase 1: Core Functionality (MVP)

The first phase is centered around the core loop: Create Entity -> Write Review -> Read/Search Public Data.

Feature ID

Description

Access Level

Related Endpoint(s)

F5 (Auth)

User Authentication

User registers, logs in, and receives a JWT for authenticated actions.

/auth/register, /auth/login

F1

Entity Creation

Authenticated users can create a new Entity (e.g., a book, a product, a landmark) to be reviewed.

POST /entities

F2

Review Submission

Authenticated users can submit a title, content, and a 1-5 star rating for an existing Entity. This submission triggers a recalculation of the Entity's average rating.

POST /entities/:id/reviews

F3/F4

Public Search & View

All users can search for Entities by keywords and retrieve details, including the calculated average rating and all associated reviews.

GET /entities, GET /entities/:id, GET /entities/:id/reviews

📦 Database Entities (Prisma Schema Reference)

The application is built on three main relational models. The data types below reference MySQL or PostgreSQL/Prisma conventions.

1. User (Identity)

Field Name

Data Type

Description

Constraints

id

Int

Primary key.

PK, Auto-increment

email

String

User's unique email address (for login).

Unique

passwordHash

String

Hashed password.



username

String

Display name for reviews.

Unique

createdAt

DateTime

Creation timestamp.

Default now()

2. Entity (Review Subject)

Field Name

Data Type

Description

Constraints

id

Int

Primary key.

PK, Auto-increment

title

String

Name of the Entity (e.g., "The Cairo Tower").



description

String

A brief description.

Optional

category

String

Simple classification (e.g., "Book", "Restaurant").



averageRating

Float

Cached, calculated average rating.

Default 0.0

reviewCount

Int

Cached count of associated reviews.

Default 0

authorId

Int

The ID of the user who first submitted this Entity.

Foreign Key

createdAt

DateTime

Creation timestamp.

Default now()

3. Review (User Content)

Field Name

Data Type

Description

Constraints

id

Int

Primary key.

PK, Auto-increment

title

String

Title of the specific review (e.g., "Amazing view!").



content

String

The full body of the review.



rating

Int

The star rating (1 to 5).

Required

authorId

Int

The ID of the user who wrote the review.

Foreign Key

entityId

Int

The ID of the Entity this review belongs to.

Foreign Key

createdAt

DateTime

Creation timestamp.

Default now()

🛠️ Local Development Setup

Follow these steps to get the project running locally.

1. Prerequisites

You must have Node.js and a relational database (MySQL or PostgreSQL) running locally.

2. Installation

Clone the repository and install dependencies:

git clone <repository_url>
cd global-review-platform
npm install


3. Configure Environment

Create a .env file in the root directory and define your database connection string, following the format for the database you are using (e.g., PostgreSQL, MySQL).

# Example using PostgreSQL
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME"

# Secret key for JWT signing
JWT_SECRET="your-super-secret-key"


4. Database Setup (Prisma)

Generate the Prisma client and run migrations against your configured database:

# Generate the Prisma client based on the schema
npx prisma generate

# Apply the database schema (assuming the schema is already defined)
npx prisma migrate dev --name init


5. Running the Application

Start the NestJS application in development mode:

# Start in watch mode
npm run start:dev


The application will be accessible at http://localhost:3000. You can now use the endpoints listed above to test the core functionality.