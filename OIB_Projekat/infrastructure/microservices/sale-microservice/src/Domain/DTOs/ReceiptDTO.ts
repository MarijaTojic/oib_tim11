import { SaleType } from '../enums/SaleType';
import { PaymentType } from '../enums/PaymentType';
import { PerfumeDetailDTO } from './perfumes/PerfumeDetailDTO';

export interface ReceiptDTO {
  id?: number;
  saleType: SaleType;
  paymentType: PaymentType;
  perfumeDetails: PerfumeDetailDTO[];
  totalAmount: number;
  userId: number;
  createdAt?: Date;
}