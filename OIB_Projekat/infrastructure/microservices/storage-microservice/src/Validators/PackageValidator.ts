import { CreatePackageDTO } from '../Domain/DTOs/CreatePackageDTO';

export interface ValidationResult {
    success: boolean;
    message: string;
}

export function validatePackageData(dto: CreatePackageDTO): ValidationResult {
    if (!dto.name || dto.name.trim().length === 0) {
        return { success: false, message: 'Package name is required' };
    }

    if (dto.name.length > 100) {
        return { success: false, message: 'Package name cannot exceed 100 characters' };
    }

    if (!dto.senderAddress || dto.senderAddress.trim().length === 0) {
        return { success: false, message: 'Sender address is required' };
    }

    if (dto.senderAddress.length > 200) {
        return { success: false, message: 'Sender address cannot exceed 200 characters' };
    }

    if (!dto.warehouseId || dto.warehouseId <= 0) {
        return { success: false, message: 'Valid warehouse ID is required' };
    }

    if (!dto.perfumeIds || !Array.isArray(dto.perfumeIds)) {
        return { success: false, message: 'Perfume IDs must be an array' };
    }

    return { success: true, message: 'Package data is valid' };
}

export function validatePackageIds(packageIds: number[]): ValidationResult {
    if (!packageIds || !Array.isArray(packageIds)) {
        return { success: false, message: 'Package IDs must be an array' };
    }

    if (packageIds.length === 0) {
        return { success: false, message: 'At least one package ID is required' };
    }

    for (const id of packageIds) {
        if (typeof id !== 'number' || id <= 0) {
            return { success: false, message: `Invalid package ID: ${id}` };
        }
    }

    return { success: true, message: 'Package IDs are valid' };
}