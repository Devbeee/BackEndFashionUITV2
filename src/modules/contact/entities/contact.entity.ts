import { ApiProperty } from "@nestjs/swagger";

import { User } from "@/modules/user/entities/user.entity";

import { 
    Column, 
    Entity, 
    ManyToOne, 
    PrimaryGeneratedColumn 
} from "typeorm";

@Entity()
export class Contact {
    @PrimaryGeneratedColumn('uuid')
    @ApiProperty()
    id: string;

    @ApiProperty()
    @Column()
    fullName: string;

    @ApiProperty()
    @Column()
    email: string;

    @ApiProperty()
    @Column()
    phoneNumber: string;

    @ApiProperty()
    @Column()
    description: string;

    @ApiProperty()
    @ManyToOne(() => User, (user) => user.contacts, { onDelete: 'CASCADE' })
    user: User;
}

