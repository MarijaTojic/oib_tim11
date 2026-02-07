import { LogisticsAlgorithm } from "./PerformanceResultDTO";

export interface SimulationRequestDTO {
  algorithms: LogisticsAlgorithm[];
  simulationName: string;
  numberOfSimulations?: number;
  numberOfParticles?: number;
  numberOfIterations?: number;
}
