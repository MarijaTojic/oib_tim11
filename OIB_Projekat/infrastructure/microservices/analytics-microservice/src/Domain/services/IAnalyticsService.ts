import { Receipt } from '../models/Receipt';
import { ReportAnalysis } from '../models/ReportAnalysis';
import { 
  CreateReceiptDTO, 
  CreateReportAnalysisDTO, 
  SalesAnalysisResponseDTO, 
  TopPerfumeDTO, 
  SalesTrendDTO 
} from '../DTOs';

export interface IAnalyticsService {
  createReceipt(receipt: CreateReceiptDTO): Promise<Receipt>;
  getReceipts(userId: number, startDate?: Date, endDate?: Date): Promise<Receipt[]>;
  getReceiptById(id: number): Promise<Receipt | null>;
  deleteReceipt(id: number): Promise<boolean>;

  createReportAnalysis(report: CreateReportAnalysisDTO): Promise<ReportAnalysis>;
  getReportAnalysisList(limit?: number): Promise<ReportAnalysis[]>;
  getReportAnalysisById(id: number): Promise<ReportAnalysis | null>;
  deleteReportAnalysis(id: number): Promise<boolean>;
  updateReportAnalysisExportDate(id: number): Promise<boolean>;

  calculateSalesAnalysis(
    analysisType: 'monthly' | 'weekly' | 'yearly' | 'total',
    period?: string
  ): Promise<SalesAnalysisResponseDTO>;

  calculateTopTenPerfumes(): Promise<TopPerfumeDTO[]>;

  calculateSalesTrend(days?: number): Promise<SalesTrendDTO[]>;
}
