import { PackageResponseDTO } from './PackageResponseDTO';

export interface WarehouseResponseDTO {
    id: number;
    name: string;
    location: string;
    maxPackages: number;
    currentPackages: number;
    packages: PackageResponseDTO[];
}