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

import { ApiProperty } from '@nestjs/swagger';

import { User } from '@/modules/user/entities/user.entity';

@Entity()
export class Address {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column()
  province: string;

  @ApiProperty()
  @Column({ nullable: true })
  ward: string;

  @ApiProperty()
  @Column()
  district: string;

  @ApiProperty()
  @Column()
  phoneNumber: string;

  @ApiProperty()
  @Column({ nullable: true })
  longitude: string;

  @ApiProperty()
  @Column({ nullable: true })
  latitude: string;

  @ApiProperty()
  @Column()
  addressDetail: string;

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
  @Column('uuid')
  userId: string;

  @ApiProperty({ type: () => User })
  @ManyToOne(() => User, (user) => user.addresses)
  @JoinColumn({ name: 'userId' })
  owner: User;
}
