import { InjectRepository } from '@nestjs/typeorm';
import { ErrorCode } from '@/common/enums';

import { 
  Injectable, 
} from '@nestjs/common';

import { Contact } from './entities/contact.entity';

import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

import { Repository } from 'typeorm';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>){}

  async create(contactData: CreateContactDto) {
    const contact = this.contactRepository.create(contactData);
    return await this.contactRepository.save(contact);
  }

  async findAll() {
    return await this.contactRepository.find({
      relations: {
        user: true
      }
    });
  }

  async findOne(contactId: string) {
    return await this.contactRepository.findOne({
      where: { id: contactId },
      relations: {
        user: true
      }
    });
  }

  async update(contactId: string, contactUpdateData: UpdateContactDto) {
    const existContact = await this.findOne(contactId);

    if (!existContact) {
      throw new Error(ErrorCode.CONTACT_NOT_FOUND);
    }

    Object.assign(existContact, contactUpdateData);

    return await this.contactRepository.save(existContact);
  }

  async remove(contactId: string) {
    const existContact = await this.findOne(contactId);

    if (!existContact) {
      throw new Error(ErrorCode.CONTACT_NOT_FOUND);
    }

    return await this.contactRepository.remove(existContact);
  }
}
