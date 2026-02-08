// src/api/storage/IStorageAPI.ts

import { PackagingDTO } from "../../models/packaging/PackagingDTO";
import { CreatePackageDTO } from "../../models/storages/CreatePackageDTO";
import { CreateWarehouseDTO } from "../../models/storages/CreateWarehouseDTO";
import { WarehouseDTO } from "../../models/storages/WarehouseDTO";


export interface IStorageAPI { 

  
    getAllWarehouses(token: string): Promise<WarehouseDTO[]>;

    getPackagesInWarehouse(token: string, warehouseId?: number): Promise<PackagingDTO[]>;

    sendPackages(token: string, packageIds: number[]): Promise<{ success: boolean; message: string }>;

    createWarehouse(token: string, dto: CreateWarehouseDTO): Promise<{ success: boolean; message: string; data?: WarehouseDTO }>;

    receivePackage(token: string, dto: CreatePackageDTO): Promise<{ success: boolean; message: string; data?: PackagingDTO }>;

    createPackagesFromAllPerfumes(token: string, warehouseId?: number): Promise<{ success: boolean; message: string; packages?: PackagingDTO[] }>;
}