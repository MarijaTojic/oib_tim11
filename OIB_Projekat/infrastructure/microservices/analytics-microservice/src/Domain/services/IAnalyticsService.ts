import { Receipt } from '../models/Receipt';
import { ReportAnalysis } from '../models/ReportAnalysis';

export interface IAnalyticsService {
  createReceipt(receipt: Partial<Receipt>): Promise<Receipt>;
  getReceipts(userId: number, startDate?: Date, endDate?: Date): Promise<Receipt[]>;
  getReceiptById(id: number): Promise<Receipt | null>;
  deleteReceipt(id: number): Promise<boolean>;

  createReportAnalysis(report: Partial<ReportAnalysis>): Promise<ReportAnalysis>;
  getReportAnalysisList(limit?: number): Promise<ReportAnalysis[]>;
  getReportAnalysisById(id: number): Promise<ReportAnalysis | null>;
  deleteReportAnalysis(id: number): Promise<boolean>;
  updateReportAnalysisExportDate(id: number): Promise<boolean>;

  calculateSalesAnalysis(
    analysisType: 'monthly' | 'weekly' | 'yearly' | 'total',
    period?: string
  ): Promise<{
    totalSales: number;
    totalRevenue: number;
    period?: string;
  }>;

  calculateTopTenPerfumes(): Promise<
    Array<{
      perfumeId: number;
      perfumeName: string;
      quantity: number;
      revenue: number;
    }>
  >;

  calculateSalesTrend(days?: number): Promise<
    Array<{
      date: string;
      sales: number;
      revenue: number;
    }>
  >;
}
