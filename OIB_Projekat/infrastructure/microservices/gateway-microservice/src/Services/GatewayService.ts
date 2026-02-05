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

export class GatewayService implements IGatewayService {
  private readonly authClient: AxiosInstance;
  private readonly userClient: AxiosInstance;
  private readonly productionClient: AxiosInstance;
  private readonly processingClient: AxiosInstance;
  private readonly analyticsClient: AxiosInstance;
  private readonly performanceClient: AxiosInstance;
  private readonly salesClient: AxiosInstance;


  constructor() {
    const authBaseURL = process.env.AUTH_SERVICE_API;
    const userBaseURL = process.env.USER_SERVICE_API;
    const productionBaseURL = process.env.PRODUCTION_SERVICE_API;
    const processingBaseURL = process.env.PROCESSING_SERVICE_API;
    const analyticsBaseURL = process.env.ANALYTICS_SERVICE_API;
    const performanceBaseURL = process.env.PERFORMANCE_SERVICE_API;
    const salesBaseURL = process.env.SALES_SERVICE_API;


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

    this.analyticsClient = axios.create({
      baseURL: analyticsBaseURL,
      headers: { "Content-Type": "application/json" },
      timeout: 5000,
    });

    this.performanceClient = axios.create({
      baseURL: performanceBaseURL,
      headers: { "Content-Type": "application/json" },
      timeout: 5000,
    });

    this.salesClient = axios.create({
      baseURL: salesBaseURL,
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
      return response.data;
    } catch {
      return [];
    }
  }

  async getPerformanceResults(limit?: number): Promise<PerformanceResultDTO[]> {
    const response = await this.performanceClient.get<PerformanceResultDTO[]>("/", {
      params: limit ? { limit } : {},
    });
    return response.data;
  }

  async getPerformanceResultById(id: number): Promise<PerformanceResultDTO> {
    const response = await this.performanceClient.get<PerformanceResultDTO>(`/${id}`);
    return response.data;
  }

  async deletePerformanceResult(id: number): Promise<void> {
    await this.performanceClient.delete(`/${id}`);
  }

  async comparePerformanceAlgorithms(id: number): Promise<any> {
    const response = await this.performanceClient.get(`/${id}/compare`);
    return response.data;
  }

  async exportPerformanceResult(id: number): Promise<void> {
    await this.performanceClient.patch(`/${id}/export`);
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
}
