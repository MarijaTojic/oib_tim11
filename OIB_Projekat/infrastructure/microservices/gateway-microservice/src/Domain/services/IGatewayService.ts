import { LoginUserDTO } from "../DTOs/LoginUserDTO";
import { RegistrationUserDTO } from "../DTOs/RegistrationUserDTO";
import { AuthResponseType } from "../types/AuthResponse";
import { UserDTO } from "../DTOs/UserDTO";
import { PlantDTO } from "../DTOs/PlantDTO";
import { PerfumeDTO } from "../DTOs/PerfumeDTO";
import { PackagingDTO } from "../DTOs/PackagingDTO";
import { StorageDTO } from "../DTOs/StorageDTO";
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

  // Packaging microservice
  getAllPackages(): Promise<PackagingDTO[]>;
  getPackageById(id: number): Promise<PackagingDTO>;
  packPerfumes(perfumeIds: number[], storageId: number): Promise<PackagingDTO>;
  sendPackageToStorage(packageId: number): Promise<PackagingDTO>;

  // Storage microservice
  getAllStorages(): Promise<StorageDTO[]>;
  getStorageById(id: number): Promise<StorageDTO>;
  sendPackagesFromStorage(quantity: number): Promise<PackagingDTO[]>;

  // Sales microservice
  getAllReceipts(): Promise<ReceiptDTO[]>;
  getReceiptById(id: number): Promise<ReceiptDTO>;
  createSale(saleData: ReceiptDTO): Promise<ReceiptDTO>;

  // Log microservice
  getAllLogs(): Promise<LogDTO[]>;
  getLogById(id: number): Promise<LogDTO>;
  
  // Analytics microservice
  getSalesAnalytics(params?: any): Promise<any>;
  getPerformanceAnalytics(): Promise<any>;
}
