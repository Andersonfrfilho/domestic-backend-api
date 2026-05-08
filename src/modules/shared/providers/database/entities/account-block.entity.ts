import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from './user.entity';

export type AccountBlockReason =
  | 'EMAIL_CONFLICT'
  | 'PHONE_CONFLICT'
  | 'DOCUMENT_CONFLICT'
  | 'FRAUD_SUSPICION'
  | 'TERMS_VIOLATION'
  | 'MANUAL_BLOCK'
  | 'VERIFICATION_FAILED'
  | 'ACCOUNT_DISABLED';

@Entity('account_blocks')
export class AccountBlock {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  @Index('idx_account_blocks_user')
  userId: string;

  @Column({ type: 'varchar', length: 50 })
  @Index('idx_account_blocks_reason')
  reason: AccountBlockReason;

  @Column({ type: 'text', nullable: true })
  message: string | null;

  @Column({ name: 'blocked_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  blockedAt: Date;

  @Column({ name: 'resolved_at', type: 'timestamp', nullable: true })
  resolvedAt: Date | null;

  @Column({ name: 'resolved_by', type: 'uuid', nullable: true })
  resolvedBy: string | null;

  @Column({ name: 'can_retry_at', type: 'timestamp', nullable: true })
  canRetryAt: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
}
