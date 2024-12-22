import { ApiProperty } from '@nestjs/swagger';

import { Category } from '@/modules/category/entities/category.entity';
import { ProductDetail } from '@/modules/product-details/entities/product-detail.entity';
import { Discount } from '@/modules/discount/entities/discount.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string;

  @Column({ unique: true })
  @ApiProperty()
  name: string;

  @Column()
  @ApiProperty()
  description: string;

  @ApiProperty()
  @Column()
  price: number;

  @ApiProperty()
  @Column({ unique: true })
  slug: string;

  @ApiProperty()
  @Column({ default: 0 })
  discount: number;

  @ApiProperty()
  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @ApiProperty()
  @OneToMany(() => ProductDetail, (ProductDetail) => ProductDetail.product)
  productDetails: ProductDetail[];

  @ApiProperty()
  @ManyToOne(() => Category, (category) => category.products)
  category: Category;

  @ApiProperty()
  @OneToMany(() => Discount, (discount) => discount.product)
  discounts: Discount[];
}
