import { PerfumeDTO } from "../../models/perfumes/PerfumeDTO";

export interface IPerfumeAPI {
    getAllPerfumes(): Promise<PerfumeDTO[]>;
    plantProcessing(Perfume : PerfumeDTO, quantityBottle: number, volumeBottle : number) : Promise<PerfumeDTO[]>; 
}