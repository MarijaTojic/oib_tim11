import { Repository } from 'typeorm';
import { IPerformanceService } from '../Domain/services/IPerformanceService';
import { PerformanceResult, LogisticsAlgorithm } from '../Domain/models/PerformanceResult';
import { SimulationRequestDTO, SimulationComparisonDTO } from '../Domain/DTOs';

export class PerformanceService implements IPerformanceService {
  constructor(private performanceRepository: Repository<PerformanceResult>) {
    console.log('\x1b[35m[Performance@1.0.0]\x1b[0m Service started');
  }

  async runSimulation(request: SimulationRequestDTO): Promise<PerformanceResult[]> {
    try {
      const results: PerformanceResult[] = [];
      const numberOfSimulations = request.numberOfSimulations || 1;
      const numberOfParticles = request.numberOfParticles || 100;
      const numberOfIterations = request.numberOfIterations || 50;

      for (const algorithm of request.algorithms) {
        const result = new PerformanceResult();
        result.algorithm = algorithm;
        result.simulationName = request.simulationName;
        result.numberOfSimulations = numberOfSimulations;
        result.numberOfParticles = numberOfParticles;
        result.numberOfIterations = numberOfIterations;

        // Simulate algorithm execution
        result.metrics = this.simulateAlgorithmExecution(
          algorithm,
          numberOfSimulations,
          numberOfParticles,
          numberOfIterations
        );

        result.analysisConclusions = this.generateAnalysisConclusions(result.metrics, algorithm);

        let savedResult = await this.performanceRepository.save(result);
        savedResult.detailedReport = this.generateDetailedReport(savedResult);
        savedResult = await this.performanceRepository.save(savedResult);
        results.push(savedResult);

        console.log(
          `\x1b[35m[Performance@1.0.0]\x1b[0m Performance simulation for ${algorithm} completed with ID: ${savedResult.id}`
        );
      }

      return results;
    } catch (error) {
      console.error('\x1b[31m[Performance@1.0.0]\x1b[0m Error running simulation:', error);
      throw error;
    }
  }

  async getPerformanceResults(limit?: number): Promise<PerformanceResult[]> {
    try {
      const query = this.performanceRepository
        .createQueryBuilder('performance')
        .orderBy('performance.createdAt', 'DESC');

      if (limit) {
        query.limit(limit);
      }

      const results = await query.getMany();
      return results;
    } catch (error) {
      console.error('\x1b[31m[Performance@1.0.0]\x1b[0m Error fetching performance results:', error);
      throw error;
    }
  }

  async getPerformanceResultById(id: number): Promise<PerformanceResult | null> {
    try {
      const result = await this.performanceRepository.findOne({ where: { id } });
      return result || null;
    } catch (error) {
      console.error('\x1b[31m[Performance@1.0.0]\x1b[0m Error fetching performance result:', error);
      throw error;
    }
  }

  async deletePerformanceResult(id: number): Promise<boolean> {
    try {
      const result = await this.performanceRepository.delete(id);
      const isDeleted = (result.affected ?? 0) > 0;

      console.log(
        `\x1b[35m[Performance@1.0.0]\x1b[0m Performance result ${id} ${isDeleted ? 'deleted' : 'not found'}`
      );

      return isDeleted;
    } catch (error) {
      console.error('\x1b[31m[Performance@1.0.0]\x1b[0m Error deleting performance result:', error);
      throw error;
    }
  }

