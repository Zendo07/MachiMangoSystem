// backend/src/modules/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Ip,
  Headers,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { CreateAccountDto } from './dto/create-account.dto';
import { RateLimitGuard } from './guards/rate-limit.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';

// Typed request after JWT guard attaches decoded token as `user`
interface AuthenticatedRequest extends ExpressRequest {
  user: {
    sub: string;
    email: string;
    role: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ─── ADMIN SIGNUP (invitation code required) ─────────────────────────────
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RateLimitGuard)
  async signup(
    @Body() signupDto: SignupDto,
    @Ip() ip: string,
    @Headers('user-agent') ua: string,
  ): Promise<unknown> {
    return this.authService.signup(signupDto, ip, ua || 'unknown');
  }

  // ─── LOGIN (all roles) ───────────────────────────────────────────────────
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: { email: string; password: string },
    @Ip() ip: string,
    @Headers('user-agent') ua: string,
  ): Promise<unknown> {
    return this.authService.login(
      body.email,
      body.password,
      ip,
      ua || 'unknown',
    );
  }

  // ─── CREATE ACCOUNT (hq_admin only) ──────────────────────────────────────
  @Post('create-account')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('hq_admin')
  async createAccount(
    @Body() dto: CreateAccountDto,
    @Request() req: AuthenticatedRequest,
    @Ip() ip: string,
    @Headers('user-agent') ua: string,
  ): Promise<unknown> {
    return this.authService.createAccount(
      dto,
      req.user.sub,
      ip,
      ua || 'unknown',
    );
  }

  // ─── GET CURRENT USER (session hydration) ────────────────────────────────
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Request() req: AuthenticatedRequest): {
    success: boolean;
    data: AuthenticatedRequest['user'];
  } {
    return { success: true, data: req.user };
  }

  // ─── VALIDATE INVITATION CODE ────────────────────────────────────────────
  @Get('invitation-code/validate')
  async validateInvitationCode(@Query('code') code: string): Promise<{
    success: boolean;
    valid?: boolean;
    error?: string;
    message?: string;
  }> {
    if (!code) return { success: false, error: 'Invitation code is required' };
    const v = await this.authService.validateInvitationCode(code);
    return {
      success: true,
      valid: v.isValid,
      message: v.error || 'Invitation code is valid',
    };
  }
}
