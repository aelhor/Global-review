import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEntityDto } from './dto/create-entity.dto';
import { IEntityRepository, EntityDetails } from './entity.repository.interface';
import { Prisma } from '@prisma/client';

@Injectable()
// This class implements the contract defined by the interface
export class PrismaEntityRepository implements IEntityRepository {
  constructor(
    private prisma: PrismaService
  ) {}

  private readonly selection = {
    id: true,
    title: true,
    category: true,
    description: true,
    averageRating: true,
    reviewCount: true,
    createdAt: true,
    author: {
      select: { username: true },
    },
  } satisfies Prisma.EntitySelect;


  async create(createEntityDto: CreateEntityDto, authorId: number): Promise<EntityDetails> {
    const result = await this.prisma.entity.create({
      data: {
        ...createEntityDto,
        authorId,
      },
      select: this.selection,
    });
    return result as EntityDetails;
  }

  async findOne(id: number): Promise<EntityDetails | null> {
    const entity = await this.prisma.entity.findUnique({
      where: { id },
      select: {
        ...this.selection,
        author: {
          select: { username: true, email: true }, // Include email for detail view
        },
      },
    });

    if (!entity) {
      // Throw an error here to let the service handle the NotFoundException
      throw new NotFoundException(`Entity with ID ${id} not found.`);
    }

    // The findOne from the interface returns EntityDetails, which is guaranteed 
    // to exist here due to the exception above.
    return entity as EntityDetails;
  }

  async findAll(search?: string): Promise<EntityDetails[]> {
    const where = search 
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { category: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const entities = await this.prisma.entity.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: this.selection,
    });
    
    return entities as EntityDetails[];
  }

  async updateAggregates(entityId: number, newAverageRating: number, newReviewCount: number): Promise<EntityDetails> {
    const result = await this.prisma.entity.update({
      where: { id: entityId },
      data: {
        averageRating: newAverageRating,
        reviewCount: newReviewCount,
      },
      select: this.selection,
    });

    return result as EntityDetails;
  }
}