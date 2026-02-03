import { Request, Response, Router } from 'express';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFDocument = require('pdfkit');
import { IAnalyticsService } from '../../Domain/services/IAnalyticsService';
import { ILogerService } from '../../Domain/services/ILogerService';
import { IValidatorService } from '../../Domain/services/IValidatorService';
import { CreateReceiptDTO, CreateReportAnalysisDTO, SalesAnalysisRequestDTO } from '../../Domain/DTOs';

export class AnalyticsController {
  private router: Router;
  private analyticsService: IAnalyticsService;
  private logerService: ILogerService;
  private validatorService: IValidatorService;

  constructor(analyticsService: IAnalyticsService, logerService: ILogerService, validatorService: IValidatorService) {
    this.router = Router();
    this.analyticsService = analyticsService;
    this.logerService = logerService;
    this.validatorService = validatorService;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Receipt routes
    this.router.post('/receipts', this.createReceipt.bind(this));
    this.router.get('/receipts/:userId', this.getReceipts.bind(this));
    this.router.get('/receipts/detail/:id', this.getReceiptById.bind(this));
    this.router.delete('/receipts/:id', this.deleteReceipt.bind(this));

    // Report Analysis routes
    this.router.post('/reports', this.createReportAnalysis.bind(this));
    this.router.get('/reports', this.getReportAnalysisList.bind(this));
    this.router.get('/reports/:id', this.getReportAnalysisById.bind(this));
    this.router.delete('/reports/:id', this.deleteReportAnalysis.bind(this));
    this.router.patch('/reports/:id/export', this.updateReportExportDate.bind(this));

    // Analysis routes
    this.router.post('/analysis/sales', this.calculateSalesAnalysis.bind(this));
    this.router.get('/analysis/top-ten', this.getTopTenPerfumes.bind(this));
    this.router.get('/analysis/trend', this.getSalesTrend.bind(this));

    // Performance routes
    this.router.post('/performance/simulate', this.runSimulation.bind(this));
    this.router.get('/performance', this.getPerformanceResults.bind(this));
    this.router.get('/performance/:id', this.getPerformanceResultById.bind(this));
    this.router.delete('/performance/:id', this.deletePerformanceResult.bind(this));
    this.router.get('/performance/:id/compare', this.compareAlgorithms.bind(this));
    this.router.patch('/performance/:id/export', this.updatePerformanceExportDate.bind(this));
    this.router.get('/performance/:id/pdf', this.generatePerformancePDF.bind(this));
  }

  /**
   * POST /api/v1/receipts
   * Creates a new receipt
   */
  private async createReceipt(req: Request, res: Response): Promise<void> {
    try {
      await this.logerService.log('Receipt creation request received');

      const receiptData: CreateReceiptDTO = req.body;

      // Validate receipt
      const validation = this.validatorService.validateReceipt(receiptData);
      if (!validation.isValid) {
        await this.logerService.log(`Receipt validation failed: ${validation.errors.join(', ')}`);
        res.status(400).json({ success: false, message: 'Validation failed', errors: validation.errors });
        return;
      }

      const newReceipt = await this.analyticsService.createReceipt(receiptData);

      await this.logerService.log(`Receipt created successfully with ID: ${newReceipt.id}`);
      res.status(201).json({ success: true, data: newReceipt });
    } catch (error) {
      await this.logerService.log(`Error creating receipt: ${error}`);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  /**
   * GET /api/v1/receipts/:userId
   * Gets receipts for a specific user
   */
  private async getReceipts(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { startDate, endDate } = req.query;

      if (!userId) {
        res.status(400).json({ success: false, message: 'User ID is required' });
        return;
      }

      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;

      const receipts = await this.analyticsService.getReceipts(parseInt(userId as string), start, end);

      res.status(200).json({ success: true, data: receipts });
    } catch (error) {
      await this.logerService.log(`Error fetching receipts: ${error}`);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  /**
   * GET /api/v1/receipts/detail/:id
   * Gets a specific receipt by ID
   */
  private async getReceiptById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ success: false, message: 'Receipt ID is required' });
        return;
      }

