import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Repository } from 'typeorm';

import { Address } from './entities/address.entity';
import {
  AddAddressDto,
  UpdateAddressDto,
  DeleteAddressDto,
} from '@/modules/address/dtos';
import { ErrorCode } from '@/common/enums';
import { User } from '@/modules/user/entities/user.entity';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}
  async addAddress(address: AddAddressDto, userId: string): Promise<Address> {
    const newAddress = this.addressRepository.create({
      ...address,
      userId,
    });
    await this.addressRepository.save(newAddress);
    const userAddress = await this.userRepository.findOne({
      select: {
        defaultAddressId: true,
      },
      where: {
        id: Equal(userId),
      },
    });

    if (!userAddress) {
      await this.userRepository
        .createQueryBuilder()
        .update(User)
        .set({
          defaultAddressId: newAddress.id,
        })
        .where('id = :id', { id: userId })
        .execute();
    }
    return newAddress;
  }
  async getAddress(userId: string): Promise<Address[]> {
    return await this.addressRepository.find({
      select: {
        id: true,
        name: true,
        province: true,
        district: true,
        ward: true,
        phoneNumber: true,
        addressDetail: true,
        longitude: true,
        latitude: true,
      },
      where: {
        userId: Equal(userId),
      },
    });
  }
  async updateAddress(address: UpdateAddressDto) {
    try {
      await this.addressRepository
        .createQueryBuilder()
        .update(Address)
        .set(address)
        .where('id = :id', { id: address.id })
        .execute();
    } catch (error) {
      throw new Error(ErrorCode.ADDRESS_NOT_FOUND);
    }
  }
  async deleteAddress(deleteAddressDto: DeleteAddressDto, userId: string) {
    try {
      const userAddress = await this.userRepository.findOne({
        select: {
          defaultAddressId: true,
        },
        where: {
          id: Equal(userId),
        },
      });

      if (userAddress?.defaultAddressId == deleteAddressDto.id) {
        const addresses = await this.addressRepository.find({
          select: {
            id: true,
          },
          where: {
            userId: Equal(userId),
          },
        });
        if (addresses.length > 1) {
          for (const address of addresses) {
            if (address.id !== deleteAddressDto.id) {
              await this.userRepository
                .createQueryBuilder()
                .update(User)
                .set({
                  defaultAddressId: address.id,
                })
                .where('id = :id', { id: userId })
                .execute();
              break;
            }
          }
        } else {
          await this.userRepository
            .createQueryBuilder()
            .update(User)
            .set({
              defaultAddressId: null,
            })
            .where('id = :id', { id: userId })
            .execute();
        }
      }

      await this.addressRepository
        .createQueryBuilder()
        .delete()
        .from(Address)
        .where('id = :id', { id: deleteAddressDto.id })
        .execute();
    } catch (error) {
      throw new Error(ErrorCode.ADDRESS_NOT_FOUND);
    }
  }
}
