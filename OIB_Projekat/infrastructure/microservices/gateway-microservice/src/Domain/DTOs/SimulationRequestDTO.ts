import { LogisticsAlgorithm } from '../types/LogisticsAlgorithmType';

export interface SimulationRequestDTO {
  algorithms: LogisticsAlgorithm[];
  simulationName: string;
  numberOfSimulations?: number;
  numberOfParticles?: number;
  numberOfIterations?: number;
}
