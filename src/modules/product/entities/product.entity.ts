import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    name: string;
    
    @Column({ nullable: true })
    description: string;

    @Column()
    price: number;

    @Column()
    categoryId: string;

    @Column()
    slug: string;

    @Column({ nullable: true })
    discount: number;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;
}
