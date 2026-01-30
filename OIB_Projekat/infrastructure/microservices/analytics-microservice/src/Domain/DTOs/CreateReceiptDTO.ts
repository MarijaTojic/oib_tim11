import { SaleType } from '../enums/SaleType';
import { PaymentType } from '../enums/PaymentType';
import { PerfumeDetailDTO } from './PerfumeDetailDTO';

export interface CreateReceiptDTO {
  saleType: SaleType;
  paymentType: PaymentType;
  perfumeDetails: PerfumeDetailDTO[];
  totalAmount: number;
  userId: number;
}
