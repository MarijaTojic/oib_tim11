import { Repository } from 'typeorm';
import { IAnalyticsService } from '../Domain/services/IAnalyticsService';
import { Receipt } from '../Domain/models/Receipt';
import { ReportAnalysis } from '../Domain/models/ReportAnalysis';
import { PerformanceResult, LogisticsAlgorithm } from '../Domain/models/PerformanceResult';
import { 
  CreateReceiptDTO, 
  CreateReportAnalysisDTO, 
  SimulationRequestDTO,
  SimulationComparisonDTO 
} from '../Domain/DTOs';

export class AnalyticsService implements IAnalyticsService {
  constructor(
    private receiptRepository: Repository<Receipt>,
    private reportRepository: Repository<ReportAnalysis>,
    private performanceRepository?: Repository<PerformanceResult>
  ) {
    console.log('\x1b[36m[Analytics@1.0.0]\x1b[0m Service started');
  }

  async createReceipt(receiptData: CreateReceiptDTO): Promise<Receipt> {
    try {
      const newReceipt = this.receiptRepository.create(receiptData);
      const savedReceipt = await this.receiptRepository.save(newReceipt);
      console.log(`\x1b[36m[Analytics@1.0.0]\x1b[0m Receipt created with ID: ${savedReceipt.id}`);
      return savedReceipt;
    } catch (error) {
      console.error('\x1b[31m[Analytics@1.0.0]\x1b[0m Error creating receipt:', error);
      throw error;
    }
  }

  async getReceipts(userId: number, startDate?: Date, endDate?: Date): Promise<Receipt[]> {
    try {
      const query = this.receiptRepository.createQueryBuilder('receipt').where('receipt.userId = :userId', {
        userId,
      });

      if (startDate) {
        query.andWhere('receipt.createdAt >= :startDate', { startDate });
      }

      if (endDate) {
        query.andWhere('receipt.createdAt <= :endDate', { endDate });
      }

      const receipts = await query.orderBy('receipt.createdAt', 'DESC').getMany();
      return receipts;
    } catch (error) {
      console.error('\x1b[31m[Analytics@1.0.0]\x1b[0m Error fetching receipts:', error);
      throw error;
    }
  }

  async getReceiptById(id: number): Promise<Receipt | null> {
    try {
      const receipt = await this.receiptRepository.findOne({ where: { id } });
      return receipt || null;
    } catch (error) {
      console.error('\x1b[31m[Analytics@1.0.0]\x1b[0m Error fetching receipt:', error);
      throw error;
    }
  }

  async deleteReceipt(id: number): Promise<boolean> {
    try {
      const result = await this.receiptRepository.delete(id);
      const isDeleted = (result.affected ?? 0) > 0;
      console.log(
        `\x1b[36m[Analytics@1.0.0]\x1b[0m Receipt ${id} ${isDeleted ? 'deleted' : 'not found'}`
      );
      return isDeleted;
    } catch (error) {
      console.error('\x1b[31m[Analytics@1.0.0]\x1b[0m Error deleting receipt:', error);
      throw error;
    }
  }

  async createReportAnalysis(reportData: CreateReportAnalysisDTO): Promise<ReportAnalysis> {
    try {
      const newReport = this.reportRepository.create(reportData);
      const savedReport = await this.reportRepository.save(newReport);
      console.log(`\x1b[36m[Analytics@1.0.0]\x1b[0m Report created with ID: ${savedReport.id}`);
      return savedReport;
    } catch (error) {
      console.error('\x1b[31m[Analytics@1.0.0]\x1b[0m Error creating report:', error);
      throw error;
    }
  }

  async getReportAnalysisList(limit?: number): Promise<ReportAnalysis[]> {
    try {
      const query = this.reportRepository.createQueryBuilder('report').orderBy('report.createdAt', 'DESC');

      if (limit) {
        query.limit(limit);
      }

      const reports = await query.getMany();
      return reports;
    } catch (error) {
      console.error('\x1b[31m[Analytics@1.0.0]\x1b[0m Error fetching reports:', error);
      throw error;
    }
  }

  async getReportAnalysisById(id: number): Promise<ReportAnalysis | null> {
    try {
      const report = await this.reportRepository.findOne({ where: { id } });
      return report || null;
    } catch (error) {
      console.error('\x1b[31m[Analytics@1.0.0]\x1b[0m Error fetching report:', error);
      throw error;
    }
  }

