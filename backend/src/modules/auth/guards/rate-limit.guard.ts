// src/modules/auth/guards/rate-limit.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private rateLimitMap = new Map<string, RateLimitRecord>();
  private readonly windowMs = 15 * 60 * 1000; // 15 minutes
  private readonly maxAttempts = 5; // 5 attempts per window

  constructor() {
    // Clean up old records every hour
    setInterval(
      () => {
        const now = Date.now();
        for (const [ip, record] of this.rateLimitMap.entries()) {
          if (now > record.resetTime) {
            this.rateLimitMap.delete(ip);
          }
        }
      },
      60 * 60 * 1000,
    );
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const ip = this.getClientIp(request);
    const now = Date.now();

    const record = this.rateLimitMap.get(ip);

    if (!record || now > record.resetTime) {
      this.rateLimitMap.set(ip, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return true;
    }

    if (record.count >= this.maxAttempts) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      throw new HttpException(
        {
          success: false,
          error: 'Too many signup attempts. Please try again later.',
          retryAfter,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    record.count++;
    return true;
  }

  private getClientIp(request: any): string {
    const forwarded = request.headers['x-forwarded-for'];
    const realIp = request.headers['x-real-ip'];

    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }

    if (realIp) {
      return realIp;
    }

    return request.ip || 'unknown';
  }
}
