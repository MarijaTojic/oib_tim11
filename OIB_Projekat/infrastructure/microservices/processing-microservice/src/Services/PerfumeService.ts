import { Repository } from "typeorm";
import { IPerfumeService } from "../Domain/services/IPerfumeService";
import { Perfume } from "../Domain/models/Perfume";
import { PerfumeDTO } from "../Domain/DTOs/PerfumeDTO";
import { PerfumeType } from "../Domain/enums/PerfumeType";

export class PerfumeService implements IPerfumeService {
  constructor(private perfumeRepository: Repository<Perfume>) {}

  /**
   * Get all perfumes
   */
  async getAllPerfumes(): Promise<PerfumeDTO[]> {
    const perfumes = await this.perfumeRepository.find();
    return perfumes.map(p => this.toDTO(p));
  }

   /**
   * Get perfume by type and netQuantity 
   */
  async getPerfumeByTypeAndQuantity(type: PerfumeType, quantity: number): Promise<PerfumeDTO> {
    const perfume = await this.perfumeRepository.findOne({where: {type, netQuantity: quantity}});
    if(!perfume){
      throw new Error('Perfume does not exist!');
    } 
    return this.toDTO(perfume);
  }

  /**
   * Create a new perfume
   */
  async createPerfume(perfume: Perfume): Promise<PerfumeDTO> {
    const newPerfume = this.perfumeRepository.create(perfume);
    const savedPerfume = await this.perfumeRepository.save(newPerfume);
    return this.toDTO(savedPerfume);
  }

  /**
   * Convert Perfume entity to PerfumeDTO
   */
  private toDTO(perfume: Perfume): PerfumeDTO {
    return {
      id: perfume.id,
      name: perfume.name,
      type: perfume.type,
      netQuantity: perfume.netQuantity,
      serialNumber: perfume.serialNumber,
      plantId: perfume.plantId,
      expirationDate: perfume.expirationDate
    };
  }
}
