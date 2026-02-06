import { Request, Response, Router } from "express";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFDocument = require("pdfkit");
import { IPerformanceService } from "../../Domain/services/IPerformanceService";
import { ILogService } from "../../../../log-microservice/src/Domain/services/ILogService";
import { IValidatorService } from "../../Domain/services/IValidatorService";
import { SimulationRequestDTO } from "../../Domain/DTOs";

export class PerformanceController {
  private router: Router;
  private performanceService: IPerformanceService;
  private logerService: ILogService;
  private validatorService: IValidatorService;

  constructor(performanceService: IPerformanceService, logerService: ILogService, validatorService: IValidatorService) {
    this.router = Router();
    this.performanceService = performanceService;
    this.logerService = logerService;
    this.validatorService = validatorService;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Performance simulation routes
    this.router.post('/simulate', this.runSimulation.bind(this));
    this.router.get('/', this.getPerformanceResults.bind(this));
    this.router.get('/:id', this.getPerformanceResultById.bind(this));
    this.router.delete('/:id', this.deletePerformanceResult.bind(this));
    this.router.get('/:id/compare', this.compareAlgorithms.bind(this));
    this.router.patch('/:id/export', this.updatePerformanceExportDate.bind(this));
    this.router.get('/:id/pdf', this.generatePerformancePDF.bind(this));
  }

  /**
   * POST /api/v1/simulate
   * Runs performance simulation for specified algorithms
   */
  private async runSimulation(req: Request, res: Response): Promise<void> {
    try {
      await this.logerService.log('Performance simulation request received');

      const simulationData: SimulationRequestDTO = req.body;

      // Validate simulation request
      const validation = this.validatorService.validateSimulationRequest(simulationData);
      if (!validation.isValid) {
        await this.logerService.log(`Simulation validation failed: ${validation.errors.join(', ')}`);
        res.status(400).json({ success: false, message: 'Validation failed', errors: validation.errors });
        return;
      }

      const results = await this.performanceService.runSimulation(simulationData);

      await this.logerService.log('Performance simulation completed successfully');
      res.status(201).json({ success: true, data: results });
    } catch (error) {
      await this.logerService.log(`Error running simulation: ${error}`);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  /**
   * GET /api/v1/
   * Gets all performance results
   */
  private async getPerformanceResults(req: Request, res: Response): Promise<void> {
    try {
      const { limit } = req.query;
      const resultLimit = limit ? parseInt(limit as string) : undefined;

      const results = await this.performanceService.getPerformanceResults(resultLimit);

      res.status(200).json({ success: true, data: results });
    } catch (error) {
      await this.logerService.log(`Error fetching performance results: ${error}`);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  /**
   * GET /api/v1/:id
   * Gets a specific performance result by ID
   */
  private async getPerformanceResultById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ success: false, message: 'Performance result ID is required' });
        return;
      }

      const result = await this.performanceService.getPerformanceResultById(parseInt(id as string));

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
   * DELETE /api/v1/:id
   * Deletes a performance result
   */
  private async deletePerformanceResult(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ success: false, message: 'Performance result ID is required' });
        return;
      }

      const isDeleted = await this.performanceService.deletePerformanceResult(parseInt(id as string));

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
   * GET /api/v1/:id/compare
   * Compares algorithms from a simulation
   */
  private async compareAlgorithms(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ success: false, message: 'Performance result ID is required' });
        return;
      }

      const comparison = await this.performanceService.compareAlgorithms(parseInt(id as string));

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
   * PATCH /api/v1/:id/export
   * Updates performance result export date
   */
  private async updatePerformanceExportDate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ success: false, message: 'Performance result ID is required' });
        return;
      }

      const isUpdated = await this.performanceService.updatePerformanceResultExportDate(parseInt(id as string));

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
   * GET /api/v1/:id/pdf
   * Generates PDF for performance result
   */
  private async generatePerformancePDF(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ success: false, message: 'Performance result ID is required' });
        return;
      }

      const performanceResult = await this.performanceService.getPerformanceResultById(parseInt(id as string));

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
        'This report was automatically generated by the Performance Microservice - O\'Seignel De Or Perfumery',
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
