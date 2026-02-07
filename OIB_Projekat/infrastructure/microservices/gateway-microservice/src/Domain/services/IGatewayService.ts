import { LoginUserDTO } from "../DTOs/LoginUserDTO";
import { RegistrationUserDTO } from "../DTOs/RegistrationUserDTO";
import { AuthResponseType } from "../types/AuthResponse";
import { UserDTO } from "../DTOs/UserDTO";
import { PlantDTO } from "../DTOs/PlantDTO";
import { PerfumeDTO } from "../DTOs/PerfumeDTO";
import { SimulationRequestDTO } from "../DTOs/SimulationRequestDTO";
import { PerformanceResultDTO } from "../DTOs/PerformanceResultDTO";
import { PackagingDTO } from "../DTOs/PackagingDTO";
import { CreateReportAnalysisDTO } from "../DTOs/CreateReportAnalysisDTO";
import { ReportAnalysisDTO } from "../DTOs/ReportAnalysisDTO";
import { SalesAnalysisRequestDTO } from "../DTOs/SalesAnalysisRequestDTO";
import { SalesAnalysisResponseDTO } from "../DTOs/SalesAnalysisResponseDTO";
import { SalesTrendDTO } from "../DTOs/SalesTrendDTO";
import { TopTenSummaryDTO } from "../DTOs/TopTenSummaryDTO";
import { RouteHealthDTO, RouteInfoDTO } from "../DTOs/RouteInfoDTO";
import { CreateReceiptDTO } from "../DTOs/CreateReceiptDTO";
import { ReceiptDTO } from "../DTOs/ReceiptDTO";
import { LogDTO } from "../DTOs/LogDTO";

export interface IGatewayService {
  // Auth microservice
  login(data: LoginUserDTO): Promise<AuthResponseType>;
  register(data: RegistrationUserDTO): Promise<AuthResponseType>;

  // User microservice
  getAllUsers(): Promise<UserDTO[]>;
  getUserById(id: number): Promise<UserDTO>;
  updateUser(id: number, data: Partial<UserDTO>): Promise<UserDTO>;
  deleteUser(id: number): Promise<void>;

  // Production microservice (Plants)
  getAllPlants(): Promise<PlantDTO[]>;
  getPlantById(id: number): Promise<PlantDTO>;
  plantNewPlant(data: PlantDTO): Promise<PlantDTO>;
  harvestPlants(plantId: number, quantity: number): Promise<PlantDTO[]>;
  adjustAromaticOilStrength(plantId: number, percentage: number): Promise<PlantDTO>;

  // Processing microservice (Perfumes)
  getAllPerfumes(): Promise<PerfumeDTO[]>;
  getPerfumeById(id: number): Promise<PerfumeDTO>;
  startProcessing(plantId: number, quantity: number, volume: number, perfumeType: string): Promise<PerfumeDTO[]>;
  getPerfumesByType(type: string, quantity: number): Promise<PerfumeDTO[]>;

  // Analytics microservice - Performance
  runPerformanceSimulation(data: SimulationRequestDTO): Promise<PerformanceResultDTO[]>;
  getPerformanceResults(limit?: number): Promise<PerformanceResultDTO[]>;
  getPerformanceResultById(id: number): Promise<PerformanceResultDTO>;
  deletePerformanceResult(id: number): Promise<void>;
  comparePerformanceAlgorithms(id: number): Promise<any>;
  exportPerformanceResult(id: number): Promise<void>;
  getPerformancePdf(id: number): Promise<{ data: ArrayBuffer; contentType: string }>;

  // Analytics microservice - Sales analytics
  createReportAnalysis(data: CreateReportAnalysisDTO): Promise<ReportAnalysisDTO>;
  getReportAnalysisList(limit?: number): Promise<ReportAnalysisDTO[]>;
  getReportAnalysisById(id: number): Promise<ReportAnalysisDTO>;
  getReportAnalysisPdf(id: number): Promise<{ data: ArrayBuffer; contentType: string }>;
  deleteReportAnalysis(id: number): Promise<void>;
  exportReportAnalysis(id: number): Promise<void>;
  calculateSalesAnalysis(data: SalesAnalysisRequestDTO): Promise<SalesAnalysisResponseDTO>;
  getTopTenPerfumes(): Promise<TopTenSummaryDTO>;
  getSalesTrend(days?: number): Promise<SalesTrendDTO[]>;

  // Analytics microservice - Receipts
  createReceipt(data: CreateReceiptDTO): Promise<ReceiptDTO>;
  getReceipts(userId: number, startDate?: string, endDate?: string): Promise<ReceiptDTO[]>;
  getReceiptById(id: number): Promise<ReceiptDTO>;
  deleteReceipt(id: number): Promise<void>;

  // Routing microservice (gateway) info
  getRouteMap(): RouteInfoDTO[];
  getRouteHealth(): Promise<RouteHealthDTO[]>;

  // Log microservice
  createLog(data: LogDTO): Promise<LogDTO>;
  getAllLogs(): Promise<LogDTO[]>;
  getLogById(id: number): Promise<LogDTO>;
  updateLog(id: number, data: Partial<LogDTO>): Promise<LogDTO>;
  deleteLog(id: number): Promise<void>;

  // Sales microservice
  getCatalogue(): Promise<any>;
  sell(data: any): Promise<any>;

  //Packaging microservice
  packagingPerfumes(perfumeType: string, quantity: number, senderAddress: string, stroageID: number): Promise<PackagingDTO[]>;
  sendAmbalage(storageID: number): Promise<PackagingDTO | null>;
}

