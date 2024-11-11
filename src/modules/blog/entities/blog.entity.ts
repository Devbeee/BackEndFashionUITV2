import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  UpdateDateColumn,
  DeleteDateColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { User } from '@/modules/user/entities/user.entity';

@Entity()
export class Blog {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('text')
  title: string;

  @ApiProperty()
  @Column('text')
  description: string;
  
  @ApiProperty()
  @Column('text')
  slug: string;
  
  @ApiProperty()
  @Column('uuid')
  userId: string;
  
  @ApiProperty()
  @Column('text')
  coverImage: string;

  @CreateDateColumn({type: 'timestamptz'})
  @ApiProperty()
  createdAt: Date;

  @UpdateDateColumn({type: 'timestamptz'})
  @ApiProperty()
  updatedAt: Date;

  @DeleteDateColumn({type: 'timestamptz', default: null})
  @ApiProperty()
  deletedAt: Date;

  @ApiProperty({ type: () => User })
  @ManyToOne(() => User, (user) => user.blogs)
  @JoinColumn({name: 'userId'})
  author: User;
}
