import { PartialType } from '@nestjs/swagger';
import { CreateStoreSystemDto } from './create-store-system.dto';

export class UpdateStoreSystemDto extends PartialType(CreateStoreSystemDto) {}
