import { PackagingStatus } from "../../enums/PackagingStatus";

export interface PackageResponseDTO {
    id: number;
    name: string;
    senderAddress: string;
    status: PackagingStatus;
    warehouseId: number;
    perfumeIds: string[];
}