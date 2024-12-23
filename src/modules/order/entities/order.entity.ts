import { ApiProperty } from '@nestjs/swagger';

import { Address } from '@/modules/address/entities/address.entity';
import { User } from '@/modules/user/entities/user.entity';
import { OrderStatus, PaymentMethod, PaymentStatus } from '@/common/enums';

import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderProduct } from '@/modules/order/entities/order-product.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string;

  @ApiProperty({ type: () => User })
  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn()
  user: User;

  @ApiProperty()
  @ManyToOne(() => Address)
  @JoinColumn()
  address: Address;

  @ApiProperty()
  @Column({ default: PaymentStatus.Unpaid })
  paymentStatus: PaymentStatus;

  @ApiProperty()
  @Column({ default: PaymentMethod.COD })
  paymentMethod: PaymentMethod;

  @ApiProperty()
  @Column({ default: OrderStatus.Pending })
  orderStatus: OrderStatus;

  @ApiProperty({ type: () => OrderProduct })
  @OneToMany(() => OrderProduct, (orderProduct) => orderProduct.order, {
    cascade: true,
  })
  @JoinColumn()
  products: OrderProduct[];

  @ApiProperty()
  @Column({ nullable: true })
  message: string;

  @ApiProperty()
  @Column({ nullable: true })
  totalPrice: number;

  @ApiProperty()
  @Column({ nullable: true })
  paymentSessionId: string;

  @ApiProperty()
  @Column({ nullable: true })
  paymentInvoiceId: string;

  @ApiProperty()
  @Column({ nullable: true, default: null })
  paidAt: Date;

  @Column({ nullable: true, default: null })
  @ApiProperty()
  completedAt: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  @ApiProperty()
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  @ApiProperty()
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  @ApiProperty()
  deletedAt?: Date;
}
