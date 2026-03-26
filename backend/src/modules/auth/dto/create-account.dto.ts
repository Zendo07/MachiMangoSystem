// backend/src/modules/auth/dto/create-account.dto.ts
import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  IsNotEmpty,
  IsIn,
  IsOptional,
} from 'class-validator';

export class CreateAccountDto {
  @IsNotEmpty({ message: 'Full name is required' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  fullName: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email address' })
  @MaxLength(255)
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;

  // Admin can create franchise_owner, franchisee, or crew
  @IsNotEmpty({ message: 'Role is required' })
  @IsIn(['franchise_owner', 'franchisee', 'crew'], {
    message: 'Role must be franchise_owner, franchisee, or crew',
  })
  role: string;

  @IsOptional()
  @IsString()
  branch?: string;
}
