import { PerformanceResultDTO } from "../../models/performance/PerformanceResultDTO";
import { SimulationRequestDTO } from "../../models/performance/SimulationRequestDTO";

export interface IPerformanceAPI {
  runSimulation(token: string, data: SimulationRequestDTO): Promise<PerformanceResultDTO[]>;
  getResults(token: string, limit?: number): Promise<PerformanceResultDTO[]>;
  getResultById(token: string, id: number): Promise<PerformanceResultDTO>;
  deleteResult(token: string, id: number): Promise<void>;
  exportResult(token: string, id: number): Promise<void>;
  downloadPdf(token: string, id: number): Promise<Blob>;
}
