import { CreateSaleDTO } from "../DTOs/CreateSaleDTO";

export interface ISalesService {
  sell(dto: CreateSaleDTO): Promise<any>;
  getCatalogue(): Promise<any>;
  syncFromPerfumeService(): Promise<any>;
}