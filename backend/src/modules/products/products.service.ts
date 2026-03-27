// backend/src/modules/products/products.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductStatus } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  // Auto-compute status from stock quantity
  private computeStatus(stock: number): ProductStatus {
    if (stock === 0) return 'Out of Stock';
    if (stock <= 10) return 'Low Stock';
    return 'In Stock';
  }

  // ─── CREATE (admin only) ──────────────────────────────────────────────────
  async create(dto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create({
      name: dto.name,
      category: dto.category,
      price: dto.price,
      stock: dto.stock,
      image: dto.image ?? '📦',
      status: this.computeStatus(dto.stock),
    });
    return this.productRepository.save(product);
  }

  // ─── GET ALL (all roles) ──────────────────────────────────────────────────
  async findAll(): Promise<Product[]> {
    return this.productRepository.find({
      where: { isActive: true },
      order: { createdAt: 'ASC' },
    });
  }

  // ─── GET ONE ──────────────────────────────────────────────────────────────
  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id, isActive: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  // ─── UPDATE (admin only) ──────────────────────────────────────────────────
  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    if (dto.name !== undefined) product.name = dto.name;
    if (dto.category !== undefined) product.category = dto.category;
    if (dto.price !== undefined) product.price = dto.price;
    if (dto.image !== undefined) product.image = dto.image;

    // If stock is updated, recompute status automatically
    if (dto.stock !== undefined) {
      product.stock = dto.stock;
      product.status = this.computeStatus(dto.stock);
    }

    return this.productRepository.save(product);
  }

  // ─── UPDATE STOCK ONLY (admin only) ──────────────────────────────────────
  async updateStock(id: string, stock: number): Promise<Product> {
    const product = await this.findOne(id);
    product.stock = stock;
    product.status = this.computeStatus(stock);
    return this.productRepository.save(product);
  }

  // ─── INCREMENT SALES (called when order is placed) ───────────────────────
  async incrementSales(id: string, quantity: number): Promise<void> {
    await this.productRepository.increment({ id }, 'sales', quantity);
  }

  // ─── SOFT DELETE (admin only) ─────────────────────────────────────────────
  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    product.isActive = false;
    await this.productRepository.save(product);
  }
}
