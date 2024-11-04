import { InjectRepository } from '@nestjs/typeorm';
import { ErrorCode } from '@/common/enums';

import { 
  Injectable, 
} from '@nestjs/common';

import { Contact } from './entities/contact.entity';

import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

import { Repository } from 'typeorm';
import { UsersService } from '../user/user.service';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    private readonly usersService: UsersService){}

  async create(contactData: CreateContactDto) {
    const existUser = await this.usersService.findById(contactData.userId);

    if (!existUser) {
      throw new Error(ErrorCode.USER_NOT_FOUND);
    }
    
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
