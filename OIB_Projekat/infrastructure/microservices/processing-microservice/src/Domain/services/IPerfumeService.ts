import { PerfumeDTO } from "../DTOs/PerfumeDTO";
import { PerfumeType } from "../enums/PerfumeType";
import { Perfume } from "../models/Perfume";

export interface IPerfumeService {
  createPerfume(perfume: Perfume): Promise<PerfumeDTO>;
  getAllPerfumes(): Promise<PerfumeDTO[]>;
  getPerfumeByTypeAndQuantity(type : PerfumeType, quantity : number): Promise<PerfumeDTO>; 
}
