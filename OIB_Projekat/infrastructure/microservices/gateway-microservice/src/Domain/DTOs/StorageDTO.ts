export interface StorageDTO {
  id?: number;
  name: string;
  location: string;
  maxCapacity: number;
  currentCapacity?: number;
}
