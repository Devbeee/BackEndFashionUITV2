import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '@/modules/user/entities/user.entity';
import { AuthModule } from '@/modules/auth/auth.module';

import { AddressController } from './address.controller';
import { AddressService } from './address.service';
import { Address } from './entities/address.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Address, User]), AuthModule],
  controllers: [AddressController],
  providers: [AddressService],
})
export class AddressModule {}
