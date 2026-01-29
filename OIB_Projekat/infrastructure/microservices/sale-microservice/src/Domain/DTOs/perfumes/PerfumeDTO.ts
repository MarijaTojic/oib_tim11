import { PerfumeType } from "../../enums/PerfumeType";

export interface PerfumeDTO {
  id?: number;
  name: string;
  type: PerfumeType;
  netQuantity: number; //u ml
  serialNumber: string; // PP-2025-ID_PARFEMA
  plantId: number;
  expirationDate: Date;
}