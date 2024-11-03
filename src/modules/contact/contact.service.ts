import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { Repository } from 'typeorm';
import { Contact } from './entities/contact.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>){}
  async create(createContactDto: CreateContactDto) {
    const contact = this.contactRepository.create(createContactDto);
    return await this.contactRepository.save(contact);
  }

  async findAll() {
    return await this.contactRepository.find({
      relations: {
        user: true
      }
    });
  }

  async findOne(id: string) {
    return await this.contactRepository.findOne({
      where: { id },
      relations: {
        user: true
      }
    });
  }

  async update(id: string, updateContactDto: UpdateContactDto) {
    const city = await this.findOne(id);

    if (!city) {
      throw new NotFoundException(`Contact #${id} not found`);
    }

    Object.assign(city, updateContactDto);

    return await this.contactRepository.save(city);
  }

  async remove(id: string) {
    const city = await this.findOne(id);

    if (!city) {
      throw new NotFoundException(`Contact #${id} not found`);
    }

    return await this.contactRepository.remove(city);
  }
}
