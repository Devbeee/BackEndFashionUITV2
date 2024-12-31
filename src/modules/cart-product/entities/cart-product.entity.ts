import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Category } from '@/modules/category/entities/category.entity';
import { Cart } from '@/modules/cart/entities/cart.entity';
import { ProductDetail } from '@/modules/product-details/entities/product-detail.entity';

@Entity()
export class CartProduct {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string;

  @Column()
  @ApiProperty()
  quantity: number;

  @ApiProperty()
  @ManyToOne(() => ProductDetail, { onDelete: 'CASCADE' })
  productDetail: ProductDetail;

  @ApiProperty({ type: () => Category })
  @ManyToOne(() => Category)
  category: Category;

  @ApiProperty()
  @ManyToOne(() => Cart, (cart) => cart.cartProducts)
  cart: Cart;

  @CreateDateColumn({ type: 'timestamptz' })
  @ApiProperty()
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  @ApiProperty()
  updatedAt: Date;
}
