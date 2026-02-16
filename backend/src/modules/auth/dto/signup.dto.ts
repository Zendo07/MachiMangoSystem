// src/modules/auth/dto/signup.dto.ts
import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  Matches,
  IsNotEmpty,
} from 'class-validator';
import { Match } from '../decorators/match.decorator';

export class SignupDto {
  @IsNotEmpty({ message: 'Invitation code is required' })
  @IsString()
  @Matches(/^\$machimango_Admin-051\$$/, {
    message: 'Invalid invitation code format',
  })
  invitationCode: string;

  @IsNotEmpty({ message: 'Full name is required' })
  @IsString()
  @MinLength(2, { message: 'Full name must be at least 2 characters' })
  @MaxLength(255, { message: 'Full name is too long' })
  @Matches(/^[a-zA-Z\s'-]+$/, {
    message:
      'Full name can only contain letters, spaces, hyphens, and apostrophes',
  })
  fullName: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email address' })
  @MaxLength(255, { message: 'Email is too long' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(/[a-z]/, {
    message: 'Password must contain at least one lowercase letter',
  })
  @Matches(/[A-Z]/, {
    message: 'Password must contain at least one uppercase letter',
  })
  @Matches(/[0-9]/, { message: 'Password must contain at least one number' })
  @Matches(/[^a-zA-Z0-9]/, {
    message: 'Password must contain at least one special character',
  })
  password: string;

  @IsNotEmpty({ message: 'Please confirm your password' })
  @IsString()
  @Match('password', { message: 'Passwords do not match' })
  confirmPassword: string;
}
