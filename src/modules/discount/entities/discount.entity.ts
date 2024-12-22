import { ApiProperty } from '@nestjs/swagger';
import { Product } from '@/modules/product/entities/product.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

@Entity()
@Unique(['product', 'timeRange', 'date'])
export class Discount {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string;

  @Column()
  @ApiProperty()
  discountValue: number;

  @Column({ default: 0 })
  @ApiProperty()
  sold: number;

  @Column()
  @ApiProperty()
  timeRange: string;

  @Column({ type: 'timestamptz' })
  @ApiProperty()
  date: Date;

  @ApiProperty()
  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @ApiProperty()
  @ManyToOne(() => Product, (product) => product.discounts)
  product: Product;
}
