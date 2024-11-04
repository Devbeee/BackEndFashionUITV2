import { ApiProperty } from "@nestjs/swagger";

import { Size } from "@/common/enums";

import { Product } from "@/modules/product/entities/product.entity";

import { 
    Column, 
    Entity, 
    ManyToOne, 
    PrimaryGeneratedColumn 
} from "typeorm";

@Entity()
export class ProductDetail {
    @PrimaryGeneratedColumn('uuid')
    @ApiProperty()
    id: string;
    
    @Column({ enum: Size, nullable: false })
    @ApiProperty()
    size: Size;

    @ApiProperty()
    @Column()
    color: string;

    @ApiProperty()
    @Column()
    imgUrl: string;

    @ApiProperty()
    @Column()
    stock: number;

    @ApiProperty()
    @ManyToOne(() => Product, (product) => product.productDetails, { onDelete: 'CASCADE' })
    product: Product;
}
