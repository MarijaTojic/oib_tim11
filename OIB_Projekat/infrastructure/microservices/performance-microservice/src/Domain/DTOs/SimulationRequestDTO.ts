import { LogisticsAlgorithm } from '../models/PerformanceResult';

export interface SimulationRequestDTO {
  algorithms: LogisticsAlgorithm[];
  simulationName: string;
  numberOfSimulations?: number;
  numberOfParticles?: number;
  numberOfIterations?: number;
}
