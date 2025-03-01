import { ApiProperty } from '@nestjs/swagger';

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { Order } from '@/modules/order/entities';
import { Contact } from '@/modules/contact/entities/contact.entity';
import { Blog } from '@/modules/blog/entities/blog.entity';
import { Address } from '@/modules/address/entities/address.entity';

import { Role } from '@/common/enums';

@Entity()
export class User {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  fullName: string;

  @ApiProperty()
  @Column({ unique: true })
  email: string;

  @ApiProperty()
  @Column()
  password: string;

  @ApiProperty()
  @Column({ nullable: true })
  phoneNumber: string;

  @ApiProperty()
  @Column({ nullable: true })
  avatar: string;

  @ApiProperty()
  @Column({ default: false })
  isVerified: boolean;

  @Column({
    default: Role.User,
  })
  @ApiProperty()
  role: string;

  @CreateDateColumn({ type: 'timestamptz' })
  @ApiProperty()
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  @ApiProperty()
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  @ApiProperty()
  deletedAt?: Date;

  @ApiProperty()
  @OneToMany(() => Contact, (contact) => contact.user)
  contacts: Contact[];

  @ApiProperty()
  @OneToMany(() => Blog, (blog) => blog.author)
  blogs: Blog[];

  @ApiProperty()
  @OneToMany(() => Address, (address) => address.owner)
  addresses: Address[];

  @ApiProperty()
  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @ApiProperty()
  @OneToOne(() => Address)
  @JoinColumn({ name: 'defaultAddressId' })
  defaultAddress: Address;
}
