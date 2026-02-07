import axios, { AxiosInstance } from "axios";
import { ILogService } from "../../../log-microservice/src/Domain/services/ILogService";
import { LogDTO } from "../../../log-microservice/src/Domain/DTOs/LogDTO";

export class HttpLogService implements ILogService {
  private readonly client: AxiosInstance;

  constructor() {
    const baseURL = process.env.GATEWAY_SERVICE_API;
    const internalKey = process.env.LOG_INTERNAL_KEY;

    if (!baseURL) {
      throw new Error("GATEWAY_SERVICE_API is not configured");
    }

    this.client = axios.create({
      baseURL,
      timeout: 4000,
      headers: {
        "Content-Type": "application/json",
        ...(internalKey ? { "x-internal-key": internalKey } : {}),
      },
    });
  }

  async log(message: string, type: "INFO" | "WARNING" | "ERROR" = "INFO"): Promise<boolean> {
    try {
      await this.client.post("/api/v1/logs", {
        logtype: type,
        description: message,
        datetime: new Date().toISOString(),
      });
      return true;
    } catch {
      return false;
    }
  }

  async createLog(log: LogDTO): Promise<LogDTO> {
    const response = await this.client.post<{ log: LogDTO }>("/api/v1/logs", log);
    return response.data.log;
  }

  async getAllLogs(): Promise<LogDTO[]> {
    const response = await this.client.get<{ logs: LogDTO[] }>("/api/v1/logs");
    return response.data.logs;
  }

  async getLogById(id: number): Promise<LogDTO | null> {
    const response = await this.client.get<{ log: LogDTO }>(`/api/v1/logs/${id}`);
    return response.data.log ?? null;
  }

  async updateLog(id: number, log: Partial<LogDTO>): Promise<LogDTO> {
    const response = await this.client.put<{ log: LogDTO }>(`/api/v1/logs/${id}`, log);
    return response.data.log;
  }

  async deleteLog(id: number): Promise<boolean> {
    const response = await this.client.delete<{ success: boolean }>(`/api/v1/logs/${id}`);
    return Boolean(response.data.success);
  }
}