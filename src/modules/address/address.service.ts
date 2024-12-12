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
  async addAddress(address: AddAddressDto, user: User): Promise<Address> {
    const newAddress = this.addressRepository.create({
      ...address,
      owner: user,
    });
    await this.addressRepository.save(newAddress);
    const userAddress = await this.userRepository.findOne({
      select: {
        defaultAddress: {
          id: true,
        },
      },
      relations: ['defaultAddress'],
      where: {
        id: user.id,
      },
    });
    if (!userAddress.defaultAddress) {
      await this.userRepository.update(
        { id: user.id },
        { defaultAddress: { id: newAddress.id } },
      );
    }

    return newAddress;
  }
  async getAddress(user: User): Promise<Address[]> {
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
        owner: Equal(user.id),
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
  async deleteAddress(deleteAddressDto: DeleteAddressDto, user: User) {
    try {
      const userAddress = await this.userRepository.findOne({
        select: {
          defaultAddress: {
            id: true,
          },
        },
        relations: ['defaultAddress'],
        where: {
          id: user.id,
        },
      });
      if (userAddress?.defaultAddress?.id == deleteAddressDto.id) {
        const addresses = await this.addressRepository.find({
          select: {
            id: true,
          },
          where: {
            owner: Equal(user.id),
          },
        });
        if (addresses.length >= 2) {
          for (const address of addresses) {
            if (address.id !== deleteAddressDto.id) {
              await this.userRepository.update(
                { id: user.id },
                { defaultAddress: { id: address.id } },
              );
              break;
            }
          }
        } else {
          await this.userRepository.update(
            { id: user.id },
            { defaultAddress: null },
          );
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
