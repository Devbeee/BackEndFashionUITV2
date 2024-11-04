import { ApiTags } from '@nestjs/swagger';

import { ErrorCode } from '@/common/enums';
import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  NotFoundException
} from '@nestjs/common';

import { ContactService } from './contact.service';

import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@ApiTags('Contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  create(@Body() createContactDto: CreateContactDto) {
    try {
      return this.contactService.create(createContactDto);
    } catch (error) {
      if (error.message === ErrorCode.USER_NOT_FOUND) {
        throw new NotFoundException(ErrorCode.USER_NOT_FOUND);
      }
      else {
        throw error;
      }
    }
  }

  @Get()
  findAll() {
    try {
      return this.contactService.findAll();
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  findOne(@Param('id') contactId: string) {
    try {
      return this.contactService.findOne(contactId);
    } catch (error) {
      throw error;
    }
  }

  @Patch(':id')
  update(@Param('id') contactId: string, @Body() updateContactDto: UpdateContactDto) {
    try {
      return this.contactService.update(contactId, updateContactDto);
    } catch (error) {
      if (error.message === ErrorCode.CONTACT_NOT_FOUND) {
          throw new NotFoundException(ErrorCode.CONTACT_NOT_FOUND);
      } else {
          throw error;
      }
    }
  }

  @Delete(':id')
  remove(@Param('id') contactId: string) {
    try {
      return this.contactService.remove(contactId);
    } catch (error) {
      if (error.message === ErrorCode.CONTACT_NOT_FOUND) {
          throw new NotFoundException(ErrorCode.CONTACT_NOT_FOUND);
      } else {
          throw error;
      }
    }
  }
}
