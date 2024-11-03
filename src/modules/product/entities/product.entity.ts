import { ProductDetail } from "@/modules/product-details/entities/product-detail.entity";
import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Product {
    @PrimaryGeneratedColumn('uuid')
    @ApiProperty()
    id: string;

    @Column({ unique: true })
    @ApiProperty()
    name: string;
    
    @Column()
    @ApiProperty()
    description: string;

    @ApiProperty()
    @Column()
    price: number;

    @ApiProperty()
    @Column()
    categoryId: string;

    @ApiProperty()
    @Column({ unique: true })
    slug: string;

    @ApiProperty()
    @Column({ default: 0 })
    discount: number;

    @ApiProperty()
    @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @ApiProperty()
    @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @ApiProperty()
    @OneToMany(() => ProductDetail, (ProductDetail) => ProductDetail.product)
    productDetails: ProductDetail[];
}
