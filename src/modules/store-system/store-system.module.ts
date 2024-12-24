import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StoreSystemService } from './store-system.service';
import { StoreSystemController } from './store-system.controller';
import { StoreSystem } from './entities/store-system.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StoreSystem])],
  controllers: [StoreSystemController],
  providers: [StoreSystemService],
})
export class StoreSystemModule {}
