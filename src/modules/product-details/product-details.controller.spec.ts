import { Test, TestingModule } from '@nestjs/testing';
import { ProductDetailsController } from './product-details.controller';
import { ProductDetailsService } from './product-details.service';

describe('ProductDetailsController', () => {
  let controller: ProductDetailsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductDetailsController],
      providers: [ProductDetailsService],
    }).compile();

    controller = module.get<ProductDetailsController>(ProductDetailsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
