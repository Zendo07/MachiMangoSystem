import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
// import { Branch } from '../../branches/entities/branch.entity';  // Comment out for now
import { InvitationCode } from '../../auth/entities/invitation-code.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  fullName: string;

  @Column({
    type: 'enum',
    enum: ['hq_admin', 'franchise_owner', 'franchisee', 'crew'],
    default: 'crew',
  })
  role: string;

  @Column({ nullable: true })
  branchId: string;

  // Comment out Branch relationship for now
  // @ManyToOne(() => Branch, (branch) => branch.users, { nullable: true })
  // @JoinColumn({ name: 'branchId' })
  // branch: Branch;

  @Column({ nullable: true })
  invitationCodeId: string;

  @ManyToOne(() => InvitationCode, (code) => code.users, { nullable: true })
  @JoinColumn({ name: 'invitationCodeId' })
  invitationCode: InvitationCode;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true })
  emailVerificationToken: string;

  @Column({ nullable: true })
  emailVerificationExpires: Date;

  @Column({ nullable: true })
  passwordResetToken: string;

  @Column({ nullable: true })
  passwordResetExpires: Date;

  @Column({ nullable: true })
  lastLogin: Date;

  @Column({ default: 0 })
  loginAttempts: number;

  @Column({ nullable: true })
  lockedUntil: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
