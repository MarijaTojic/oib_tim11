import { PerfumeDTO } from "../../models/perfumes/PerfumeDTO";

export interface IPerfumeAPI {
    getAllPerfumes(): Promise<PerfumeDTO[]>;
    plantProcessing(plantId: number, quantity: number, volume: number, perfumeType: string): Promise<PerfumeDTO[]>
}