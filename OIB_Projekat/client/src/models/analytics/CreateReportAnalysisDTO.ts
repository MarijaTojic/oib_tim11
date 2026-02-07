import { SalesAnalysisResponseDTO } from "./SalesAnalysisResponseDTO";
import { SalesTrendDTO } from "./SalesTrendDTO";
import { TopPerfumeDTO } from "./TopPerfumeDTO";

export interface CreateReportAnalysisDTO {
  reportName: string;
  analysisType: "monthly" | "weekly" | "yearly" | "total";
  salesData: SalesAnalysisResponseDTO;
  topTenPerfumes: TopPerfumeDTO[];
  salesTrend: SalesTrendDTO[];
  pdfData: string;
  generatedBy?: string | null;
}
