import { ApiProperty } from '@nestjs/swagger';

import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Size } from '@/common/enums';

import { Order } from '@/modules/order/entities';
import { Category } from '@/modules/category/entities/category.entity';

@Entity()
export class OrderProduct {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string;

  @Column()
  @ApiProperty()
  name: string;

  @ApiProperty()
  @Column()
  price: number;

  @ApiProperty()
  @Column()
  slug: string;

  @Column({ enum: Size })
  @ApiProperty()
  size: Size;

  @ApiProperty()
  @Column({ nullable: true })
  colorName: string;

  @ApiProperty()
  @Column()
  color: string;

  @ApiProperty()
  @Column()
  imgUrl: string;

  @ApiProperty()
  @Column()
  quantity: number;

  @ApiProperty()
  @Column()
  discount: number;

  @ApiProperty({ type: () => Category })
  @ManyToOne(() => Category)
  category: Category;

  @ApiProperty({ type: () => Order })
  @ManyToOne(() => Order, (order) => order.products, { onDelete: 'RESTRICT' })
  @JoinColumn()
  order: Order;

  @ApiProperty()
  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  @ApiProperty()
  deletedAt?: Date;
}
