// src/modules/auth/auth.service.ts
import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
  ) {}

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
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // 5. Create user
const user = this.userRepository.create({
  fullName,
  email: email.toLowerCase(),
  password: passwordHash,
  role: codeValidation.code?.role || 'franchise_owner',  // Add ?. and fallback
  invitationCodeId: codeValidation.code?.id,  // Add ?.
  emailVerificationToken,
  emailVerificationExpires,
  isEmailVerified: false,
  isActive: true,
});

const savedUser = await this.userRepository.save(user);

// 6. Increment invitation code usage
if (codeValidation.code?.id) {  // Add null check
  await this.incrementInvitationCodeUsage(codeValidation.code.id);
}

// 7. Log successful signup
await this.logAudit(
  savedUser.id,
  'USER_SIGNUP_SUCCESS',
  'user',
  savedUser.id,
  {
    email: savedUser.email,
    role: savedUser.role,
    invitationCodeId: codeValidation.code?.id,  // Add ?.
  },
  ipAddress,
  userAgent,
);

    // TODO: Send verification email
    // await this.sendVerificationEmail(email, emailVerificationToken);

    // Return user data without password
    const { password: _, ...userWithoutPassword } = savedUser;

    return {
      success: true,
      message:
        'Account created successfully! Please check your email to verify your account.',
      data: userWithoutPassword,
    };
  }

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
      userId: userId || undefined,  // Fix here
      action,
      entityType: entityType || undefined,  // Fix here
      entityId: entityId || undefined,  // Fix here
      newValues,
      ipAddress,
      userAgent,
    });
    await this.auditLogRepository.save(auditLog);
  } catch (error) {
    console.error('Failed to log audit:', error);
  }
}