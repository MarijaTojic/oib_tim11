import { CreatePackageDTO } from '../DTOs/CreatePackageDTO';
import { CreateWarehouseDTO } from '../DTOs/CreateWarehouseDTO';

export interface IStorageService {
    receivePackage(
        dto: CreatePackageDTO,
        userId: number
    ): Promise<{
        success: boolean;
        message: string;
        data?: any;
    }>;

    sendPackages(
        packageIds: number[],
        userRole: string,
        userId: number
    ): Promise<{
        success: boolean;
        message: string;
        data?: {
            packageCount: number;
            processingTime: string;
            strategy: string;
        };
    }>;

    createWarehouse(
        dto: CreateWarehouseDTO,
        userId: number
    ): Promise<{
        success: boolean;
        message: string;
        data?: any;
    }>;

    getWarehouses(): Promise<{
        success: boolean;
        data?: any[];
    }>;

    checkPackageAvailability(packageIds: number[]): Promise<{
        available: boolean;
        missingIds?: number[];
        message?: string;
    }>;
}