import { Controller, Get, Post, Body, Param, UseGuards, Request, Query, ParseIntPipe, HttpStatus, HttpCode } from '@nestjs/common';
import { CreateEntityDto } from './dto/create-entity.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Used for F1
import { User } from '@prisma/client'; // Used for request typing
import { EntityService } from './entities.service';

@Controller('entities')
export class EntityController {
  constructor(private readonly entityService: EntityService) { }

  /**
   * F1: POST /entities
   * Protected route: Only authenticated users can create an entity.
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createEntityDto: CreateEntityDto, @Request() req: { user: User }) {
    const authorId = req.user.id;
    return this.entityService.create(createEntityDto, authorId);
  }
  /**
   * F3: GET /entities?search=term
   * Public route: Allows anyone to search and list entities.
   */
  @Get()
  findAll(@Query('search') search: string) {
    return this.entityService.findAll(search);
  }

  /**
   * F4: GET /entities/:id
   * Public route: Allows anyone to view a single entity's details.
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    // ParseIntPipe ensures the string parameter is converted to a number
    return this.entityService.findOne(id);
  }
}