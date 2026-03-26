// backend/src/modules/auth/dto/create-account.dto.ts
import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  IsNotEmpty,
  IsIn,
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

  // Only franchisee and crew — owner signs up via invitation code
  @IsNotEmpty({ message: 'Role is required' })
  @IsIn(['franchisee', 'crew'], {
    message: 'Role must be franchisee or crew',
  })
  role: string;

  @IsNotEmpty({ message: 'Branch is required' })
  @IsString()
  branch: string;
}
