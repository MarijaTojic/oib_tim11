import { PackagingStatus } from "../../enums/PackagingStatus";

export interface PackagingDTO {
  id?: number;
  name: string;
  senderAddress: string;
  storageID: number; 
  perfumeList: string[]; // lista PP-2025-ID_PARFEMA
  status: PackagingStatus;
}