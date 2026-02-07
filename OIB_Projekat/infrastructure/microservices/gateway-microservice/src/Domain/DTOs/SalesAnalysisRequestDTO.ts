export interface SalesAnalysisRequestDTO {
  analysisType: "monthly" | "weekly" | "yearly" | "total";
  period?: string;
}
