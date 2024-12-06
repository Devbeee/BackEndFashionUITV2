import { ApiProperty } from "@nestjs/swagger";

import { User } from "@/modules/user/entities/user.entity";
import { CartProduct } from "@/modules/cart-product/entities/cart-product.entity";

import { 
    CreateDateColumn, 
    DeleteDateColumn, 
    Entity, 
    JoinColumn, 
    OneToMany, 
    OneToOne, 
    PrimaryGeneratedColumn, 
    UpdateDateColumn 
} from "typeorm";

@Entity()
export class Cart {
    @PrimaryGeneratedColumn('uuid')
    @ApiProperty()
    id: string;

    @ApiProperty()
    @OneToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @ApiProperty()
    @OneToMany(() => CartProduct, (cartProduct) => cartProduct.cart)
    cartProducts: CartProduct[];

    @ApiProperty()
    @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @ApiProperty()
    @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @DeleteDateColumn({ type: 'timestamptz', nullable: true })
    @ApiProperty()
    deletedAt?: Date;
}
