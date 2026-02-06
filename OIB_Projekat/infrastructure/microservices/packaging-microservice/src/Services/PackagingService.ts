import { Repository } from "typeorm";
import { PackagingDTO } from "../Domain/DTOs/PackagingDTO"
import { PackagingStatus } from "../Domain/enums/PackagingStatus"
import { Packaging } from "../Domain/models/Packaging"
import { IPackagingService } from "../Domain/services/IPackagingService"
import fetch from 'node-fetch';

export class PackagingService implements IPackagingService{
    constructor(private packagingRepository: Repository<Packaging>){}

     private packagingStorage: Packaging[] = [];

    async sendAmbalage(storageID: number): Promise<PackagingDTO | null> {
       const available = await this.packagingRepository.findOne({where: { status: PackagingStatus.PACKED }});

        if (available) {
            available.status = PackagingStatus.SENT;
            available.storageID = storageID; 
            return this.toDTO(available); 
        } else {
            console.log("Nema dostupne ambalaže, potrebno je pakovanje.");
            return null;
        }
    }

    async perfumePackagin(perfumeType: string, quantity: number, senderAddress: string, storageID: number): Promise<PackagingDTO[]> {
        const perfumesForPackaging: PerfumeForPackagingDTO[] = await this.getPerfumesForPackaging(perfumeType, quantity);

        const packaged: PackagingDTO[] = perfumesForPackaging.map((perfume, index: number) => ({
            name: `${perfumeType} Package ${index + 1}`,
            senderAddress,
            storageID,
            perfumeList: [perfume.id],  
            status: PackagingStatus.PACKED
        }));

        const packagingEntities = packaged.map(dto => {
            const p = new Packaging();
            p.name = dto.name;
            p.senderAddress = dto.senderAddress;
            p.storageID = dto.storageID;
            p.perfumeList = dto.perfumeList;
            p.status = dto.status;
            return p;
        });

        await this.packagingRepository.save(packagingEntities);

        return packaged;
    }
    
    private async getPerfumesForPackaging(perfumeType: string, quantity: number): Promise<PerfumeForPackagingDTO[]> {
        const response = await fetch(`${process.env.PROCESSING_SERVICE_API}/perfumes?type=${perfumeType}&quantity=${quantity}`);
            
        if (!response.ok) throw new Error(`Processing service returned ${response.status}`);
            
        const perfumes: PerfumeForPackagingDTO[] = await response.json() as PerfumeForPackagingDTO[];
            
        return perfumes;
    }

    private toDTO(packaging: Packaging): PackagingDTO {
    return {
      id: packaging.id,
      name: packaging.name,
      senderAddress: packaging.senderAddress,
      storageID: packaging.storageID,
      perfumeList: packaging.perfumeList,
      status: packaging.status,
    };
  }
}
