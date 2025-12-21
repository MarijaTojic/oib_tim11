import { PerfumeDTO } from "../../models/perfumes/PerfumeDTO";

export interface IPerfumeAPI {
    getAllPerfumes(): Promise<PerfumeDTO[]>;
}