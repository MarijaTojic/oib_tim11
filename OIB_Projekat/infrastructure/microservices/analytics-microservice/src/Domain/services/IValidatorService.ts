export interface IValidatorService {
  validateReceipt(receipt: any): { isValid: boolean; errors: string[] };
  validateReportAnalysis(report: any): { isValid: boolean; errors: string[] };
}
