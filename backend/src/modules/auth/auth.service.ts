// src/modules/auth/auth.service.ts
import {
  Injectable,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { User } from '../users/entities/user.entity';
import { InvitationCode } from './entities/invitation-code.entity';
import { AuditLog } from './entities/audit-log.entity';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(InvitationCode)
    private invitationCodeRepository: Repository<InvitationCode>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
    private jwtService: JwtService,
  ) {}

  // ─── SIGNUP ───────────────────────────────────────────────────────────────
  async signup(
    signupDto: SignupDto,
    ipAddress: string,
    userAgent: string,
  ): Promise<any> {
    const { invitationCode, fullName, email, password } = signupDto;

    // 1. Validate invitation code
    const codeValidation = await this.validateInvitationCode(invitationCode);

    if (!codeValidation.isValid) {
      await this.logAudit(
        null,
        'SIGNUP_INVALID_INVITATION_CODE',
        'invitation_code',
        null,
        { code: invitationCode, error: codeValidation.error },
        ipAddress,
        userAgent,
      );
      throw new BadRequestException(codeValidation.error);
    }

    // 2. Check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      await this.logAudit(
        null,
        'SIGNUP_EMAIL_EXISTS',
        'user',
        null,
        { email },
        ipAddress,
        userAgent,
      );
      throw new ConflictException('An account with this email already exists');
    }

    // 3. Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 4. Generate email verification token
    const emailVerificationToken = randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // 5. Create user - ADMIN ONLY
    const user = this.userRepository.create({
      fullName,
      email: email.toLowerCase(),
      password: passwordHash,
      role: 'hq_admin', // HARDCODED TO ADMIN ONLY
      invitationCodeId: codeValidation.code?.id,
      emailVerificationToken,
      emailVerificationExpires,
      isEmailVerified: false,
      isActive: true,
    });

    const savedUser = await this.userRepository.save(user);

    // 6. Increment invitation code usage
    if (codeValidation.code?.id) {
      await this.incrementInvitationCodeUsage(codeValidation.code.id);
    }

    // 7. Log successful signup
    await this.logAudit(
      savedUser.id,
      'ADMIN_SIGNUP_SUCCESS',
      'user',
      savedUser.id,
      {
        email: savedUser.email,
        role: savedUser.role,
        invitationCodeId: codeValidation.code?.id,
      },
      ipAddress,
      userAgent,
    );

    const { password: _, ...userWithoutPassword } = savedUser;

    return {
      success: true,
      message:
        'Admin account created successfully! Redirecting to dashboard...',
      data: userWithoutPassword,
    };
  }

  // ─── LOGIN ────────────────────────────────────────────────────────────────
  async login(
    email: string,
    password: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<any> {
    // 1. Find user by email
    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      await this.logAudit(
        null,
        'LOGIN_USER_NOT_FOUND',
        'user',
        null,
        { email },
        ipAddress,
        userAgent,
      );
      throw new UnauthorizedException('Invalid email or password');
    }

    // 2. Check if account is active
    if (!user.isActive) {
      throw new UnauthorizedException(
        'Your account has been deactivated. Contact HQ.',
      );
    }

    // 3. Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / 60000,
      );
      throw new UnauthorizedException(
        `Account locked. Try again in ${minutesLeft} minute(s).`,
      );
    }

    // 4. Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // Increment login attempts
      user.loginAttempts = (user.loginAttempts || 0) + 1;

      // Lock account after 5 failed attempts
      if (user.loginAttempts >= 5) {
        user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
        user.loginAttempts = 0;
      }

      await this.userRepository.save(user);

      await this.logAudit(
        user.id,
        'LOGIN_INVALID_PASSWORD',
        'user',
        user.id,
        { email, attempts: user.loginAttempts },
        ipAddress,
        userAgent,
      );

      throw new UnauthorizedException('Invalid email or password');
    }

    // 5. Reset login attempts on success
    user.loginAttempts = 0;
    user.lockedUntil = undefined as any;
    user.lastLogin = new Date();
    await this.userRepository.save(user);

    // 6. Generate JWT token
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);

    // 7. Log successful login
    await this.logAudit(
      user.id,
      'LOGIN_SUCCESS',
      'user',
      user.id,
      { email: user.email, role: user.role },
      ipAddress,
      userAgent,
    );

    const { password: _, ...userWithoutPassword } = user;

    return {
      success: true,
      message: 'Login successful! Redirecting to dashboard...',
      token,
      data: userWithoutPassword,
    };
  }

  // ─── VALIDATE INVITATION CODE ─────────────────────────────────────────────
  async validateInvitationCode(
    code: string,
  ): Promise<{ isValid: boolean; code?: InvitationCode; error?: string }> {
    const invitationCode = await this.invitationCodeRepository.findOne({
      where: { code },
    });

    if (!invitationCode) {
      return { isValid: false, error: 'Invalid invitation code' };
    }

    if (!invitationCode.isActive) {
      return {
        isValid: false,
        error: 'This invitation code has been deactivated',
      };
    }

    if (invitationCode.expiresAt && invitationCode.expiresAt < new Date()) {
      return { isValid: false, error: 'This invitation code has expired' };
    }

    if (
      invitationCode.maxUses !== null &&
      invitationCode.currentUses >= invitationCode.maxUses
    ) {
      return {
        isValid: false,
        error: 'This invitation code has reached its maximum number of uses',
      };
    }

    return { isValid: true, code: invitationCode };
  }

  async incrementInvitationCodeUsage(codeId: string): Promise<void> {
    await this.invitationCodeRepository.increment(
      { id: codeId },
      'currentUses',
      1,
    );
  }

  async logAudit(
    userId: string | null,
    action: string,
    entityType: string | null,
    entityId: string | null,
    newValues: any,
    ipAddress: string,
    userAgent: string,
  ): Promise<void> {
    try {
      const auditLog = this.auditLogRepository.create({
        userId: userId || undefined,
        action,
        entityType: entityType || undefined,
        entityId: entityId || undefined,
        newValues,
        ipAddress,
        userAgent,
      });
      await this.auditLogRepository.save(auditLog);
    } catch (error) {
      console.error('Failed to log audit:', error);
    }
  }
}
