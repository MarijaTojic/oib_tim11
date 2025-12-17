import { PaymentType } from "../../enums/PaymentType";
import { SaleType } from "../../enums/SaleType";

export interface PlantDTO {
  id?: number;
  saleType: SaleType;
  payementType: PaymentType;
  soldPerfumes: string[]; //lista parfema
  perfumeQuantity: number;
  total: number;
}