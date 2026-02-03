import { LogisticsAlgorithm } from '../../types/LogisticsAlgorithmType';

export interface AlgorithmMetricsDTO {
  executionTime: number;
  distanceCovered: number;
  costOptimization: number;
  pathEfficiency: number;
  memoryUsage: number;
  successRate: number;
}

export interface PerformanceResultDTO {
  id: number;
  algorithm: LogisticsAlgorithm;
  simulationName: string;
  numberOfSimulations: number;
  numberOfParticles: number;
  numberOfIterations: number;
  metrics: AlgorithmMetricsDTO;
  comparisonWithOthers?: {
    [key in LogisticsAlgorithm]?: AlgorithmMetricsDTO;
  };
  analysisConclusions: string | null;
  detailedReport: string | null;
  generatedBy: string | null;
  createdAt: Date;
  exportedAt: Date | null;
}
