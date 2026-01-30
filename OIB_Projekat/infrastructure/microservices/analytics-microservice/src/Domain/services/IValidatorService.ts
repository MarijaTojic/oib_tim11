import { CreateReceiptDTO, CreateReportAnalysisDTO } from '../DTOs';

export interface IValidatorService {
  validateReceipt(receipt: CreateReceiptDTO): { isValid: boolean; errors: string[] };
  validateReportAnalysis(report: CreateReportAnalysisDTO): { isValid: boolean; errors: string[] };
}
