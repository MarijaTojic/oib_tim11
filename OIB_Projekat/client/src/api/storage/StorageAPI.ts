import { PackagingDTO } from "../../models/packaging/PackagingDTO";

import { CreatePackageDTO } from "../../models/storages/CreatePackageDTO";
import { CreateWarehouseDTO } from "../../models/storages/CreateWarehouseDTO";
import { WarehouseDTO } from "../../models/storages/WarehouseDTO";

export class StorageAPI {
  private baseUrl = `${import.meta.env.VITE_GATEWAY_URL}/storage`;

  private getToken(): string | null {
    return localStorage.getItem("authToken");
  }

  private async fetchWithAuth(input: RequestInfo, init?: RequestInit) {
    const token = this.getToken();
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      ...(init?.headers || {})
    };
    const response = await fetch(input, { ...init, headers });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Request failed");
    }
    return response.json();
  }

  async getAllWarehouses(): Promise<WarehouseDTO[]> {
    return this.fetchWithAuth(`${this.baseUrl}/warehouses`);
  }

  async createWarehouse(dto: CreateWarehouseDTO): Promise<{ success: boolean; message: string; data?: WarehouseDTO }> {
    return this.fetchWithAuth(`${this.baseUrl}/warehouses`, {
      method: "POST",
      body: JSON.stringify(dto),
    });
  }

  async getPackagesInWarehouse(warehouseId?: number): Promise<PackagingDTO[]> {
    const allWarehouses: WarehouseDTO[] = await this.getAllWarehouses();
    if (warehouseId) {
      const wh = allWarehouses.find(w => w.id === warehouseId);
      return wh?.packages || [];
    }
   
    return allWarehouses.flatMap(w => w.packages || []);
  }

  async createPackage(dto: CreatePackageDTO): Promise<{ success: boolean; message: string; data?: PackagingDTO }> {
    return this.fetchWithAuth(`${this.baseUrl}/packages`, {
      method: "POST",
      body: JSON.stringify(dto),
    });
  }

  async sendPackages(packageIds: number[]): Promise<{ success: boolean; message: string; data?: any }> {
    return this.fetchWithAuth(`${this.baseUrl}/ship`, {
      method: "POST",
      body: JSON.stringify({ packageIds }),
    });
  }

 
  async createPackagesFromAllPerfumes(warehouseId?: number): Promise<{ success: boolean; message: string; packages?: PackagingDTO[] }> {
  
    const dummyPackage: CreatePackageDTO = {
      name: `Амбалажа (${new Date().toLocaleTimeString()})`,
      senderAddress: "Perfume Lab",
      warehouseId: warehouseId || 0, 
    };
    return this.createPackage(dummyPackage);
  }
}