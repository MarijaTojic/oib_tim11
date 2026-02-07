import { CreateReportAnalysisDTO } from "../../models/analytics/CreateReportAnalysisDTO";
import { ReportAnalysisDTO } from "../../models/analytics/ReportAnalysisDTO";
import { SalesAnalysisRequestDTO } from "../../models/analytics/SalesAnalysisRequestDTO";
import { SalesAnalysisResponseDTO } from "../../models/analytics/SalesAnalysisResponseDTO";
import { SalesTrendDTO } from "../../models/analytics/SalesTrendDTO";
import { TopTenSummaryDTO } from "../../models/analytics/TopTenSummaryDTO";

export interface IAnalyticsAPI {
  getReports(token: string, limit?: number): Promise<ReportAnalysisDTO[]>;
  getReportById(token: string, id: number): Promise<ReportAnalysisDTO>;
  createReport(token: string, data: CreateReportAnalysisDTO): Promise<ReportAnalysisDTO>;
  deleteReport(token: string, id: number): Promise<void>;
  exportReport(token: string, id: number): Promise<void>;
  calculateSalesAnalysis(token: string, data: SalesAnalysisRequestDTO): Promise<SalesAnalysisResponseDTO>;
  getTopTen(token: string): Promise<TopTenSummaryDTO>;
  getSalesTrend(token: string, days?: number): Promise<SalesTrendDTO[]>;
}
