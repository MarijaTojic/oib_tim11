import axios, { AxiosInstance } from "axios";
import { ApiResponse } from "../../types/ApiResponse";
import { CreateReportAnalysisDTO } from "../../models/analytics/CreateReportAnalysisDTO";
import { ReportAnalysisDTO } from "../../models/analytics/ReportAnalysisDTO";
import { SalesAnalysisRequestDTO } from "../../models/analytics/SalesAnalysisRequestDTO";
import { SalesAnalysisResponseDTO } from "../../models/analytics/SalesAnalysisResponseDTO";
import { SalesTrendDTO } from "../../models/analytics/SalesTrendDTO";
import { TopTenSummaryDTO } from "../../models/analytics/TopTenSummaryDTO";
import { IAnalyticsAPI } from "./IAnalyticsAPI";

const unwrap = <T>(response: ApiResponse<T> | T): T => {
  if (typeof response === "object" && response !== null && "data" in response) {
    return (response as ApiResponse<T>).data;
  }
  return response as T;
};

export class AnalyticsAPI implements IAnalyticsAPI {
  private readonly axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: import.meta.env.VITE_GATEWAY_URL,
      headers: { "Content-Type": "application/json" },
      timeout: 8000,
    });
  }

  async getReports(limit?: number): Promise<ReportAnalysisDTO[]> {
    const token = localStorage.getItem("authToken");
    const response = await this.axiosInstance.get<ApiResponse<ReportAnalysisDTO[]>>("/analytics/reports", {
      params: limit ? { limit } : undefined,
      headers: { Authorization: `Bearer ${token}` },
    });
    return unwrap(response.data);
  }

  async getReportById(id: number): Promise<ReportAnalysisDTO> {
    const token = localStorage.getItem("authToken");
    const response = await this.axiosInstance.get<ApiResponse<ReportAnalysisDTO>>(`/analytics/reports/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return unwrap(response.data);
  }

  async createReport( data: CreateReportAnalysisDTO): Promise<ReportAnalysisDTO> {
    const token = localStorage.getItem("authToken");
    const response = await this.axiosInstance.post<ApiResponse<ReportAnalysisDTO>>("/analytics/reports", data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return unwrap(response.data);
  }

  async deleteReport(id: number): Promise<void> {
    const token = localStorage.getItem("authToken");
    await this.axiosInstance.delete(`/analytics/reports/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async exportReport(id: number): Promise<void> {
    const token = localStorage.getItem("authToken");
    await this.axiosInstance.patch(`/analytics/reports/${id}/export`, null, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async calculateSalesAnalysis(
    data: SalesAnalysisRequestDTO
  ): Promise<SalesAnalysisResponseDTO> {
    const token = localStorage.getItem("authToken");
    const response = await this.axiosInstance.post<ApiResponse<SalesAnalysisResponseDTO>>(
      "/analytics/analysis/sales",
      data,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return unwrap(response.data);
  }

  async getTopTen(): Promise<TopTenSummaryDTO> {
    const token = localStorage.getItem("authToken");
    const response = await this.axiosInstance.get<ApiResponse<TopTenSummaryDTO>>("/analytics/analysis/top-ten", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return unwrap(response.data);
  }

  async getSalesTrend(days?: number): Promise<SalesTrendDTO[]> {
    const token = localStorage.getItem("authToken");
    const response = await this.axiosInstance.get<ApiResponse<SalesTrendDTO[]>>("/analytics/analysis/trend", {
      params: days ? { days } : undefined,
      headers: { Authorization: `Bearer ${token}` },
    });
    return unwrap(response.data);
  }
}
