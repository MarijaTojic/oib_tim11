import { PerformanceResult } from '../models/PerformanceResult';
import { SimulationRequestDTO, SimulationComparisonDTO } from '../DTOs';

export interface IPerformanceService {
  runSimulation(request: SimulationRequestDTO): Promise<PerformanceResult[]>;
  getPerformanceResults(limit?: number): Promise<PerformanceResult[]>;
  getPerformanceResultById(id: number): Promise<PerformanceResult | null>;
  deletePerformanceResult(id: number): Promise<boolean>;
  compareAlgorithms(simulationId: number): Promise<SimulationComparisonDTO | null>;
  updatePerformanceResultExportDate(id: number): Promise<boolean>;
}
