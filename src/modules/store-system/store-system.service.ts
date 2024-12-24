import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ErrorCode } from '@/common/enums';
import { CreateStoreSystemDto } from './dto/create-store-system.dto';
import { StoreSystem } from './entities/store-system.entity';

@Injectable()
export class StoreSystemService {
  constructor(
    @InjectRepository(StoreSystem)
    private readonly storeSystemRepository: Repository<StoreSystem>,
  ) {}

  async create(
    createStoreSystemDto: CreateStoreSystemDto,
  ): Promise<StoreSystem> {
    const { province, district, ward, addressDetail, ...rest } =
      createStoreSystemDto;

    const existingStore = await this.storeSystemRepository.findOne({
      where: {
        province,
        district,
        ward,
        addressDetail,  
      },
    });

    if (existingStore) {
      throw new Error(ErrorCode.STORE_ALREADY_EXIST);
    }

    const newStore = this.storeSystemRepository.create(createStoreSystemDto);
    return await this.storeSystemRepository.save(newStore);
  }

  async findAll() {
    return await this.storeSystemRepository.find();
  }
}
