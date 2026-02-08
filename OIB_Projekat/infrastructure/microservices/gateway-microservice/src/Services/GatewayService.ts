import axios, { AxiosInstance } from "axios";
import { IGatewayService } from "../Domain/services/IGatewayService";
import { LoginUserDTO } from "../Domain/DTOs/LoginUserDTO";
import { RegistrationUserDTO } from "../Domain/DTOs/RegistrationUserDTO";
import { AuthResponseType } from "../Domain/types/AuthResponse";
import { UserDTO } from "../Domain/DTOs/UserDTO";
import { PerfumeDTO } from "../Domain/DTOs/PerfumeDTO";
import { PlantDTO } from "../Domain/DTOs/PlantDTO";
import { SimulationRequestDTO } from "../Domain/DTOs/SimulationRequestDTO";
import { PerformanceResultDTO } from "../Domain/DTOs/PerformanceResultDTO";
import { PackagingDTO } from "../Domain/DTOs/PackagingDTO";
import { CreateReportAnalysisDTO } from "../Domain/DTOs/CreateReportAnalysisDTO";
import { ReportAnalysisDTO } from "../Domain/DTOs/ReportAnalysisDTO";
import { SalesAnalysisRequestDTO } from "../Domain/DTOs/SalesAnalysisRequestDTO";
import { SalesAnalysisResponseDTO } from "../Domain/DTOs/SalesAnalysisResponseDTO";
import { SalesTrendDTO } from "../Domain/DTOs/SalesTrendDTO";
import { TopTenSummaryDTO } from "../Domain/DTOs/TopTenSummaryDTO";
import { RouteHealthDTO, RouteInfoDTO, RouteStatus } from "../Domain/DTOs/RouteInfoDTO";
import { CreateReceiptDTO } from "../Domain/DTOs/CreateReceiptDTO";
import { ReceiptDTO } from "../Domain/DTOs/ReceiptDTO";
import { LogDTO } from "../Domain/DTOs/LogDTO";

export class GatewayService implements IGatewayService {
  private readonly authClient: AxiosInstance;
  private readonly userClient: AxiosInstance;
  private readonly productionClient: AxiosInstance;
  private readonly processingClient: AxiosInstance;
  private readonly analyticsClient: AxiosInstance;
  private readonly performanceClient: AxiosInstance;
  private readonly salesClient: AxiosInstance;
  private readonly packagingClient: AxiosInstance;
  private readonly logClient: AxiosInstance;

  private unwrapResponse<T>(payload: any): T {
    if (payload && typeof payload === "object" && "data" in payload) {
      return payload.data as T;
    }
    return payload as T;
  }

  private extractAuthError(err: unknown): AuthResponseType {
    if (axios.isAxiosError(err)) {
      const data = err.response?.data as AuthResponseType | undefined;
      if (data && typeof data === "object") {
        return data;
      }

      const status = err.response?.status;
      if (status === 403) {
        return { success: false, message: "Forbidden" };
      }
    }

    return { success: false, message: "Auth service unavailable" };
  }