  async compareAlgorithms(simulationId: number): Promise<SimulationComparisonDTO | null> {
    try {
      const baseResult = await this.performanceRepository.findOne({ where: { id: simulationId } });
      
      if (!baseResult) {
        return null;
      }

      const results = await this.performanceRepository.find({
        where: { simulationName: baseResult.simulationName }
      });

      if (!results || results.length === 0) {
        return null;
      }

      const comparisonResults: { [key in LogisticsAlgorithm]?: any } = {};
      let bestAlgorithm: LogisticsAlgorithm | null = null;
      let bestScore = 0;

      for (const result of results) {
        comparisonResults[result.algorithm] = {
          executionTime: result.metrics.executionTime,
          distanceCovered: result.metrics.distanceCovered,
          costOptimization: result.metrics.costOptimization,
          pathEfficiency: result.metrics.pathEfficiency,
          memoryUsage: result.metrics.memoryUsage,
          successRate: result.metrics.successRate
        };

        // Calculate overall score (higher is better)
        const score =
          (result.metrics.pathEfficiency * 0.3) +
          (result.metrics.costOptimization * 0.3) +
          ((100 - result.metrics.executionTime / 100) * 0.2) +
          (result.metrics.successRate * 0.2);

        if (score > bestScore) {
          bestScore = score;
          bestAlgorithm = result.algorithm;
        }
      }

      if (!bestAlgorithm) {
        return null;
      }

      const bestResult = results.find(r => r.algorithm === bestAlgorithm);

      const comparison: SimulationComparisonDTO = {
        simulationName: results[0].simulationName,
        results: comparisonResults,
        bestAlgorithm: bestAlgorithm,
        bestMetrics: bestResult!.metrics,
        summary: `The best performing algorithm is ${bestAlgorithm} with overall score of ${bestScore.toFixed(2)}`
      };

      return comparison;
    } catch (error) {
      console.error('\x1b[31m[Performance@1.0.0]\x1b[0m Error comparing algorithms:', error);
      throw error;
    }
  }

  async updatePerformanceResultExportDate(id: number): Promise<boolean> {
    try {
      const result = await this.performanceRepository.update(id, {
        exportedAt: new Date()
      });

      const isUpdated = result.affected !== undefined && result.affected > 0;

      console.log(
        `\x1b[35m[Performance@1.0.0]\x1b[0m Performance result ${id} export date ${isUpdated ? 'updated' : 'not found'}`
      );

      return isUpdated;
    } catch (error) {
      console.error('\x1b[31m[Performance@1.0.0]\x1b[0m Error updating performance result:', error);
      throw error;
    }
  }

  // ========================
  // Private Helper Methods
  // ========================

  private simulateAlgorithmExecution(
    algorithm: LogisticsAlgorithm,
    _numberOfSimulations: number,
    _numberOfParticles: number,
    _numberOfIterations: number
  ) {
    let executionTime: number;
    let distanceCovered: number;
    let costOptimization: number;
    let pathEfficiency: number;
    let memoryUsage: number;
    let successRate: number;

    switch (algorithm) {
    case LogisticsAlgorithm.DIJKSTRA:
      executionTime = 150 + Math.random() * 50;
      distanceCovered = 1200 + Math.random() * 100;
      costOptimization = 45 + Math.random() * 10;
      pathEfficiency = 75 + Math.random() * 15;
      memoryUsage = 250 + Math.random() * 50;
      successRate = 98 + Math.random() * 2;
      break;

    case LogisticsAlgorithm.ASTAR:
      executionTime = 120 + Math.random() * 40;
      distanceCovered = 1150 + Math.random() * 80;
      costOptimization = 52 + Math.random() * 12;
      pathEfficiency = 82 + Math.random() * 12;
      memoryUsage = 280 + Math.random() * 60;
      successRate = 96 + Math.random() * 3;
      break;

    case LogisticsAlgorithm.GENETIC_ALGORITHM:
      executionTime = 300 + Math.random() * 100;
      distanceCovered = 1100 + Math.random() * 120;
      costOptimization = 58 + Math.random() * 15;
      pathEfficiency = 85 + Math.random() * 10;
      memoryUsage = 380 + Math.random() * 80;
      successRate = 92 + Math.random() * 5;
      break;

    case LogisticsAlgorithm.ANT_COLONY:
      executionTime = 250 + Math.random() * 80;
      distanceCovered = 1120 + Math.random() * 100;
      costOptimization = 60 + Math.random() * 14;
      pathEfficiency = 87 + Math.random() * 8;
      memoryUsage = 320 + Math.random() * 70;
      successRate = 94 + Math.random() * 4;
      break;

    case LogisticsAlgorithm.PARTICLE_SWARM:
      executionTime = 280 + Math.random() * 90;
      distanceCovered = 1110 + Math.random() * 110;
      costOptimization = 62 + Math.random() * 13;
      pathEfficiency = 88 + Math.random() * 8;
      memoryUsage = 340 + Math.random() * 75;
      successRate = 93 + Math.random() * 4;
      break;

    default:
      executionTime = 200;
      distanceCovered = 1200;
      costOptimization = 50;
      pathEfficiency = 80;
      memoryUsage = 300;
      successRate = 95;
    }

    return {
      executionTime: Math.round(executionTime * 100) / 100,
      distanceCovered: Math.round(distanceCovered * 100) / 100,
      costOptimization: Math.round(costOptimization * 100) / 100,
      pathEfficiency: Math.round(pathEfficiency * 100) / 100,
      memoryUsage: Math.round(memoryUsage * 100) / 100,
      successRate: Math.round(successRate * 100) / 100
    };
  }

