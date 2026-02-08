import { CreateReportAnalysisDTO } from "../../models/analytics/CreateReportAnalysisDTO";
import { ReportAnalysisDTO } from "../../models/analytics/ReportAnalysisDTO";
import { SalesAnalysisRequestDTO } from "../../models/analytics/SalesAnalysisRequestDTO";
import { SalesAnalysisResponseDTO } from "../../models/analytics/SalesAnalysisResponseDTO";
import { SalesTrendDTO } from "../../models/analytics/SalesTrendDTO";
import { TopTenSummaryDTO } from "../../models/analytics/TopTenSummaryDTO";

export interface IAnalyticsAPI {
  getReports(limit?: number): Promise<ReportAnalysisDTO[]>;
  getReportById(id: number): Promise<ReportAnalysisDTO>;
  createReport(data: CreateReportAnalysisDTO): Promise<ReportAnalysisDTO>;
  deleteReport(id: number): Promise<void>;
  exportReport(id: number): Promise<void>;
  calculateSalesAnalysis(data: SalesAnalysisRequestDTO): Promise<SalesAnalysisResponseDTO>;
  getTopTen(): Promise<TopTenSummaryDTO>;
  getSalesTrend(days?: number): Promise<SalesTrendDTO[]>;
}
