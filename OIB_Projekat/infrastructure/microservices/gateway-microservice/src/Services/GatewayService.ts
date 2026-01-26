import axios, { AxiosInstance } from "axios";
import { IGatewayService } from "../Domain/services/IGatewayService";
import { LoginUserDTO } from "../Domain/DTOs/LoginUserDTO";
import { RegistrationUserDTO } from "../Domain/DTOs/RegistrationUserDTO";
import { AuthResponseType } from "../Domain/types/AuthResponse";
import { UserDTO } from "../Domain/DTOs/UserDTO";
import { PerfumeDTO } from "../Domain/DTOs/PerfumeDTO";
import { PlantDTO } from "../Domain/DTOs/PlantDTO";
import { PackagingDTO } from "../Domain/DTOs/PackagingDTO";
import { StorageDTO } from "../Domain/DTOs/StorageDTO";
import { ReceiptDTO } from "../Domain/DTOs/ReceiptDTO";
import { LogDTO } from "../Domain/DTOs/LogDTO";

export class GatewayService implements IGatewayService {
  private readonly authClient: AxiosInstance;
  private readonly userClient: AxiosInstance;
  private readonly productionClient: AxiosInstance;
  private readonly processingClient: AxiosInstance;
  private readonly packagingClient: AxiosInstance;
  private readonly storageClient: AxiosInstance;
  private readonly salesClient: AxiosInstance;
  private readonly logClient: AxiosInstance;
  private readonly analyticsClient: AxiosInstance;

  constructor() {
    const authBaseURL = process.env.AUTH_SERVICE_API;
    const userBaseURL = process.env.USER_SERVICE_API;
    const productionBaseURL = process.env.PRODUCTION_SERVICE_API;
    const processingBaseURL = process.env.PROCESSING_SERVICE_API;
    const packagingBaseURL = process.env.PACKAGING_SERVICE_API;
    const storageBaseURL = process.env.STORAGE_SERVICE_API;
    const salesBaseURL = process.env.SALES_SERVICE_API;
    const logBaseURL = process.env.LOG_SERVICE_API;
    const analyticsBaseURL = process.env.ANALYTICS_SERVICE_API;

    this.authClient = axios.create({
      baseURL: authBaseURL,
      headers: { "Content-Type": "application/json" },
      timeout: 5000,
    });

    this.userClient = axios.create({
      baseURL: userBaseURL,
      headers: { "Content-Type": "application/json" },
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

    this.packagingClient = axios.create({
      baseURL: packagingBaseURL,
      headers: { "Content-Type": "application/json" },
      timeout: 5000,
    });

    this.storageClient = axios.create({
      baseURL: storageBaseURL,
      headers: { "Content-Type": "application/json" },
      timeout: 5000,
    });

    this.salesClient = axios.create({
      baseURL: salesBaseURL,
      headers: { "Content-Type": "application/json" },
      timeout: 5000,
    });

    this.logClient = axios.create({
      baseURL: logBaseURL,
      headers: { "Content-Type": "application/json" },
      timeout: 5000,
    });

    this.analyticsClient = axios.create({
      baseURL: analyticsBaseURL,
      headers: { "Content-Type": "application/json" },
      timeout: 5000,
    });
  }

  // Auth microservice
  async login(data: LoginUserDTO): Promise<AuthResponseType> {
    try {
      const response = await this.authClient.post<AuthResponseType>("/auth/login", data);
      return response.data;
    } catch {
      return { authenificated: false };
    }
  }

  async register(data: RegistrationUserDTO): Promise<AuthResponseType> {
    try {
      const response = await this.authClient.post<AuthResponseType>("/auth/register", data);
      return response.data;
    } catch {
      return { authenificated: false };
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

  async harvestPlants(plantId: number, quantity: number): Promise<PlantDTO[]> {
    const response = await this.productionClient.post<PlantDTO[]>("/plants/harvest", {
      plantId,
      quantity,
    });
    return response.data;
  }

  async adjustAromaticOilStrength(plantId: number, percentage: number): Promise<PlantDTO> {
    const response = await this.productionClient.patch<PlantDTO>(`/plants/${plantId}/oil-strength`, {
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
    const response = await this.processingClient.post<PerfumeDTO[]>("/processing/start", {
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

  // Packaging microservice
  async getAllPackages(): Promise<PackagingDTO[]> {
    const response = await this.packagingClient.get<PackagingDTO[]>("/packages");
    return response.data;
  }

  async getPackageById(id: number): Promise<PackagingDTO> {
    const response = await this.packagingClient.get<PackagingDTO>(`/packages/${id}`);
    return response.data;
  }

  async packPerfumes(perfumeIds: number[], storageId: number): Promise<PackagingDTO> {
    const response = await this.packagingClient.post<PackagingDTO>("/packages/pack", {
      perfumeIds,
      storageId,
    });
    return response.data;
  }

  async sendPackageToStorage(packageId: number): Promise<PackagingDTO> {
    const response = await this.packagingClient.post<PackagingDTO>(`/packages/${packageId}/send`);
    return response.data;
  }

  // Storage microservice
  async getAllStorages(): Promise<StorageDTO[]> {
    const response = await this.storageClient.get<StorageDTO[]>("/storages");
    return response.data;
  }

  async getStorageById(id: number): Promise<StorageDTO> {
    const response = await this.storageClient.get<StorageDTO>(`/storages/${id}`);
    return response.data;
  }

  async sendPackagesFromStorage(quantity: number): Promise<PackagingDTO[]> {
    const response = await this.storageClient.post<PackagingDTO[]>("/storages/send-packages", {
      quantity,
    });
    return response.data;
  }

  // Sales microservice
  async getAllReceipts(): Promise<ReceiptDTO[]> {
    const response = await this.salesClient.get<ReceiptDTO[]>("/receipts");
    return response.data;
  }

  async getReceiptById(id: number): Promise<ReceiptDTO> {
    const response = await this.salesClient.get<ReceiptDTO>(`/receipts/${id}`);
    return response.data;
  }

  async createSale(saleData: ReceiptDTO): Promise<ReceiptDTO> {
    const response = await this.salesClient.post<ReceiptDTO>("/sales", saleData);
    return response.data;
  }

  // Log microservice
  async getAllLogs(): Promise<LogDTO[]> {
    const response = await this.logClient.get<LogDTO[]>("/logs");
    return response.data;
  }

  async getLogById(id: number): Promise<LogDTO> {
    const response = await this.logClient.get<LogDTO>(`/logs/${id}`);
    return response.data;
  }

  async createLog(logData: LogDTO): Promise<LogDTO> {
    const response = await this.logClient.post<LogDTO>("/logs", logData);
    return response.data;
  }

  // Analytics microservice
  async getSalesAnalytics(params?: any): Promise<any> {
    const response = await this.analyticsClient.get("/analytics/sales", { params });
    return response.data;
  }

  async getPerformanceAnalytics(): Promise<any> {
    const response = await this.analyticsClient.get("/analytics/performance");
    return response.data;
  }
}
