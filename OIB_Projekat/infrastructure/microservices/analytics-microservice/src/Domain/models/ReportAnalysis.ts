import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('izvestaji_analize')
export class ReportAnalysis {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  reportName!: string;

  @Column({ type: 'enum', enum: ['monthly', 'weekly', 'yearly', 'total'], default: 'total' })
  analysisType!: 'monthly' | 'weekly' | 'yearly' | 'total';

  @Column({ type: 'json' })
  salesData!: {
    totalSales: number;
    totalRevenue: number;
    period?: string;
  };

  @Column({ type: 'json' })
  topTenPerfumes!: Array<{
    perfumeId: number;
    perfumeName: string;
    quantity: number;
    revenue: number;
  }>;

  @Column({ type: 'json' })
  salesTrend!: Array<{
    date: string;
    sales: number;
    revenue: number;
  }>;

  @Column({ type: 'longtext' })
  pdfData!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  generatedBy!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  exportedAt!: Date | null;
}
