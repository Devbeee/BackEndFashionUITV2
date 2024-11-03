import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductDetailsService } from '../product-details/product-details.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly productDetailsService: ProductDetailsService,
  ) {}
  async create(createProductDto: CreateProductDto) {
    const existingProduct = await this.findByName(createProductDto.name);

    if (existingProduct.length > 0) {
      throw new Error('Product with the same name already exists');
    }

    const productInfo = {
      name: createProductDto.name,
      description: createProductDto.description,
      price: createProductDto.price,
      categoryId: createProductDto.categoryId,
      slug: createProductDto.slug,
      discount: createProductDto.discount
    }
    const product = this.productRepository.create(productInfo);
    const response =  await this.productRepository.save(product);
    const productDetails = {
      size: createProductDto.size,
      color: createProductDto.colors,
      imgUrl: createProductDto.imgUrl,
      stock: createProductDto.stock,
      productId: response.id
    }
    await this.productDetailsService.create(productDetails);
    return this.findOne(response.id);
    
  }

  async findAll() {
    return await this.productRepository.find(
      {relations: {
        productDetails: true
      }}
    );
  }

  async findOne(id: string) {
    return await this.productRepository.findOne({
      where: { id },
      relations: {
        productDetails: true
      }
    });
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.findOne(id);

    if(!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }
    
    const productInfo = {
      name: updateProductDto.name,
      description: updateProductDto.description,
      price: updateProductDto.price,
      categoryId: updateProductDto.categoryId,
      slug: updateProductDto.slug,
      discount: updateProductDto.discount
    }

    Object.assign(product, productInfo);

    return await this.productRepository.save(product);
  }

  async remove(id: string) {
    const product = await this.findOne(id);

    if(!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }

    const productDetail = await this.productDetailsService.findByProductId(id);
    for (let i = 0; i < productDetail.length; i++) {
      await this.productDetailsService.remove(productDetail[i].id);
    }

    return await this.productRepository.remove(product);  
  }

  async findByName(name: string) {
    return await this.productRepository.find({
      where: { name },
      relations: {
        productDetails: true
      }
    });
  }
}
