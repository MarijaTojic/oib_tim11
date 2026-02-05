import { Repository } from 'typeorm';
import { PerformanceResult, LogisticsAlgorithm } from '../Domain/models/PerformanceResult';

export class DatabaseSeeder {
  constructor(private performanceRepository: Repository<PerformanceResult>) {}

  async seed(): Promise<void> {
    try {
      const existingResults = await this.performanceRepository.count();

      if (existingResults > 0) {
        console.log('\x1b[33m[DatabaseSeeder]\x1b[0m Database already seeded, skipping...');
        return;
      }

      console.log('\x1b[32m[DatabaseSeeder]\x1b[0m Seeding database with initial data...');

      // Create sample performance results
      const sampleResults: Partial<PerformanceResult>[] = [
        {
          algorithm: LogisticsAlgorithm.DIJKSTRA,
          simulationName: 'Initial Test - Dijkstra',
          numberOfSimulations: 1,
          numberOfParticles: 100,
          numberOfIterations: 50,
          metrics: {
            executionTime: 175.32,
            distanceCovered: 1245.67,
            costOptimization: 48.22,
            pathEfficiency: 82.45,
            memoryUsage: 275.34,
            successRate: 98.5,
          },
          analysisConclusions:
            'Algorithm: dijkstra\nExecution Time: 175.32ms\nPath Efficiency: 82.45%\nCost Optimization: 48.22%\nSuccess Rate: 98.50%\nThis algorithm shows good path optimization capabilities.\nModerate execution time is acceptable for most use cases.',
          detailedReport:
            '=== PERFORMANCE ANALYSIS REPORT ===\n\nSimulation Name: Initial Test - Dijkstra\nAlgorithm: dijkstra\nNumber of Simulations: 1\nNumber of Particles: 100\nNumber of Iterations: 50\n\n--- PERFORMANCE METRICS ---\nExecution Time: 175.32 ms\nDistance Covered: 1245.67 km\nCost Optimization: 48.22%\nPath Efficiency: 82.45%\nMemory Usage: 275.34 MB\nSuccess Rate: 98.50%\n\n--- ANALYSIS & CONCLUSIONS ---\nThis algorithm shows good path optimization capabilities.\nModerate execution time is acceptable for most use cases.',
          generatedBy: 'System Seeder',
        },
        {
          algorithm: LogisticsAlgorithm.ASTAR,
          simulationName: 'Initial Test - A*',
          numberOfSimulations: 1,
          numberOfParticles: 100,
          numberOfIterations: 50,
          metrics: {
            executionTime: 145.21,
            distanceCovered: 1198.45,
            costOptimization: 55.78,
            pathEfficiency: 87.32,
            memoryUsage: 310.22,
            successRate: 97.2,
          },
          analysisConclusions:
            'Algorithm: astar\nExecution Time: 145.21ms\nPath Efficiency: 87.32%\nCost Optimization: 55.78%\nSuccess Rate: 97.20%\nThis algorithm shows excellent path optimization capabilities.\nFast execution time makes this suitable for real-time applications.\nGood cost optimization performance detected.',
          detailedReport:
            '=== PERFORMANCE ANALYSIS REPORT ===\n\nSimulation Name: Initial Test - A*\nAlgorithm: astar\nNumber of Simulations: 1\nNumber of Particles: 100\nNumber of Iterations: 50\n\n--- PERFORMANCE METRICS ---\nExecution Time: 145.21 ms\nDistance Covered: 1198.45 km\nCost Optimization: 55.78%\nPath Efficiency: 87.32%\nMemory Usage: 310.22 MB\nSuccess Rate: 97.20%\n\n--- ANALYSIS & CONCLUSIONS ---\nThis algorithm shows excellent path optimization capabilities.\nFast execution time makes this suitable for real-time applications.',
          generatedBy: 'System Seeder',
        },
        {
          algorithm: LogisticsAlgorithm.GENETIC_ALGORITHM,
          simulationName: 'Initial Test - Genetic',
          numberOfSimulations: 1,
          numberOfParticles: 100,
          numberOfIterations: 50,
          metrics: {
            executionTime: 365.89,
            distanceCovered: 1178.92,
            costOptimization: 64.55,
            pathEfficiency: 89.11,
            memoryUsage: 425.67,
            successRate: 94.8,
          },
          analysisConclusions:
            'Algorithm: genetic_algorithm\nExecution Time: 365.89ms\nPath Efficiency: 89.11%\nCost Optimization: 64.55%\nSuccess Rate: 94.80%\nThis algorithm shows excellent path optimization capabilities.\nLonger execution time suggests this algorithm is better for complex optimizations.\nExcellent cost optimization performance detected.',
          detailedReport:
            '=== PERFORMANCE ANALYSIS REPORT ===\n\nSimulation Name: Initial Test - Genetic\nAlgorithm: genetic_algorithm\nNumber of Simulations: 1\nNumber of Particles: 100\nNumber of Iterations: 50\n\n--- PERFORMANCE METRICS ---\nExecution Time: 365.89 ms\nDistance Covered: 1178.92 km\nCost Optimization: 64.55%\nPath Efficiency: 89.11%\nMemory Usage: 425.67 MB\nSuccess Rate: 94.80%\n\n--- ANALYSIS & CONCLUSIONS ---\nThis algorithm shows excellent path optimization capabilities.\nLonger execution time suggests this algorithm is better for complex optimizations.',
          generatedBy: 'System Seeder',
        },
      ];

      for (const resultData of sampleResults) {
        const result = this.performanceRepository.create(resultData);
        await this.performanceRepository.save(result);
      }

      console.log('\x1b[32m[DatabaseSeeder]\x1b[0m Database seeding completed successfully!');
    } catch (error) {
      console.error('\x1b[31m[DatabaseSeeder]\x1b[0m Error seeding database:', error);
      throw error;
    }
  }
}
