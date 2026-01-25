import { PackageStatus } from '../Enums/PackageStatus';

export interface PackageResponseDTO {
    id: number;
    name: string;
    senderAddress: string;
    status: PackageStatus;
    warehouseId: number;
    perfumeIds: string[];
}