      const receipt = await this.analyticsService.getReceiptById(parseInt(id as string));

      if (!receipt) {
        res.status(404).json({ success: false, message: 'Receipt not found' });
        return;
      }

      res.status(200).json({ success: true, data: receipt });
    } catch (error) {
      await this.logerService.log(`Error fetching receipt: ${error}`);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  /**
   * DELETE /api/v1/receipts/:id
   * Deletes a receipt
   */
  private async deleteReceipt(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ success: false, message: 'Receipt ID is required' });
        return;
      }

      const isDeleted = await this.analyticsService.deleteReceipt(parseInt(id as string));

      if (!isDeleted) {
        res.status(404).json({ success: false, message: 'Receipt not found' });
        return;
      }

      await this.logerService.log(`Receipt ${id} deleted successfully`);
      res.status(200).json({ success: true, message: 'Receipt deleted' });
    } catch (error) {
      await this.logerService.log(`Error deleting receipt: ${error}`);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  /**
   * POST /api/v1/reports
   * Creates a new analysis report
   */
  private async createReportAnalysis(req: Request, res: Response): Promise<void> {
    try {
      await this.logerService.log('Report creation request received');

      const reportData: CreateReportAnalysisDTO = req.body;

      // Validate report
      const validation = this.validatorService.validateReportAnalysis(reportData);
      if (!validation.isValid) {
        await this.logerService.log(`Report validation failed: ${validation.errors.join(', ')}`);
        res.status(400).json({ success: false, message: 'Validation failed', errors: validation.errors });
        return;
      }

      const newReport = await this.analyticsService.createReportAnalysis(reportData);

      await this.logerService.log(`Report created successfully with ID: ${newReport.id}`);
      res.status(201).json({ success: true, data: newReport });
    } catch (error) {
      await this.logerService.log(`Error creating report: ${error}`);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  /**
   * GET /api/v1/reports
   * Gets all analysis reports
   */
  private async getReportAnalysisList(req: Request, res: Response): Promise<void> {
    try {
      const { limit } = req.query;
      const reportLimit = limit ? parseInt(limit as string) : undefined;

      const reports = await this.analyticsService.getReportAnalysisList(reportLimit);

      res.status(200).json({ success: true, data: reports });
    } catch (error) {
      await this.logerService.log(`Error fetching reports: ${error}`);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  /**
   * GET /api/v1/reports/:id
   * Gets a specific report by ID
   */
  private async getReportAnalysisById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ success: false, message: 'Report ID is required' });
        return;
      }

      const report = await this.analyticsService.getReportAnalysisById(parseInt(id as string));

      if (!report) {
        res.status(404).json({ success: false, message: 'Report not found' });
        return;
      }

      res.status(200).json({ success: true, data: report });
    } catch (error) {
      await this.logerService.log(`Error fetching report: ${error}`);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  /**
   * DELETE /api/v1/reports/:id
   * Deletes a report
   */
  private async deleteReportAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ success: false, message: 'Report ID is required' });
        return;
      }

      const isDeleted = await this.analyticsService.deleteReportAnalysis(parseInt(id as string));

      if (!isDeleted) {
        res.status(404).json({ success: false, message: 'Report not found' });
        return;
      }

      await this.logerService.log(`Report ${id} deleted successfully`);
      res.status(200).json({ success: true, message: 'Report deleted' });
    } catch (error) {
      await this.logerService.log(`Error deleting report: ${error}`);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  /**
   * PATCH /api/v1/reports/:id/export
   * Updates report export date
   */
  private async updateReportExportDate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ success: false, message: 'Report ID is required' });
        return;
      }

      const isUpdated = await this.analyticsService.updateReportAnalysisExportDate(parseInt(id as string));

      if (!isUpdated) {
        res.status(404).json({ success: false, message: 'Report not found' });
        return;
      }

      await this.logerService.log(`Report ${id} export date updated`);
      res.status(200).json({ success: true, message: 'Report export date updated' });
    } catch (error) {
      await this.logerService.log(`Error updating report: ${error}`);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  /**
   * POST /api/v1/analysis/sales
   * Calculates sales analysis
   */
  private async calculateSalesAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const { analysisType, period }: SalesAnalysisRequestDTO = req.body;

      if (!analysisType) {
        res.status(400).json({ success: false, message: 'Analysis type is required' });
        return;
      }

      const salesData = await this.analyticsService.calculateSalesAnalysis(analysisType, period);

      res.status(200).json({ success: true, data: salesData });
    } catch (error) {
      await this.logerService.log(`Error calculating sales analysis: ${error}`);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  /**
   * GET /api/v1/analysis/top-ten
   * Gets top 10 perfumes
   */
  private async getTopTenPerfumes(_req: Request, res: Response): Promise<void> {
    try {
      const topTen = await this.analyticsService.calculateTopTenPerfumes();

      res.status(200).json({ success: true, data: topTen });
    } catch (error) {
      await this.logerService.log(`Error fetching top ten perfumes: ${error}`);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  /**
   * GET /api/v1/analysis/trend
   * Gets sales trend
   */
  private async getSalesTrend(req: Request, res: Response): Promise<void> {
    try {
      const { days } = req.query;
      const daysLimit = days ? parseInt(days as string) : 30;

      const trend = await this.analyticsService.calculateSalesTrend(daysLimit);

      res.status(200).json({ success: true, data: trend });
    } catch (error) {
      await this.logerService.log(`Error fetching sales trend: ${error}`);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }



  // =========================
  // Performance handlers
  // =========================
  /**
   * POST /api/v1/performance/simulate
   * Runs performance simulation for specified algorithms
   */
  private async runSimulation(req: Request, res: Response): Promise<void> {
    try {
      await this.logerService.log('Performance simulation request received');

      const simulationData = req.body as any;

      // Validate simulation request
      if (!simulationData.algorithms || !Array.isArray(simulationData.algorithms) || simulationData.algorithms.length === 0) {
        res.status(400).json({ success: false, message: 'At least one algorithm must be specified' });
        return;
      }

      if (!simulationData.simulationName) {
        res.status(400).json({ success: false, message: 'Simulation name is required' });
        return;
      }

      const results = await this.analyticsService.runSimulation(simulationData);

      await this.logerService.log(`Performance simulation completed successfully`);
      res.status(201).json({ success: true, data: results });
    } catch (error) {
      await this.logerService.log(`Error running simulation: ${error}`);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  /**
   * GET /api/v1/performance
   * Gets all performance results
   */
  private async getPerformanceResults(req: Request, res: Response): Promise<void> {
    try {
      const { limit } = req.query;
      const resultLimit = limit ? parseInt(limit as string) : undefined;

      const results = await this.analyticsService.getPerformanceResults(resultLimit);

      res.status(200).json({ success: true, data: results });
    } catch (error) {
      await this.logerService.log(`Error fetching performance results: ${error}`);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  /**
   * GET /api/v1/performance/:id
   * Gets a specific performance result by ID
   */
  private async getPerformanceResultById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ success: false, message: 'Performance result ID is required' });
        return;
      }

      const result = await this.analyticsService.getPerformanceResultById(parseInt(id as string));

      if (!result) {
        res.status(404).json({ success: false, message: 'Performance result not found' });
        return;
      }

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      await this.logerService.log(`Error fetching performance result: ${error}`);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  /**
   * DELETE /api/v1/performance/:id
   * Deletes a performance result
   */
  private async deletePerformanceResult(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ success: false, message: 'Performance result ID is required' });
        return;
      }

      const isDeleted = await this.analyticsService.deletePerformanceResult(parseInt(id as string));

      if (!isDeleted) {
        res.status(404).json({ success: false, message: 'Performance result not found' });
        return;
      }

      await this.logerService.log(`Performance result ${id} deleted successfully`);
      res.status(200).json({ success: true, message: 'Performance result deleted' });
    } catch (error) {
      await this.logerService.log(`Error deleting performance result: ${error}`);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  /**
   * GET /api/v1/performance/:id/compare
   * Compares algorithms from a simulation
   */
  private async compareAlgorithms(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ success: false, message: 'Performance result ID is required' });
        return;
      }

      const comparison = await this.analyticsService.compareAlgorithms(parseInt(id as string));

      if (!comparison) {
        res.status(404).json({ success: false, message: 'No comparison data found' });
        return;
      }

      res.status(200).json({ success: true, data: comparison });
    } catch (error) {
      await this.logerService.log(`Error comparing algorithms: ${error}`);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  /**
   * PATCH /api/v1/performance/:id/export
   * Updates performance result export date
   */
  private async updatePerformanceExportDate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ success: false, message: 'Performance result ID is required' });
        return;
      }

      const isUpdated = await this.analyticsService.updatePerformanceResultExportDate(parseInt(id as string));

      if (!isUpdated) {
        res.status(404).json({ success: false, message: 'Performance result not found' });
        return;
      }

      await this.logerService.log(`Performance result ${id} export date updated successfully`);
      res.status(200).json({ success: true, message: 'Export date updated' });
    } catch (error) {
      await this.logerService.log(`Error updating performance result export date: ${error}`);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  /**
   * GET /api/v1/performance/:id/pdf
   * Generates PDF for performance result
   */
  private async generatePerformancePDF(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ success: false, message: 'Performance result ID is required' });
        return;
      }

      const performanceResult = await this.analyticsService.getPerformanceResultById(parseInt(id as string));

      if (!performanceResult) {
        res.status(404).json({ success: false, message: 'Performance result not found' });
        return;
      }

      // Create PDF document
      const doc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="performance-report-${id}.pdf"`);

      doc.pipe(res);

      // Title
      doc.fontSize(20).font('Helvetica-Bold').text('Performance Analysis Report', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica').text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();

      // Basic Information
      doc.fontSize(14).font('Helvetica-Bold').text('Simulation Details');
      doc.fontSize(11).font('Helvetica');
      doc.text(`Simulation Name: ${performanceResult.simulationName}`);
      doc.text(`Algorithm: ${performanceResult.algorithm.toUpperCase()}`);
      doc.text(`Number of Simulations: ${performanceResult.numberOfSimulations}`);
      doc.text(`Particles: ${performanceResult.numberOfParticles}`);
      doc.text(`Iterations: ${performanceResult.numberOfIterations}`);
      doc.moveDown();

      // Performance Metrics
      doc.fontSize(14).font('Helvetica-Bold').text('Performance Metrics');
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);

      doc.fontSize(11).font('Helvetica');
      doc.text(`Execution Time: ${performanceResult.metrics.executionTime.toFixed(2)} ms`);
      doc.text(`Distance Covered: ${performanceResult.metrics.distanceCovered.toFixed(2)} km`);
      doc.text(`Cost Optimization: ${performanceResult.metrics.costOptimization.toFixed(2)}%`);
      doc.text(`Path Efficiency: ${performanceResult.metrics.pathEfficiency.toFixed(2)}%`);
      doc.text(`Memory Usage: ${performanceResult.metrics.memoryUsage.toFixed(2)} MB`);
      doc.text(`Success Rate: ${performanceResult.metrics.successRate.toFixed(2)}%`);
      doc.moveDown();

      // Analysis Conclusions
      if (performanceResult.analysisConclusions) {
        doc.fontSize(14).font('Helvetica-Bold').text('Analysis & Conclusions');
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica').text(performanceResult.analysisConclusions, { align: 'left' });
        doc.moveDown();
      }

      // Footer
      doc.fontSize(8).font('Helvetica').text(
        'This report was automatically generated by the Analytics Microservice - O\'Seignel De Or Perfumery',
        50,
        doc.page.height - 30,
        { align: 'center' }
      );

      doc.end();
      await this.logerService.log(`PDF generated successfully for performance result ${id}`);
    } catch (error) {
      await this.logerService.log(`Error generating PDF: ${error}`);
      res.status(500).json({ success: false, message: 'Error generating PDF' });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}
