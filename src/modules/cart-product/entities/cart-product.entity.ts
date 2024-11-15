import { ApiProperty } from "@nestjs/swagger";

import { Cart } from "@/modules/cart/entities/cart.entity";
import { ProductDetail } from "@/modules/product-details/entities/product-detail.entity";

import { 
    Column, 
    CreateDateColumn, 
    DeleteDateColumn, 
    Entity, 
    ManyToOne, 
    PrimaryGeneratedColumn,
    UpdateDateColumn, 
} from "typeorm";

@Entity()
export class CartProduct {
    @PrimaryGeneratedColumn('uuid')
    @ApiProperty()
    id: string;

    @Column()
    @ApiProperty()
    quantity: number;

    @ApiProperty()
    @ManyToOne(() => ProductDetail, { onDelete: 'CASCADE' })
    productDetail: ProductDetail;

    @ApiProperty()
    @ManyToOne(() => Cart, (cart) => cart.cartProducts)
    cart: Cart;

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