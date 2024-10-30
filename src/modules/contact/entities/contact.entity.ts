import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

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
}

