import { Request, Response, Router } from 'express';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFDocument = require('pdfkit');
import { IAnalyticsService } from '../../Domain/services/IAnalyticsService';
import { ILogService } from '../../../../log-microservice/src/Domain/services/ILogService';
import { IValidatorService } from '../../Domain/services/IValidatorService';
import { CreateReceiptDTO, CreateReportAnalysisDTO, SalesAnalysisRequestDTO } from '../../Domain/DTOs';
import { ReportAnalysis } from '../../Domain/models/ReportAnalysis';

export class AnalyticsController {
  private router: Router;
  private analyticsService: IAnalyticsService;
  private logerService: ILogService;
  private validatorService: IValidatorService;

  constructor(analyticsService: IAnalyticsService, logerService: ILogService, validatorService: IValidatorService) {
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
    this.router.get('/reports/:id/pdf', this.getReportAnalysisPdf.bind(this));
    this.router.delete('/reports/:id', this.deleteReportAnalysis.bind(this));
    this.router.patch('/reports/:id/export', this.updateReportExportDate.bind(this));

    // Analysis routes
    this.router.post('/analysis/sales', this.calculateSalesAnalysis.bind(this));
    this.router.get('/analysis/top-ten', this.getTopTenPerfumes.bind(this));
    this.router.get('/analysis/trend', this.getSalesTrend.bind(this));
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
        await this.logerService.log('Receipts request missing userId', 'WARNING');
        res.status(400).json({ success: false, message: 'User ID is required' });
        return;
      }

      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;

      const receipts = await this.analyticsService.getReceipts(parseInt(userId as string), start, end);

