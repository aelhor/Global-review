import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module'; 
import { EntityController } from './entities.controller';
import { EntityService } from './entities.service';
import { PrismaEntityRepository } from './prisma.entity.repositoty';
import { ENTITY_REPOSITORY } from './entity.repository.interface';

@Module({
  imports: [
    PrismaModule,
    // Import AuthModule so the JwtAuthGuard is available for use in the controller
    AuthModule,
  ],
  controllers: [EntityController],
  providers: [EntityService,
    { // to use @inject to apply the Dependency Inversion Principle (DIP)
      provide: ENTITY_REPOSITORY,
      useClass: PrismaEntityRepository,
    }
  ],

  exports: [EntityService,
    { // to use @inject to apply the Dependency Inversion Principle (DIP)
      provide: ENTITY_REPOSITORY,
      useClass: PrismaEntityRepository,
    }
  ],
})
export class EntitiesModule { }