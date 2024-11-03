import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { In, Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ErrorCode } from '@/common/enums';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

describe('CategoryService', () => {
  let service: CategoryService;
  let categoryRepository: Repository<Category>;

  const mockCategoryRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    softRemove: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    findBy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoryRepository
        }
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    categoryRepository = module.get<Repository<Category>>(getRepositoryToken(Category));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Manage category', () => {
    it('should return a list of categories', async () => {
      const mockCategories = [
        {
          id: '1',
          gender: 'nam',
          type: 'áo',
        }
      ];
      mockCategoryRepository.find.mockReturnValue(mockCategories);
      const result = await service.findAll();
      expect(result).toEqual(mockCategories);
      expect(categoryRepository.find).toHaveBeenCalled();
    });

    it('should create a new category', async () => {
      const categoryData: CreateCategoryDto = {
        gender: 'nam',
        type: 'áo',
      };

      mockCategoryRepository.findOne.mockResolvedValue(null);
      mockCategoryRepository.create.mockReturnValue(categoryData);
      mockCategoryRepository.save.mockResolvedValue({
        id: '123',
        ...categoryData,
      });

      const result = await service.create(categoryData);

      expect(result).toEqual({
        id: '123',
        ...categoryData,
      });

      expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({
        where: { gender: 'nam', type: 'áo' },
      });
      expect(mockCategoryRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          gender: 'nam',
          type: 'áo',
        })
      );
    });

    it('should throw an error if category already exists', async () => {
      const categoryData: CreateCategoryDto = {
        gender: 'nam',
        type: 'áo',
      };

      mockCategoryRepository.findOne.mockResolvedValue({
        id: '123',
        ...categoryData,
      });

      await expect(service.create(categoryData)).rejects.toThrow(
        new Error(ErrorCode.CATEGORY_ALREADY_EXIST),
      );
    });


    it('should throw an error if required fields are missing', async () => {
      const categoryData: CreateCategoryDto = {
        gender: '',
        type: '',
      }

      await expect(service.create(categoryData)).rejects.toThrow(
        new Error(ErrorCode.MISSING_INPUT),
      );
    });

    it('should throw an error if gender and type are already registered', async () => {
      const categoryData: CreateCategoryDto = {
        gender: 'nam',
        type: 'áo',
      }
      mockCategoryRepository.findOne.mockResolvedValue(categoryData);

      await expect(service.create(categoryData)).rejects.toThrow(
        new Error(ErrorCode.CATEGORY_ALREADY_EXIST),
      );
    });

    it('should return a category', async () => {
      const categoryId = '123';
      const expectedCategory = {
        id: categoryId,
        gender: 'nam',
        type: 'test'
      };

      mockCategoryRepository.findOne.mockResolvedValue(expectedCategory);

      const result = await service.findOne(categoryId);

      expect(result).toEqual(expectedCategory);
      expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({
        where: { id: categoryId },
        select: ['id', 'gender', 'type']
      });
    })

    it('should throw an error if category does not exist ', async () => {
      const categoryId = '123';

      mockCategoryRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(categoryId)).rejects.toThrow(
        new Error(ErrorCode.CATEGORY_NOT_FOUND)
      );
    })

    it('should throw an error if gender and type already exist ', async () => {
      const categoryId = '1'
      const categoryData : UpdateCategoryDto = {
        gender: 'nam',
        type: '123'
      };

      mockCategoryRepository.findOne.mockResolvedValue({
        id: '2',
        gender: 'nam',
        type: '123',
      });

      await expect(service.update(categoryId, categoryData)).rejects.toThrow(
        new Error(ErrorCode.CATEGORY_ALREADY_EXIST)
      );
    
      expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({
        where: { gender: categoryData.gender, type: categoryData.type },
      });
    })

    it('should update the category if it exists', async () => {
      const existingCategory = { id: '1', gender: 'female', type: 'dress' };
      mockCategoryRepository.findOne.mockResolvedValue(existingCategory);
      mockCategoryRepository.update.mockResolvedValue({ affected: 1 });

      const id = '1';
      const categoryData: UpdateCategoryDto = { gender: 'male', type: 'shirt' };

      const result = await service.update(id, categoryData);

      expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(mockCategoryRepository.update).toHaveBeenCalledWith(id, {
        gender: categoryData.gender,
        type: categoryData.type,
      });
      expect(result).toEqual({ affected: 1 });
    });

    it('should soft delete a category if it exists', async () => {
      const categoryId = '123';
      const existedCategory = { id: categoryId, deletedAt: new Date() };

      mockCategoryRepository.findOne.mockResolvedValue(existedCategory);
      mockCategoryRepository.softRemove.mockResolvedValue(existedCategory);

      const result = await service.remove(categoryId);

      expect(result).toEqual(existedCategory.deletedAt);
      expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({
        where: { id: categoryId }
      });
      expect(mockCategoryRepository.softRemove).toHaveBeenCalledWith(existedCategory);
    });

    it('should throw an error if the category does not exist', async () => {
      const categoryId = 'nonexistent-id';

      mockCategoryRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(categoryId)).rejects.toThrow(
        new Error(ErrorCode.CATEGORY_NOT_FOUND)
      );

      expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({
        where: { id: categoryId }
      });
      expect(mockCategoryRepository.softRemove).not.toHaveBeenCalled();
    });

    it('should throw CATEGORY_NOT_FOUND error if some category IDs are missing', async () => {
      const ids = ['1', '2', '3'];
      const existingCategories = [{ id: '1' }, { id: '2' }];
      mockCategoryRepository.findBy.mockResolvedValue(existingCategories);

      await expect(service.removeMultiple(ids)).rejects.toThrow(
        `${ErrorCode.CATEGORY_NOT_FOUND}: Missing category IDs - 3`
      );
      expect(mockCategoryRepository.findBy).toHaveBeenCalledWith({ id: In(ids) });
    });

    it('should soft remove categories and return their deleted timestamps', async () => {
      const ids = ['1', '2'];
      const existingCategories = [
        { id: '1', deletedAt: new Date('2024-11-01T12:00:00Z') },
        { id: '2', deletedAt: new Date('2024-11-01T12:05:00Z') },
      ];
      mockCategoryRepository.findBy.mockResolvedValue(existingCategories);
      mockCategoryRepository.softRemove.mockResolvedValue(existingCategories);

      const result = await service.removeMultiple(ids);

      expect(mockCategoryRepository.findBy).toHaveBeenCalledWith({ id: In(ids) });
      expect(mockCategoryRepository.softRemove).toHaveBeenCalledWith(existingCategories);
      expect(result).toEqual([
        new Date('2024-11-01T12:00:00Z'),
        new Date('2024-11-01T12:05:00Z'),
      ]);
    });

  });
});

