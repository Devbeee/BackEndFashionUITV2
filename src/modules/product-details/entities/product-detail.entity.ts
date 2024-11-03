import { Size } from "@/common/enums";
import { Product } from "@/modules/product/entities/product.entity";
import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

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
    stock: boolean;

    @ApiProperty()
    @Column({name: 'productId'})
    productId: string;

    @ApiProperty()
    @ManyToOne(() => Product, (product) => product.id)
    @JoinColumn({ name: 'productId' })
    product: Product;
}