      await this.logerService.log(`Receipts fetched for user ${userId}`);

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
        await this.logerService.log('Receipt detail request missing id', 'WARNING');
        res.status(400).json({ success: false, message: 'Receipt ID is required' });
        return;
      }

      const receipt = await this.analyticsService.getReceiptById(parseInt(id as string));

      if (!receipt) {
        await this.logerService.log(`Receipt ${id} not found`, 'WARNING');
        res.status(404).json({ success: false, message: 'Receipt not found' });
        return;
      }

      await this.logerService.log(`Receipt ${id} fetched successfully`);
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
        await this.logerService.log('Receipt delete request missing id', 'WARNING');
        res.status(400).json({ success: false, message: 'Receipt ID is required' });
        return;
      }

      const isDeleted = await this.analyticsService.deleteReceipt(parseInt(id as string));

      if (!isDeleted) {
        await this.logerService.log(`Receipt ${id} not found`, 'WARNING');
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

      await this.logerService.log('Report analysis list fetched');
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
        await this.logerService.log('Report detail request missing id', 'WARNING');
        res.status(400).json({ success: false, message: 'Report ID is required' });
        return;
      }

      const report = await this.analyticsService.getReportAnalysisById(parseInt(id as string));

      if (!report) {
        await this.logerService.log(`Report ${id} not found`, 'WARNING');
        res.status(404).json({ success: false, message: 'Report not found' });
        return;
      }

      await this.logerService.log(`Report ${id} fetched successfully`);
      res.status(200).json({ success: true, data: report });
    } catch (error) {
      await this.logerService.log(`Error fetching report: ${error}`);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  /**
   * GET /api/v1/reports/:id/pdf
   * Returns report PDF data
   */
  private async getReportAnalysisPdf(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        await this.logerService.log('Report PDF request missing id', 'WARNING');
        res.status(400).json({ success: false, message: 'Report ID is required' });
        return;
      }

      const report = await this.analyticsService.getReportAnalysisById(parseInt(id as string));

      if (!report) {
        res.status(404).json({ success: false, message: 'Report not found' });
        return;
      }

      await this.logerService.log(`Report PDF requested for ID: ${id}`);

      const hasPdfData = typeof report.pdfData === 'string' && report.pdfData.trim().length > 0;
      const buffer = hasPdfData
        ? Buffer.from(report.pdfData, 'base64')
        : await this.generateReportPdf(report);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="sales-report-${id}.pdf"`);
      res.status(200).send(buffer);
    } catch (error) {
      await this.logerService.log(`Error fetching report PDF: ${error}`);
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
        await this.logerService.log('Report delete request missing id', 'WARNING');
        res.status(400).json({ success: false, message: 'Report ID is required' });
        return;
      }

      const isDeleted = await this.analyticsService.deleteReportAnalysis(parseInt(id as string));

      if (!isDeleted) {
        await this.logerService.log(`Report ${id} not found`, 'WARNING');
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
        await this.logerService.log('Report export request missing id', 'WARNING');
        res.status(400).json({ success: false, message: 'Report ID is required' });
        return;
      }

      const isUpdated = await this.analyticsService.updateReportAnalysisExportDate(parseInt(id as string));

      if (!isUpdated) {
        await this.logerService.log(`Report ${id} not found`, 'WARNING');
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
        await this.logerService.log('Sales analysis request missing analysisType', 'WARNING');
        res.status(400).json({ success: false, message: 'Analysis type is required' });
        return;
      }

      if (analysisType !== 'total') {
        if (!period) {
          await this.logerService.log('Sales analysis request missing period', 'WARNING');
          res.status(400).json({ success: false, message: 'Period is required for this analysis type' });
          return;
        }

        if (!this.isValidPeriod(analysisType, period)) {
          await this.logerService.log('Sales analysis request has invalid period format', 'WARNING');
          res.status(400).json({ success: false, message: 'Invalid period format' });
          return;
        }
      }

      const salesData = await this.analyticsService.calculateSalesAnalysis(analysisType, period);
      const topTen = await this.analyticsService.calculateTopTenPerfumes();
      const trend = await this.analyticsService.calculateSalesTrend();

      const reportPayload: CreateReportAnalysisDTO = {
        reportName: this.buildReportName(analysisType, period),
        analysisType,
        salesData,
        topTenPerfumes: topTen.items,
        salesTrend: trend,
        generatedBy: null,
      };

      const reportValidation = this.validatorService.validateReportAnalysis(reportPayload);
      if (!reportValidation.isValid) {
        await this.logerService.log(`Auto report validation failed: ${reportValidation.errors.join(', ')}`, 'WARNING');
        res.status(400).json({ success: false, message: 'Validation failed', errors: reportValidation.errors });
        return;
      }

      await this.analyticsService.createReportAnalysis(reportPayload);

      await this.logerService.log(`Sales analysis calculated (${analysisType})`);

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
      const salesData = await this.analyticsService.calculateSalesAnalysis('total');
      const topTen = await this.analyticsService.calculateTopTenPerfumes();
      const trend = await this.analyticsService.calculateSalesTrend();

      const reportPayload: CreateReportAnalysisDTO = {
        reportName: 'Auto Top Ten Analysis',
        analysisType: 'total',
        salesData,
        topTenPerfumes: topTen.items,
        salesTrend: trend,
        generatedBy: null,
      };

      const reportValidation = this.validatorService.validateReportAnalysis(reportPayload);
      if (!reportValidation.isValid) {
        await this.logerService.log(`Auto report validation failed: ${reportValidation.errors.join(', ')}`, 'WARNING');
        res.status(400).json({ success: false, message: 'Validation failed', errors: reportValidation.errors });
        return;
      }

      await this.analyticsService.createReportAnalysis(reportPayload);

      await this.logerService.log('Top ten perfumes calculated');
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

      const salesData = await this.analyticsService.calculateSalesAnalysis('total');
      const topTen = await this.analyticsService.calculateTopTenPerfumes();
      const trend = await this.analyticsService.calculateSalesTrend(daysLimit);

      const reportPayload: CreateReportAnalysisDTO = {
        reportName: `Auto Sales Trend (${daysLimit} days)`,
        analysisType: 'total',
        salesData,
        topTenPerfumes: topTen.items,
        salesTrend: trend,
        generatedBy: null,
      };

      const reportValidation = this.validatorService.validateReportAnalysis(reportPayload);
      if (!reportValidation.isValid) {
        await this.logerService.log(`Auto report validation failed: ${reportValidation.errors.join(', ')}`, 'WARNING');
        res.status(400).json({ success: false, message: 'Validation failed', errors: reportValidation.errors });
        return;
      }

      await this.analyticsService.createReportAnalysis(reportPayload);

      await this.logerService.log(`Sales trend calculated for last ${daysLimit} days`);
      res.status(200).json({ success: true, data: trend });
    } catch (error) {
      await this.logerService.log(`Error fetching sales trend: ${error}`);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  public getRouter(): Router {
    return this.router;
  }

  private isValidPeriod(analysisType: 'monthly' | 'weekly' | 'yearly' | 'total', period: string): boolean {
    if (analysisType === 'monthly') {
      return /^\d{4}-\d{2}$/.test(period);
    }

    if (analysisType === 'yearly') {
      return /^\d{4}$/.test(period);
    }

    if (analysisType === 'weekly') {
      return /^\d{4}-\d{2}-\d{2}$/.test(period) && !Number.isNaN(new Date(period).getTime());
    }

    return true;
  }

  private buildReportName(analysisType: 'monthly' | 'weekly' | 'yearly' | 'total', period?: string): string {
    if (analysisType === 'total') {
      return 'Auto Sales Analysis - Total';
    }

    return `Auto Sales Analysis - ${analysisType}${period ? ` (${period})` : ''}`;
  }

  private async generateReportPdf(report: ReportAnalysis): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(20).font('Helvetica-Bold').text('Sales Analysis Report', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica').text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();

      doc.fontSize(14).font('Helvetica-Bold').text('Report Details');
      doc.fontSize(11).font('Helvetica');
      doc.text(`Report Name: ${report.reportName}`);
      doc.text(`Analysis Type: ${report.analysisType}`);
      doc.text(`Created: ${report.createdAt.toISOString()}`);
      doc.moveDown();

      doc.fontSize(14).font('Helvetica-Bold').text('Sales Summary');
      doc.fontSize(11).font('Helvetica');
      doc.text(`Total Sales: ${report.salesData?.totalSales ?? 0}`);
      doc.text(`Total Revenue: ${report.salesData?.totalRevenue ?? 0}`);
      if (report.salesData?.period) {
        doc.text(`Period: ${report.salesData.period}`);
      }
      doc.moveDown();

      if (report.topTenPerfumes && report.topTenPerfumes.length > 0) {
        doc.fontSize(14).font('Helvetica-Bold').text('Top Perfumes');
        doc.fontSize(11).font('Helvetica');
        report.topTenPerfumes.forEach((item, index) => {
          doc.text(
            `${index + 1}. ${item.perfumeName} (ID: ${item.perfumeId}) - Qty: ${item.quantity}, Revenue: ${item.revenue}`
          );
        });
        doc.moveDown();
      }

      if (report.salesTrend && report.salesTrend.length > 0) {
        doc.fontSize(14).font('Helvetica-Bold').text('Sales Trend');
        doc.fontSize(11).font('Helvetica');
        report.salesTrend.forEach((trend) => {
          doc.text(`${trend.date}: Sales ${trend.sales}, Revenue ${trend.revenue}`);
        });
        doc.moveDown();
      }

      doc.fontSize(8).font('Helvetica').text(
        "This report was generated by the Analytics Microservice - O'Seignel De Or Perfumery",
        50,
        doc.page.height - 30,
        { align: 'center' }
      );

      doc.end();
    });
  }
}
