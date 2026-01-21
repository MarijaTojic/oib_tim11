import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { SaleType } from '../enums/SaleType';
import { PaymentType } from '../enums/PaymentType';

@Entity('fiskalni_racuni')
export class Receipt {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'enum', enum: SaleType })
  saleType!: SaleType;

  @Column({ type: 'enum', enum: PaymentType })
  paymentType!: PaymentType;

  @Column({ type: 'json' })
  perfumeDetails!: Array<{
    perfumeId: number;
    perfumeName: string;
    quantity: number;
    price: number;
    totalPrice: number;
  }>;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount!: number;

  @Column({ type: 'int' })
  userId!: number;

  @CreateDateColumn()
  createdAt!: Date;
}
