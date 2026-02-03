import { AlgorithmMetricsDTO } from './PerformanceResultDTO';
import { LogisticsAlgorithm } from '../models/PerformanceResult';

export interface SimulationComparisonDTO {
  simulationName: string;
  results: {
    [key in LogisticsAlgorithm]?: AlgorithmMetricsDTO;
  };
  bestAlgorithm: LogisticsAlgorithm;
  bestMetrics: AlgorithmMetricsDTO;
  summary: string;
}
