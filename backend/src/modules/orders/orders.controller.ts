// backend/src/modules/orders/orders.controller.ts
import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

interface AuthenticatedRequest extends ExpressRequest {
  user: {
    sub: string;
    email: string;
    role: string;
  };
}

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // ─── FRANCHISEE: Place order ──────────────────────────────────────────────
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles('franchise_owner', 'franchisee', 'crew')
  async createOrder(
    @Body() dto: CreateOrderDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<unknown> {
    const order = await this.ordersService.createOrder(req.user.sub, dto);
    return {
      success: true,
      message: 'Order placed successfully! Admin is now processing your order.',
      data: order,
    };
  }

  // ─── FRANCHISEE: View own orders ──────────────────────────────────────────
  @Get('my-orders')
  @UseGuards(RolesGuard)
  @Roles('franchise_owner', 'franchisee', 'crew')
  async getMyOrders(@Request() req: AuthenticatedRequest): Promise<unknown> {
    const orders = await this.ordersService.getMyOrders(req.user.sub);
    return { success: true, data: orders };
  }

  // ─── ADMIN: View all orders ───────────────────────────────────────────────
  @Get()
  @UseGuards(RolesGuard)
  @Roles('hq_admin')
  async getAllOrders(): Promise<unknown> {
    const orders = await this.ordersService.getAllOrders();
    return { success: true, data: orders };
  }

  // ─── ADMIN: Update order status ───────────────────────────────────────────
  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('hq_admin')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<unknown> {
    const order = await this.ordersService.updateOrderStatus(
      id,
      dto,
      req.user.role,
    );
    return {
      success: true,
      message: `Order status updated to ${dto.status}`,
      data: order,
    };
  }
}
