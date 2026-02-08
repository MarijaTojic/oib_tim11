import { CatalogueDTO } from "../../models/catalogues/CatalogueDTO";

export interface ISalesAPI {
  getCatalogue(): Promise<CatalogueDTO[]>; 
  sell(
    userId: number,
    perfumeIds: number[]
  ): Promise<{ success: boolean; message?: string; qrCode?: string }>;
}
