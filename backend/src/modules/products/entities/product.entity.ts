// backend/src/modules/products/entities/product.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type ProductStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  category: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ default: 0 })
  stock: number;

  @Column({ default: '📦' })
  image: string;

  @Column({
    type: 'enum',
    enum: ['In Stock', 'Low Stock', 'Out of Stock'],
    default: 'In Stock',
  })
  status: ProductStatus;

  @Column({ default: 0 })
  sales: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
