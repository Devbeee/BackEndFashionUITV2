import { User } from "@/modules/user/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Contact {
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    fullName: string;

    @Column()
    email: string;

    @Column()
    phoneNumber: string;

    @Column()
    description: string;

    @ManyToOne(() => User, (user) => user.id, { nullable: true })
    userId: User;
}