  constructor() {
    const authBaseURL = process.env.AUTH_SERVICE_API;
    const userBaseURL = process.env.USER_SERVICE_API;
    const productionBaseURL = process.env.PRODUCTION_SERVICE_API;
    const processingBaseURL = process.env.PROCESSING_SERVICE_API;
    const analyticsBaseURL = process.env.ANALYTICS_SERVICE_API;
    const performanceBaseURL = process.env.PERFORMANCE_SERVICE_API;
    const salesBaseURL = process.env.SALES_SERVICE_API;
    const packagingBaseURL = process.env.PACKAGING_SERVICE_API;
    const logBaseURL = process.env.LOG_SERVICE_API;
    const authInternalKey = process.env.AUTH_INTERNAL_KEY;
    const userInternalKey = process.env.USER_INTERNAL_KEY;
    const performanceInternalKey = process.env.PERFORMANCE_INTERNAL_KEY;
    const analyticsInternalKey = process.env.ANALYTICS_INTERNAL_KEY;
    const logInternalKey = process.env.LOG_INTERNAL_KEY;


    this.authClient = axios.create({
      baseURL: authBaseURL,
      headers: {
        "Content-Type": "application/json",
        ...(authInternalKey ? { "x-internal-key": authInternalKey } : {}),
      },
      timeout: 5000,
    });

    this.userClient = axios.create({
      baseURL: userBaseURL,
      headers: {
        "Content-Type": "application/json",
        ...(userInternalKey ? { "x-internal-key": userInternalKey } : {}),
      },
      timeout: 5000,
    });

    this.productionClient = axios.create({
      baseURL: productionBaseURL,
      headers: { "Content-Type": "application/json" },
      timeout: 5000,
    });

    this.processingClient = axios.create({
      baseURL: processingBaseURL,
      headers: { "Content-Type": "application/json" },
      timeout: 5000,
    });

    this.analyticsClient = axios.create({
      baseURL: analyticsBaseURL,
      headers: {
        "Content-Type": "application/json",
        ...(analyticsInternalKey ? { "x-internal-key": analyticsInternalKey } : {}),
      },
      timeout: 5000,
    });

    this.performanceClient = axios.create({
      baseURL: performanceBaseURL,
      headers: {
        "Content-Type": "application/json",
        ...(performanceInternalKey ? { "x-internal-key": performanceInternalKey } : {}),
      },
      timeout: 5000,
    });

    this.salesClient = axios.create({
      baseURL: salesBaseURL,
      headers: { "Content-Type": "application/json" },
      timeout: 5000,
    });

    this.packagingClient = axios.create({
      baseURL: packagingBaseURL,
      headers: { "Content-Type": "application/json" },
      timeout: 5000,
    });
    this.logClient = axios.create({
      baseURL: logBaseURL,
      headers: {
        "Content-Type": "application/json",
        ...(logInternalKey ? { "x-internal-key": logInternalKey } : {}),
      },
      timeout: 5000,
    });
  }
  
  // Auth microservice
  async login(data: LoginUserDTO): Promise<AuthResponseType> {
    try {
      const response = await this.authClient.post<AuthResponseType>("/auth/login", data);
      return response.data;
    } catch (err) {
      return this.extractAuthError(err);
    }
  }

  async register(data: RegistrationUserDTO): Promise<AuthResponseType> {
    try {
      const response = await this.authClient.post<AuthResponseType>("/auth/register", data);
      return response.data;
    } catch (err) {
      return this.extractAuthError(err);
    }
  }

  // User microservice
  async getAllUsers(): Promise<UserDTO[]> {
    const response = await this.userClient.get<UserDTO[]>("/users");
    return response.data;
  }

  async getUserById(id: number): Promise<UserDTO> {
    const response = await this.userClient.get<UserDTO>(`/users/${id}`);
    return response.data;
  }

  async updateUser(id: number, data: Partial<UserDTO>): Promise<UserDTO> {
    const response = await this.userClient.put<UserDTO>(`/users/${id}`, data);
    return response.data;
  }

  async deleteUser(id: number): Promise<void> {
    await this.userClient.delete(`/users/${id}`);
  }

  // Production microservice (Plants)
  async getAllPlants(): Promise<PlantDTO[]> {
    const response = await this.productionClient.get<PlantDTO[]>("/plants");
    return response.data;
  }

  async getPlantById(id: number): Promise<PlantDTO> {
    const response = await this.productionClient.get<PlantDTO>(`/plants/${id}`);
    return response.data;
  }

  async plantNewPlant(data: PlantDTO): Promise<PlantDTO> {
    const response = await this.productionClient.post<PlantDTO>("/plants", data);
    return response.data;
  }

  async harvestPlants(commonName: number, quantity: number): Promise<PlantDTO[]> {
    const response = await this.productionClient.post<PlantDTO[]>("/plants/harvest", {
      commonName,
      quantity,
    });
    return response.data;
  }

  async adjustAromaticOilStrength(plantId: number, percentage: number): Promise<PlantDTO> {
    const response = await this.productionClient.patch<PlantDTO>(`/plants/${plantId}/aromatic`, {
      percentage,
    });
    return response.data;
  }

  // Processing microservice (Perfumes)
  async getAllPerfumes(): Promise<PerfumeDTO[]> {
    const response = await this.processingClient.get<PerfumeDTO[]>("/perfumes");
    return response.data;
  }

  async getPerfumeById(id: number): Promise<PerfumeDTO> {
    const response = await this.processingClient.get<PerfumeDTO>(`/perfumes/${id}`);
    return response.data;
  }

  async startProcessing(plantId: number, quantity: number, volume: number, perfumeType: string): Promise<PerfumeDTO[]> {
    const response = await this.processingClient.post<PerfumeDTO[]>("/processing", {
      plantId,
      quantity,
      volume,
      perfumeType,
    });
    return response.data;
  }

