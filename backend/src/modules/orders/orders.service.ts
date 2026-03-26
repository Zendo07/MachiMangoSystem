// backend/src/modules/orders/orders.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // ─── FRANCHISEE: Place a new order ───────────────────────────────────────
  async createOrder(franchiseeId: string, dto: CreateOrderDto): Promise<Order> {
    const user = await this.userRepository.findOne({
      where: { id: franchiseeId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const order = this.orderRepository.create({
      franchiseeId,
      franchiseeName: user.fullName,
      branch: user.branchId ?? 'Unknown Branch',
      items: dto.items,
      totalAmount: dto.totalAmount,
      status: 'pending',
    });

    return this.orderRepository.save(order);
  }

  // ─── FRANCHISEE: Get own orders ───────────────────────────────────────────
  async getMyOrders(franchiseeId: string): Promise<Order[]> {
    return this.orderRepository.find({
      where: { franchiseeId },
      order: { createdAt: 'DESC' },
    });
  }

  // ─── ADMIN: Get all orders ────────────────────────────────────────────────
  async getAllOrders(): Promise<Order[]> {
    return this.orderRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  // ─── ADMIN: Update order status ───────────────────────────────────────────
  async updateOrderStatus(
    orderId: string,
    dto: UpdateOrderStatusDto,
    adminRole: string,
  ): Promise<Order> {
    if (adminRole !== 'hq_admin') {
      throw new ForbiddenException('Only HQ Admin can update order status');
    }

    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    order.status = dto.status as OrderStatus;
    if (dto.adminNote !== undefined) {
      order.adminNote = dto.adminNote;
    }

    return this.orderRepository.save(order);
  }

  // ─── ADMIN: Get single order ──────────────────────────────────────────────
  async getOrderById(orderId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }
}
