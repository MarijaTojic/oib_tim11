import { SaleType } from "../enums/SaleType";
import { PaymentType } from "../enums/PaymentType";

export interface CreateReceiptDTO {
  saleType: SaleType;
  paymentType: PaymentType;
  perfumeDetails: {
    perfumeId: number;
    perfumeName: string;
    quantity: number;
    price: number;
    totalPrice: number;
  }[];
  totalAmount: number;
  userId: number;
}
