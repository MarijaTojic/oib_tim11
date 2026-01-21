import { Request, Response, Router } from 'express';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFDocument = require('pdfkit');
import { IAnalyticsService } from '../../Domain/services/IAnalyticsService';
import { ILogerService } from '../../Domain/services/ILogerService';
import { Receipt } from '../../Domain/models/Receipt';
import { ReportAnalysis } from '../../Domain/models/ReportAnalysis';

export class AnalyticsController {
  private router: Router;
  private analyticsService: IAnalyticsService;
  private logerService: ILogerService;

  constructor(analyticsService: IAnalyticsService, logerService: ILogerService) {
    this.router = Router();
    this.analyticsService = analyticsService;
    this.logerService = logerService;
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

    // PDF Export routes
    this.router.get('/reports/:id/pdf', this.generateReportPDF.bind(this));
  }

  /**
   * POST /api/v1/receipts
   * Creates a new receipt
   */
  private async createReceipt(req: Request, res: Response): Promise<void> {
    try {
      await this.logerService.log('Receipt creation request received');

      const receipt: Partial<Receipt> = req.body;

      if (!receipt.saleType || !receipt.paymentType || !receipt.perfumeDetails || !receipt.totalAmount) {
        res.status(400).json({ success: false, message: 'Missing required fields' });
        return;
      }

      const newReceipt = await this.analyticsService.createReceipt(receipt);

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

      const receipts = await this.analyticsService.getReceipts(parseInt(userId), start, end);

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

      const receipt = await this.analyticsService.getReceiptById(parseInt(id));

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

      const isDeleted = await this.analyticsService.deleteReceipt(parseInt(id));

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

      const report: Partial<ReportAnalysis> = req.body;

      if (!report.reportName || !report.analysisType || !report.salesData) {
        res.status(400).json({ success: false, message: 'Missing required fields' });
        return;
      }

      const newReport = await this.analyticsService.createReportAnalysis(report);

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

      const report = await this.analyticsService.getReportAnalysisById(parseInt(id));

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

      const isDeleted = await this.analyticsService.deleteReportAnalysis(parseInt(id));

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

      const isUpdated = await this.analyticsService.updateReportAnalysisExportDate(parseInt(id));

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
      const { analysisType, period } = req.body;

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

  /**
   * GET /api/v1/reports/:id/pdf
   * Generates PDF for a report
   */
  private async generateReportPDF(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ success: false, message: 'Report ID is required' });
        return;
      }

      const report = await this.analyticsService.getReportAnalysisById(parseInt(id));

      if (!report) {
        res.status(404).json({ success: false, message: 'Report not found' });
        return;
      }

      const doc = new PDFDocument();

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="report_${id}.pdf"`);

      doc.pipe(res);

      doc.fontSize(16).text(`Sales Analysis Report`, { underline: true });
      doc.moveDown();
      doc.fontSize(12).text(`Report Name: ${report.reportName}`);
      doc.text(`Analysis Type: ${report.analysisType}`);
      doc.text(`Created At: ${report.createdAt}`);
      doc.moveDown();

      doc.fontSize(14).text('Sales Data:', { underline: true });
      doc.fontSize(11);
      doc.text(`Total Sales: ${report.salesData.totalSales}`);
      doc.text(`Total Revenue: $${report.salesData.totalRevenue}`);

      if (report.topTenPerfumes && report.topTenPerfumes.length > 0) {
        doc.moveDown();
        doc.fontSize(14).text('Top 10 Perfumes:', { underline: true });
        doc.fontSize(11);
        report.topTenPerfumes.forEach((perfume, index) => {
          doc.text(`${index + 1}. ${perfume.perfumeName} - Qty: ${perfume.quantity}, Revenue: $${perfume.revenue}`);
        });
      }

      doc.end();
      await this.logerService.log(`PDF generated for report ${id}`);
    } catch (error) {
      await this.logerService.log(`Error generating PDF: ${error}`);
      res.status(500).json({ success: false, message: 'Error generating PDF' });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}