  private generateAnalysisConclusions(metrics: any, algorithm: LogisticsAlgorithm): string {
    const conclusions: string[] = [];

    conclusions.push(`Algorithm: ${algorithm}`);
    conclusions.push(`Execution Time: ${metrics.executionTime}ms`);
    conclusions.push(`Path Efficiency: ${metrics.pathEfficiency.toFixed(2)}%`);
    conclusions.push(`Cost Optimization: ${metrics.costOptimization.toFixed(2)}%`);
    conclusions.push(`Success Rate: ${metrics.successRate.toFixed(2)}%`);

    if (metrics.pathEfficiency > 85) {
      conclusions.push('This algorithm shows excellent path optimization capabilities.');
    } else if (metrics.pathEfficiency > 75) {
      conclusions.push('This algorithm shows good path optimization capabilities.');
    } else {
      conclusions.push('This algorithm shows acceptable path optimization capabilities.');
    }

    if (metrics.executionTime < 150) {
      conclusions.push('Fast execution time makes this suitable for real-time applications.');
    } else if (metrics.executionTime < 250) {
      conclusions.push('Moderate execution time is acceptable for most use cases.');
    } else {
      conclusions.push('Longer execution time suggests this algorithm is better for complex optimizations.');
    }

    if (metrics.costOptimization > 60) {
      conclusions.push('Excellent cost optimization performance detected.');
    } else if (metrics.costOptimization > 50) {
      conclusions.push('Good cost optimization performance detected.');
    }

    return conclusions.join('\n');
  }

  private generateDetailedReport(result: PerformanceResult): string {
    const report: string[] = [];

    report.push('=== PERFORMANCE ANALYSIS REPORT ===\n');
    report.push(`Simulation Name: ${result.simulationName}`);
    report.push(`Algorithm: ${result.algorithm}`);
    report.push(`Number of Simulations: ${result.numberOfSimulations}`);
    report.push(`Number of Particles: ${result.numberOfParticles}`);
    report.push(`Number of Iterations: ${result.numberOfIterations}`);
    report.push(`Generated: ${result.createdAt.toISOString()}\n`);

    report.push('--- PERFORMANCE METRICS ---');
    report.push(`Execution Time: ${result.metrics.executionTime.toFixed(2)} ms`);
    report.push(`Distance Covered: ${result.metrics.distanceCovered.toFixed(2)} km`);
    report.push(`Cost Optimization: ${result.metrics.costOptimization.toFixed(2)}%`);
    report.push(`Path Efficiency: ${result.metrics.pathEfficiency.toFixed(2)}%`);
    report.push(`Memory Usage: ${result.metrics.memoryUsage.toFixed(2)} MB`);
    report.push(`Success Rate: ${result.metrics.successRate.toFixed(2)}%\n`);

    report.push('--- ANALYSIS & CONCLUSIONS ---');
    report.push(result.analysisConclusions || 'No conclusions available');

    return report.join('\n');
  }
}
