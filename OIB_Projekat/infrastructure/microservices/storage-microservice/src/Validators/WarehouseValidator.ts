import { CreateWarehouseDTO } from '../Domain/DTOs/CreateWarehouseDTO';

export interface ValidationResult {
    success: boolean;
    message: string;
}

export function validateWarehouseData(dto: CreateWarehouseDTO): ValidationResult {
    if (!dto.name || dto.name.trim().length === 0) {
        return { success: false, message: 'Warehouse name is required' };
    }

    if (dto.name.length > 100) {
        return { success: false, message: 'Warehouse name cannot exceed 100 characters' };
    }

    if (!dto.location || dto.location.trim().length === 0) {
        return { success: false, message: 'Warehouse location is required' };
    }

    if (dto.location.length > 200) {
        return { success: false, message: 'Warehouse location cannot exceed 200 characters' };
    }

    if (!dto.maxPackages || typeof dto.maxPackages !== 'number') {
        return { success: false, message: 'Maximum packages must be a number' };
    }

    if (dto.maxPackages <= 0) {
        return { success: false, message: 'Maximum packages must be greater than 0' };
    }

    if (dto.maxPackages > 10000) {
        return { success: false, message: 'Maximum packages cannot exceed 10000' };
    }

    return { success: true, message: 'Warehouse data is valid' };
}