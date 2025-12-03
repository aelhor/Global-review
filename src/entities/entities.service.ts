import { Inject, Injectable} from '@nestjs/common';
import { CreateEntityDto } from './dto/create-entity.dto';
import { PrismaEntityRepository } from './prisma.entity.repositoty';
import { ENTITY_REPOSITORY, EntityDetails } from './entity.repository.interface';
import type {IEntityRepository} from './entity.repository.interface'

@Injectable()
export class EntityService {
    constructor(
        // private entityRepository: PrismaEntityRepository
        @Inject(ENTITY_REPOSITORY) private readonly entityRepository: IEntityRepository,
        
        
    ) { }

    /**
     * F1: Creates a new Entity, linking it to the authenticated user (authorId).
     * @param createEntityDto - DTO containing title, description, and category.
     * @param authorId - The ID of the authenticated user from the JWT payload.
     */
    async create(createEntityDto: CreateEntityDto, authorId: number): Promise<EntityDetails> {
        return this.entityRepository.create(createEntityDto, authorId)
    }

    /**
     * F3: Retrieves all entities (for public listing or simple search).
     * @param search - Optional query string to filter by title or category.
     */
    async findAll(search?: string) {
        return this.entityRepository.findAll(search);
    }

    /**
     * F4: Retrieves a single entity by ID.
     * @param id - The unique ID of the entity.
     */
    async findOne(id: number) {
        return this.entityRepository.findOne(id);
    }
}