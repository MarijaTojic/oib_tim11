import { CatalogueDTO } from "../../models/catalogues/CatalogueDTO";

export interface ISalesAPI {
  getCatalogue(): Promise<CatalogueDTO[]>;
  sell(userId: number, quantities: Record<number, number>): Promise<any>;
}
