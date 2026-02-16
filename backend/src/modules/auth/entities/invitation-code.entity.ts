// src/modules/auth/entities/invitation-code.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('invitation_codes')
export class InvitationCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  maxUses: number; // NULL means unlimited uses

  @Column({ default: 0 })
  currentUses: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 'franchise_owner' })
  role: string; // franchise_owner, admin, crew

  @Column({ nullable: true })
  expiresAt: Date;

  @OneToMany(() => User, (user) => user.invitationCode)
  users: User[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
