import { SaleType } from "../enums/SaleType";
import { PaymentType } from "../enums/PaymentType";

export interface ReceiptDTO {
  id?: number;
  saleType: SaleType;
  paymentType: PaymentType;
  perfumeItems: {
    perfumeId: number;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  createdAt?: Date;
}
