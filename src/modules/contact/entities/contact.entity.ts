import { User } from "@/modules/user/entities/user.entity";
import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

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
    @Column({name: 'userId'})
    userId: string;

    @ApiProperty()
    @ManyToOne(() => User, (user) => user.id, { nullable: true })
    @JoinColumn({ name: 'userId' })
    user: User;
}

