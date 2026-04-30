import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('terms_versions')
export class TermsVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'version', type: 'varchar', length: 20, unique: true })
  version: string;

  @Column({ name: 'title', type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'content_url', type: 'varchar', length: 500, nullable: true })
  contentUrl: string | null;

  @Column({ name: 'is_active', default: false })
  isActive: boolean;

  @Column({ name: 'effective_date', type: 'timestamp' })
  effectiveDate: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
}
