import { CreateEntityDto } from './dto/create-entity.dto';
import { Entity, Prisma } from '@prisma/client';

// Define the shape of the data returned by the search/find operations
export type EntityDetails = Prisma.EntityGetPayload<{
  select: {
    id: true;
    title: true;
    category: true;
    averageRating: true;
    reviewCount: true;
    createdAt: true;
    description: true;
    author: {
      select: { username: true };
    };
  };
}>;


// Define the common methods every entity repository must implement
export interface IEntityRepository {
  /**
   * Creates a new entity entry in the database.
   * @param data - The entity data and the ID of the author.
   */
  create(data: CreateEntityDto, authorId: number): Promise<EntityDetails>;

  /**
   * Finds a single entity by its ID.
   * @param id - The unique identifier of the entity.
   */
  findOne(id: number): Promise<EntityDetails | null>;

  /**
   * Retrieves a list of entities, optionally filtered by a search term.
   * @param search - Optional string to search within title/category.
   */
  findAll(search?: string): Promise<EntityDetails[]>;

  /**
   * Future method: Recalculates and updates the average rating and review count.
   * (We'll implement the logic in ReviewModule, but the update method lives here)
   * @param entityId - The ID of the entity to update.
   * @param newAverageRating - The newly calculated average rating.
   * @param newReviewCount - The new total review count.
   */
  updateAggregates(entityId: number, newAverageRating: number, newReviewCount: number): Promise<EntityDetails>;
}

// Define a symbolic injection token for the repository
export const ENTITY_REPOSITORY = 'ENTITY_REPOSITORY';