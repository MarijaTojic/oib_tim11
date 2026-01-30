import { TopPerfumeDTO } from './TopPerfumeDTO';
import { SalesTrendDTO } from './SalesTrendDTO';
import { SalesAnalysisResponseDTO } from './SalesAnalysisResponseDTO';

export interface ReportAnalysisDTO {
  id: number;
  reportName: string;
  analysisType: 'monthly' | 'weekly' | 'yearly' | 'total';
  salesData: SalesAnalysisResponseDTO;
  topTenPerfumes: TopPerfumeDTO[];
  salesTrend: SalesTrendDTO[];
  pdfData: string;
  generatedBy: string | null;
  createdAt: Date;
  exportedAt: Date | null;
}
