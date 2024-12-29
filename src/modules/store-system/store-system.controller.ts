import {
  Controller,
  Get,
  Post,
  Body,
} from '@nestjs/common';
import { StoreSystemService } from './store-system.service';
import { CreateStoreSystemDto } from './dto/create-store-system.dto';

@Controller('store-system')
export class StoreSystemController {
  constructor(private readonly storeSystemService: StoreSystemService) {}

  @Post()
  async create(@Body() createStoreSystemDto: CreateStoreSystemDto) {
    try {
      return await this.storeSystemService.create(createStoreSystemDto);
    } catch (err) {
      throw err;
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.storeSystemService.findAll();
    } catch (err) {
      throw err;
    }
  }
}