  async deleteReportAnalysis(id: number): Promise<boolean> {
    try {
      const result = await this.reportRepository.delete(id);
      const isDeleted = (result.affected ?? 0) > 0;
      console.log(
        `\x1b[36m[Analytics@1.0.0]\x1b[0m Report ${id} ${isDeleted ? 'deleted' : 'not found'}`
      );
      return isDeleted;
    } catch (error) {
      console.error('\x1b[31m[Analytics@1.0.0]\x1b[0m Error deleting report:', error);
      throw error;
    }
  }

  async updateReportAnalysisExportDate(id: number): Promise<boolean> {
    try {
      const result = await this.reportRepository.update(id, {
        exportedAt: new Date(),
      });
      const isUpdated = result.affected !== undefined && result.affected > 0;
      console.log(
        `\x1b[36m[Analytics@1.0.0]\x1b[0m Report ${id} export date ${isUpdated ? 'updated' : 'not found'}`
      );
      return isUpdated;
    } catch (error) {
      console.error('\x1b[31m[Analytics@1.0.0]\x1b[0m Error updating report:', error);
      throw error;
    }
  }

  async calculateSalesAnalysis(
    analysisType: 'monthly' | 'weekly' | 'yearly' | 'total',
    period?: string
  ): Promise<{
    totalSales: number;
    totalRevenue: number;
    period?: string;
  }> {
    try {
      const query = this.receiptRepository.createQueryBuilder('receipt');

      if (analysisType === 'monthly' && period) {
        const [year, month] = period.split('-');
        const startDate = new Date(`${year}-${month}-01`);
        const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
        query.where('receipt.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate });
      } else if (analysisType === 'yearly' && period) {
        const startDate = new Date(`${period}-01-01`);
        const endDate = new Date(parseInt(period) + 1, 0, 0);
        query.where('receipt.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate });
      } else if (analysisType === 'weekly' && period) {
        const date = new Date(period);
        const day = date.getDay();
        const diff = date.getDate() - day;
        const startDate = new Date(date.setDate(diff));
        const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        query.where('receipt.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate });
      }

      const receipts = await query.getMany();

      const totalSales = receipts.length;
      const totalRevenue = receipts.reduce((sum, receipt) => {
        return sum + parseFloat(receipt.totalAmount.toString());
      }, 0);

      return {
        totalSales,
        totalRevenue,
        period,
      };
    } catch (error) {
      console.error('\x1b[31m[Analytics@1.0.0]\x1b[0m Error calculating sales analysis:', error);
      throw error;
    }
  }

  async calculateTopTenPerfumes(): Promise<
    Array<{
      perfumeId: number;
      perfumeName: string;
      quantity: number;
      revenue: number;
    }>
  > {
    try {
      const receipts = await this.receiptRepository.find();

      const perfumeMap = new Map<
        number,
        {
          perfumeId: number;
          perfumeName: string;
          quantity: number;
          revenue: number;
        }
      >();

      receipts.forEach((receipt) => {
        receipt.perfumeDetails.forEach((detail) => {
          if (perfumeMap.has(detail.perfumeId)) {
            const existing = perfumeMap.get(detail.perfumeId)!;
            existing.quantity += detail.quantity;
            existing.revenue += detail.totalPrice;
          } else {
            perfumeMap.set(detail.perfumeId, {
              perfumeId: detail.perfumeId,
              perfumeName: detail.perfumeName,
              quantity: detail.quantity,
              revenue: detail.totalPrice,
            });
          }
        });
      });

      const topTen = Array.from(perfumeMap.values())
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10);

      return topTen;
    } catch (error) {
      console.error('\x1b[31m[Analytics@1.0.0]\x1b[0m Error calculating top ten perfumes:', error);
      throw error;
    }
  }

  async calculateSalesTrend(days: number = 30): Promise<
    Array<{
      date: string;
      sales: number;
      revenue: number;
    }>
  > {
    try {
      const receipts = await this.receiptRepository.find();

      const trendMap = new Map<
        string,
        {
          date: string;
          sales: number;
          revenue: number;
        }
      >();

      receipts.forEach((receipt) => {
        const dateStr = receipt.createdAt.toISOString().split('T')[0];
        if (trendMap.has(dateStr)) {
          const existing = trendMap.get(dateStr)!;
          existing.sales += 1;
          existing.revenue += parseFloat(receipt.totalAmount.toString());
        } else {
          trendMap.set(dateStr, {
            date: dateStr,
            sales: 1,
            revenue: parseFloat(receipt.totalAmount.toString()),
          });
        }
      });

      const trend = Array.from(trendMap.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      return trend.slice(-days);
    } catch (error) {
      console.error('\x1b[31m[Analytics@1.0.0]\x1b[0m Error calculating sales trend:', error);
      throw error;
    }
  }

  // ========================
  // Performance Simulation Methods
  // ========================

  async runSimulation(request: SimulationRequestDTO): Promise<PerformanceResult[]> {
    try {
      if (!this.performanceRepository) {
        throw new Error('Performance repository not initialized');
      }

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

        // Generate detailed report
        result.analysisConclusions = this.generateAnalysisConclusions(result.metrics, algorithm);
        result.detailedReport = this.generateDetailedReport(result);

        const savedResult = await this.performanceRepository.save(result);
        results.push(savedResult);

        console.log(
          `\x1b[36m[Analytics@1.0.0]\x1b[0m Performance simulation for ${algorithm} completed with ID: ${savedResult.id}`
        );
      }

      return results;
    } catch (error) {
      console.error('\x1b[31m[Analytics@1.0.0]\x1b[0m Error running simulation:', error);
      throw error;
    }
  }

  async getPerformanceResults(limit?: number): Promise<PerformanceResult[]> {
    try {
      if (!this.performanceRepository) {
        throw new Error('Performance repository not initialized');
      }

      const query = this.performanceRepository
        .createQueryBuilder('performance')
        .orderBy('performance.createdAt', 'DESC');

      if (limit) {
        query.limit(limit);
      }

      const results = await query.getMany();
      return results;
    } catch (error) {
      console.error('\x1b[31m[Analytics@1.0.0]\x1b[0m Error fetching performance results:', error);
      throw error;
    }
  }

  async getPerformanceResultById(id: number): Promise<PerformanceResult | null> {
    try {
      if (!this.performanceRepository) {
        throw new Error('Performance repository not initialized');
      }

      const result = await this.performanceRepository.findOne({ where: { id } });
      return result || null;
    } catch (error) {
      console.error('\x1b[31m[Analytics@1.0.0]\x1b[0m Error fetching performance result:', error);
      throw error;
    }
  }

  async deletePerformanceResult(id: number): Promise<boolean> {
    try {
      if (!this.performanceRepository) {
        throw new Error('Performance repository not initialized');
      }

      const result = await this.performanceRepository.delete(id);
      const isDeleted = (result.affected ?? 0) > 0;

      console.log(
        `\x1b[36m[Analytics@1.0.0]\x1b[0m Performance result ${id} ${isDeleted ? 'deleted' : 'not found'}`
      );

      return isDeleted;
    } catch (error) {
      console.error('\x1b[31m[Analytics@1.0.0]\x1b[0m Error deleting performance result:', error);
      throw error;
    }
  }

  async compareAlgorithms(simulationId: number): Promise<SimulationComparisonDTO | null> {
    try {
      if (!this.performanceRepository) {
        throw new Error('Performance repository not initialized');
      }

      const results = await this.performanceRepository.find({
        where: { simulationName: (await this.performanceRepository.findOne({ where: { id: simulationId } }))?.simulationName }
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
      console.error('\x1b[31m[Analytics@1.0.0]\x1b[0m Error comparing algorithms:', error);
      throw error;
    }
  }

  async updatePerformanceResultExportDate(id: number): Promise<boolean> {
    try {
      if (!this.performanceRepository) {
        throw new Error('Performance repository not initialized');
      }

      const result = await this.performanceRepository.update(id, {
        exportedAt: new Date()
      });

      const isUpdated = result.affected !== undefined && result.affected > 0;

      console.log(
        `\x1b[36m[Analytics@1.0.0]\x1b[0m Performance result ${id} export date ${isUpdated ? 'updated' : 'not found'}`
      );

      return isUpdated;
    } catch (error) {
      console.error('\x1b[31m[Analytics@1.0.0]\x1b[0m Error updating performance result:', error);
      throw error;
    }
  }

  // ========================
  // Private Helper Methods
  // ========================

  private simulateAlgorithmExecution(
    algorithm: LogisticsAlgorithm
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
