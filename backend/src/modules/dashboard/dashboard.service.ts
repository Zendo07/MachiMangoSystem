// backend/src/modules/dashboard/dashboard.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { User } from '../users/entities/user.entity';

export interface BranchStat {
  branch: string;
  orders: number;
  sales: number;
}

export interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  activeUsers: number;
  branchStats: BranchStat[];
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getStats(): Promise<DashboardStats> {
    // ── Total sales: sum of totalAmount across ALL orders ──────────────────
    const salesResult = await this.orderRepository
      .createQueryBuilder('order')
      .select('COALESCE(SUM(order.totalAmount), 0)', 'total')
      .getRawOne<{ total: string }>();

    const totalSales = parseFloat(salesResult?.total ?? '0');

    // ── Total orders count ─────────────────────────────────────────────────
    const totalOrders = await this.orderRepository.count();

    // ── Active users: admins + crew created by admin (all active users) ───
    const activeUsers = await this.userRepository.count({
      where: { isActive: true },
    });

    // ── Branch stats: orders count + sales per branch ──────────────────────
    const branchRaw = await this.orderRepository
      .createQueryBuilder('order')
      .select('order.branch', 'branch')
      .addSelect('COUNT(order.id)', 'orders')
      .addSelect('COALESCE(SUM(order.totalAmount), 0)', 'sales')
      .groupBy('order.branch')
      .orderBy('orders', 'DESC')
      .getRawMany<{ branch: string; orders: string; sales: string }>();

    const branchStats: BranchStat[] = branchRaw.map((r) => ({
      branch: r.branch,
      orders: parseInt(r.orders, 10),
      sales: parseFloat(r.sales),
    }));

    return {
      totalSales,
      totalOrders,
      activeUsers,
      branchStats,
    };
  }
}
