import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category } from './entities/category.entity';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorCode } from '@/common/enums';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) { }

  async create(createCategoryDto: CreateCategoryDto) {
    const existedCategory = await this.categoryRepository.findOne({
      where: { gender: createCategoryDto.gender, type: createCategoryDto.type }
    })

    if (existedCategory) {
      throw new Error(ErrorCode.CATEGORY_ALREADY_EXIST);
    }

    const newCategory = this.categoryRepository.create({
      gender: createCategoryDto.gender,
      type: createCategoryDto.type
    })

    return await this.categoryRepository.save(newCategory)
  }

  async findAll() {
    return await this.categoryRepository.find({
      select: ["id", "gender", "type"]
    });
  }

  async findOne(id: string) {
    const existedCategory = await this.categoryRepository.findOne({
      where: { id: id },
      select: ["id", "gender", "type"]
    });
    if (!existedCategory) {
      throw new Error(ErrorCode.CATEGORY_NOT_FOUND)
    } else {
      return existedCategory
    }
  }

  async update(id: string, categoryData: UpdateCategoryDto) {
    const existedCategory = await this.categoryRepository.findOne({
      where: { gender: categoryData.gender, type: categoryData.type }
    });
    if (existedCategory) {
      throw new Error(ErrorCode.CATEGORY_ALREADY_EXIST)
    } else {
      return await this.categoryRepository.update(id, {
        gender: categoryData.gender,
        type: categoryData.type
      })
    }
  }

  async remove(id: string) {
    const existedCategory = await this.categoryRepository.findOne({
      where: { id: id }
    });
    if (!existedCategory) {
      throw new Error(ErrorCode.CATEGORY_NOT_FOUND)
    } else {
      await this.categoryRepository.softRemove(existedCategory)
      return existedCategory.deletedAt
    }
  }

  async removeMultiple(ids: string[]) {
    const categories = await this.categoryRepository.findBy({ id: In(ids) });

    const foundIds = categories.map(category => category.id);
    const missingIds = ids.filter(id => !foundIds.includes(id));

    if (missingIds.length > 0) {
      throw new Error(`${ErrorCode.CATEGORY_NOT_FOUND}: Missing category IDs - ${missingIds.join(', ')}`);
    }

    await this.categoryRepository.softRemove(categories);

    const deletedAtTimestamps = categories.map(category => category.deletedAt);
    return deletedAtTimestamps;
  }

}
