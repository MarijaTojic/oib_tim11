import { PackagingDTO } from "../packaging/PackagingDTO";

export interface WarehouseDTO {
  id: number;
  name: string;
  location: string;
  maxPackages: number;
  packages?: PackagingDTO[];
}