  async getPerfumesByType(type: string, quantity: number): Promise<PerfumeDTO[]> {
    const response = await this.processingClient.get<PerfumeDTO[]>("/perfumes/by-type", {
      params: { type, quantity },
    });
    return response.data;
  }

  // Performance microservice methods
  async runPerformanceSimulation(data: SimulationRequestDTO): Promise<PerformanceResultDTO[]> {
    try {
      const response = await this.performanceClient.post<PerformanceResultDTO[]>("/simulate", data);
      return this.unwrapResponse<PerformanceResultDTO[]>(response.data);
    } catch {
      return [];
    }
  }

  async getPerformanceResults(limit?: number): Promise<PerformanceResultDTO[]> {
    const response = await this.performanceClient.get<PerformanceResultDTO[]>("/", {
      params: limit ? { limit } : {},
    });
    return this.unwrapResponse<PerformanceResultDTO[]>(response.data);
  }

  async getPerformanceResultById(id: number): Promise<PerformanceResultDTO> {
    const response = await this.performanceClient.get<PerformanceResultDTO>(`/${id}`);
    return this.unwrapResponse<PerformanceResultDTO>(response.data);
  }

  async deletePerformanceResult(id: number): Promise<void> {
    await this.performanceClient.delete(`/${id}`);
  }

  async comparePerformanceAlgorithms(id: number): Promise<any> {
    const response = await this.performanceClient.get(`/${id}/compare`);
    return this.unwrapResponse<any>(response.data);
  }

  async exportPerformanceResult(id: number): Promise<void> {
    await this.performanceClient.patch(`/${id}/export`);
  }

  async getPerformancePdf(id: number): Promise<{ data: ArrayBuffer; contentType: string }> {
    const response = await this.performanceClient.get<ArrayBuffer>(`/${id}/pdf`, {
      responseType: "arraybuffer",
    });
    return {
      data: response.data,
      contentType: response.headers["content-type"] ?? "application/pdf",
    };
  }

  // Analytics microservice methods
  async createReportAnalysis(data: CreateReportAnalysisDTO): Promise<ReportAnalysisDTO> {
    const response = await this.analyticsClient.post<ReportAnalysisDTO>("/reports", data);
    return this.unwrapResponse<ReportAnalysisDTO>(response.data);
  }

  async getReportAnalysisList(limit?: number): Promise<ReportAnalysisDTO[]> {
    const response = await this.analyticsClient.get<ReportAnalysisDTO[]>("/reports", {
      params: limit ? { limit } : {},
    });
    return this.unwrapResponse<ReportAnalysisDTO[]>(response.data);
  }

  async getReportAnalysisById(id: number): Promise<ReportAnalysisDTO> {
    const response = await this.analyticsClient.get<ReportAnalysisDTO>(`/reports/${id}`);
    return this.unwrapResponse<ReportAnalysisDTO>(response.data);
  }

  async getReportAnalysisPdf(id: number): Promise<{ data: ArrayBuffer; contentType: string }> {
    const response = await this.analyticsClient.get<ArrayBuffer>(`/reports/${id}/pdf`, {
      responseType: "arraybuffer",
    });
    return {
      data: response.data,
      contentType: response.headers["content-type"] ?? "application/pdf",
    };
  }

  async deleteReportAnalysis(id: number): Promise<void> {
    await this.analyticsClient.delete(`/reports/${id}`);
  }

  async exportReportAnalysis(id: number): Promise<void> {
    await this.analyticsClient.patch(`/reports/${id}/export`);
  }

  async calculateSalesAnalysis(data: SalesAnalysisRequestDTO): Promise<SalesAnalysisResponseDTO> {
    const response = await this.analyticsClient.post<SalesAnalysisResponseDTO>("/analysis/sales", data);
    return this.unwrapResponse<SalesAnalysisResponseDTO>(response.data);
  }

  async getTopTenPerfumes(): Promise<TopTenSummaryDTO> {
    const response = await this.analyticsClient.get<TopTenSummaryDTO>("/analysis/top-ten");
    return this.unwrapResponse<TopTenSummaryDTO>(response.data);
  }

  async getSalesTrend(days?: number): Promise<SalesTrendDTO[]> {
    const response = await this.analyticsClient.get<SalesTrendDTO[]>("/analysis/trend", {
      params: days ? { days } : {},
    });
    return this.unwrapResponse<SalesTrendDTO[]>(response.data);
  }

  async createReceipt(data: CreateReceiptDTO): Promise<ReceiptDTO> {
    const response = await this.analyticsClient.post<ReceiptDTO>("/receipts", data);
    return this.unwrapResponse<ReceiptDTO>(response.data);
  }

