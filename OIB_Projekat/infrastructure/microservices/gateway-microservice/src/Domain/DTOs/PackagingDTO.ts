import { PackagingStatus } from "../enums/PackagingStatus";

export interface PackagingDTO {
  id?: number;
  name: string;
  senderAddress: string;
  storageId: number;
  perfumeIds: number[];
  status: PackagingStatus;
}
