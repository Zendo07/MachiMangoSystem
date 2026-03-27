// backend/src/modules/products/products.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // ─── ALL ROLES: Get all active products ───────────────────────────────────
  @Get()
  async findAll() {
    const products = await this.productsService.findAll();
    return { success: true, data: products };
  }

  // ─── ALL ROLES: Get single product ────────────────────────────────────────
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const product = await this.productsService.findOne(id);
    return { success: true, data: product };
  }

  // ─── ADMIN ONLY: Create product ───────────────────────────────────────────
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles('hq_admin')
  async create(@Body() dto: CreateProductDto) {
    const product = await this.productsService.create(dto);
    return {
      success: true,
      message: 'Product created successfully',
      data: product,
    };
  }

  // ─── ADMIN ONLY: Update product ───────────────────────────────────────────
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('hq_admin')
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    const product = await this.productsService.update(id, dto);
    return {
      success: true,
      message: 'Product updated successfully',
      data: product,
    };
  }

  // ─── ADMIN ONLY: Update stock only ────────────────────────────────────────
  @Patch(':id/stock')
  @UseGuards(RolesGuard)
  @Roles('hq_admin')
  async updateStock(@Param('id') id: string, @Body() body: { stock: number }) {
    const product = await this.productsService.updateStock(id, body.stock);
    return {
      success: true,
      message: 'Stock updated successfully',
      data: product,
    };
  }

  // ─── ADMIN ONLY: Delete product ───────────────────────────────────────────
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('hq_admin')
  async remove(@Param('id') id: string) {
    await this.productsService.remove(id);
    return { success: true, message: 'Product removed successfully' };
  }
}
