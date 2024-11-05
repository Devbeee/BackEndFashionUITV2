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
export class Category {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty()
    @Column()
    gender: string;

    @ApiProperty()
    @Column()
    type: string;

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
