import axios, { AxiosInstance } from "axios";
import { ApiResponse } from "../../types/ApiResponse";
import { PerformanceResultDTO } from "../../models/performance/PerformanceResultDTO";
import { SimulationRequestDTO } from "../../models/performance/SimulationRequestDTO";
import { IPerformanceAPI } from "./IPerformanceAPI";

const unwrap = <T>(response: ApiResponse<T> | T): T => {
  if (typeof response === "object" && response !== null && "data" in response) {
    return (response as ApiResponse<T>).data;
  }
  return response as T;
};

export class PerformanceAPI implements IPerformanceAPI {
  private readonly axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: import.meta.env.VITE_GATEWAY_URL,
      headers: { "Content-Type": "application/json" },
      timeout: 10000,
    });
  }

  async runSimulation(token: string, data: SimulationRequestDTO): Promise<PerformanceResultDTO[]> {
    const response = await this.axiosInstance.post<ApiResponse<PerformanceResultDTO[]>>(
      "/performance/simulate",
      data,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return unwrap(response.data);
  }

  async getResults(token: string, limit?: number): Promise<PerformanceResultDTO[]> {
    const response = await this.axiosInstance.get<ApiResponse<PerformanceResultDTO[]>>("/performance", {
      params: limit ? { limit } : undefined,
      headers: { Authorization: `Bearer ${token}` },
    });
    return unwrap(response.data);
  }

  async getResultById(token: string, id: number): Promise<PerformanceResultDTO> {
    const response = await this.axiosInstance.get<ApiResponse<PerformanceResultDTO>>(`/performance/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return unwrap(response.data);
  }

  async deleteResult(token: string, id: number): Promise<void> {
    await this.axiosInstance.delete(`/performance/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async exportResult(token: string, id: number): Promise<void> {
    await this.axiosInstance.patch(`/performance/${id}/export`, null, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async downloadPdf(token: string, id: number): Promise<Blob> {
    const response = await this.axiosInstance.get<ArrayBuffer>(`/performance/${id}/pdf`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: "arraybuffer",
    });
    return new Blob([response.data], { type: "application/pdf" });
  }
}
