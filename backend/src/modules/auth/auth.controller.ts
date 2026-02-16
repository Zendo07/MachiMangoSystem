// src/modules/auth/auth.controller.ts
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
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { RateLimitGuard } from './guards/rate-limit.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RateLimitGuard)
  async signup(
    @Body() signupDto: SignupDto,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.signup(
      signupDto,
      ipAddress,
      userAgent || 'unknown',
    );
  }

  @Get('invitation-code/validate')
  async validateInvitationCode(@Query('code') code: string) {
    if (!code) {
      return {
        success: false,
        error: 'Invitation code is required',
      };
    }

    const validation = await this.authService.validateInvitationCode(code);

    return {
      success: true,
      valid: validation.isValid,
      message: validation.error || 'Invitation code is valid',
    };
  }
}
