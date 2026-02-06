import { PackagingDTO } from "../DTOs/PackagingDTO";
import { PackagingStatus } from "../enums/PackagingStatus";
import { Packaging } from "../models/Packaging";

export interface IPackagingService {
    perfumePackagin(perfumeType: string, quantity: number, senderAddress: string, storageID: number): Promise<PackagingDTO[]>  
    sendAmbalage(storageID: number): Promise<PackagingDTO | null>;
}
