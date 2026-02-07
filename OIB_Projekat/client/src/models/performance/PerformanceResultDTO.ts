export type LogisticsAlgorithm =
  | "dijkstra"
  | "astar"
  | "genetic_algorithm"
  | "ant_colony"
  | "particle_swarm";

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
  comparisonWithOthers?: Record<string, AlgorithmMetricsDTO>;
  analysisConclusions: string | null;
  detailedReport: string | null;
  generatedBy: string | null;
  createdAt: string;
  exportedAt: string | null;
}
