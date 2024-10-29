import { Role } from '@/common/enums';
import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

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
}