  async getReceipts(userId: number, startDate?: string, endDate?: string): Promise<ReceiptDTO[]> {
    const response = await this.analyticsClient.get<ReceiptDTO[]>(`/receipts/${userId}`, {
      params: {
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
      },
    });
    return this.unwrapResponse<ReceiptDTO[]>(response.data);
  }

  async getReceiptById(id: number): Promise<ReceiptDTO> {
    const response = await this.analyticsClient.get<ReceiptDTO>(`/receipts/detail/${id}`);
    return this.unwrapResponse<ReceiptDTO>(response.data);
  }

  async deleteReceipt(id: number): Promise<void> {
    await this.analyticsClient.delete(`/receipts/${id}`);
  }

  // Routing (gateway) info
  getRouteMap(): RouteInfoDTO[] {
    const routes: RouteInfoDTO[] = [];
    const pushRoute = (service: string, baseUrl?: string) => {
      if (baseUrl) routes.push({ service, baseUrl });
    };

    pushRoute("Auth", process.env.AUTH_SERVICE_API);
    pushRoute("Users", process.env.USER_SERVICE_API);
    pushRoute("Production", process.env.PRODUCTION_SERVICE_API);
    pushRoute("Processing", process.env.PROCESSING_SERVICE_API);
    pushRoute("Analytics", process.env.ANALYTICS_SERVICE_API);
    pushRoute("Performance", process.env.PERFORMANCE_SERVICE_API);
    pushRoute("Sales", process.env.SALES_SERVICE_API);

    return routes;
  }

  async getRouteHealth(): Promise<RouteHealthDTO[]> {
    const routes = this.getRouteMap();
    const results = await Promise.all(
      routes.map(async (route) => {
        const start = Date.now();
        try {
          const response = await axios.get(route.baseUrl, {
            timeout: 1500,
            validateStatus: () => true,
          });
          const latencyMs = Date.now() - start;
          let status: RouteStatus = "unknown";
          if (response.status >= 200 && response.status < 400) status = "healthy";
          else if (response.status >= 400 && response.status < 500) status = "warning";
          else status = "down";

          return {
            ...route,
            status,
            latencyMs,
            checkedAt: new Date().toISOString(),
          };
        } catch {
          return {
            ...route,
            status: "down" as RouteStatus,
            latencyMs: null,
            checkedAt: new Date().toISOString(),
          };
        }
      })
    );

    return results;
  }

  // Log microservice
  async createLog(data: LogDTO): Promise<LogDTO> {
    const response = await this.logClient.post<{ log: LogDTO }>("/audit", data);
    return response.data.log;
  }

  async getAllLogs(): Promise<LogDTO[]> {
    const response = await this.logClient.get<{ logs: LogDTO[] }>("/audit");
    return response.data.logs;
  }

  async getLogById(id: number): Promise<LogDTO> {
    const response = await this.logClient.get<{ log: LogDTO }>(`/audit/${id}`);
    return response.data.log;
  }

  async updateLog(id: number, data: Partial<LogDTO>): Promise<LogDTO> {
    const response = await this.logClient.put<{ log: LogDTO }>(`/audit/${id}`,
      data
    );
    return response.data.log;
  }

  async deleteLog(id: number): Promise<void> {
    await this.logClient.delete(`/audit/${id}`);
  }

  // Sales microservice
  async getCatalogue(): Promise<any> {
    const response = await this.salesClient.get("/sales/catalogue");
    return response.data;
  }

  async sell(data: any): Promise<any> {
    const response = await this.salesClient.post("/sales/sell", data);
    return response.data;
  }

  async syncCatalogue(): Promise<any> {
    const response = await this.salesClient.post("/sales/catalogue/sync");
    return response.data;
  }


  //Packaging microservice
  async packagingPerfumes(perfumeType: string, quantity: number, senderAddress: string, storageID: number): Promise<PackagingDTO[]>{
    const response = await this.packagingClient.post<PackagingDTO[]>("/packaging", {
      perfumeType,
      quantity,
      senderAddress,
      storageID,
    });
    return response.data;
  }

  async sendAmbalage(storageID: number): Promise<PackagingDTO | null> {
      try {
          const response = await this.packagingClient.post<PackagingDTO>("/packaging/send", { storageID });
          return response.data;
      } catch (err) {
          console.error("sendAmbalage error:", err);
          return null;
      }
  }
}