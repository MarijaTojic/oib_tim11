import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('izvestaji_performanse')
export class ReportPerformance {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  reportName!: string;

  @Column({ type: 'enum', enum: ['distributive_center', 'warehouse_center', 'all'], default: 'all' })
  algorithmType!: 'distributive_center' | 'warehouse_center' | 'all';

  @Column({ type: 'json' })
  simulationResults!: {
    algorithmName: string;
    efficiency: number;
    averageDeliveryTime: number;
    packagesDelivered: number;
    successRate: number;
  };

  @Column({ type: 'json' })
  comparison!: Array<{
    algorithmName: string;
    efficiency: number;
    packagesPerShipment: number;
    timePerShipment: number;
  }>;

  @Column({ type: 'longtext' })
  conclusion!: string;

  @Column({ type: 'longtext' })
  pdfData!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  generatedBy!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  exportedAt!: Date | null;
}
