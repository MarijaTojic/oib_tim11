import { PerfumeDTO } from "../perfumes/PerfumeDTO";

export interface CatalogueDTO {
  id?: number;
  allPerfumes: PerfumeDTO[]; 
  amount: number;
}
