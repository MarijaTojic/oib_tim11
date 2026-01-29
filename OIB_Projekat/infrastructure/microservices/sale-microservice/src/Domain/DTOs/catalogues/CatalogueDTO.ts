import { PerfumeDTO } from "../perfumes/PerfumeDTO";

export interface CatalogueDTO {
  id?: number;
  allPerfumes: PerfumeDTO[]; //lista svih parfema
  amount: Number;
}