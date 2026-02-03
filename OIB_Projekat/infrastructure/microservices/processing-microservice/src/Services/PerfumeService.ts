import { Repository } from "typeorm";
import { IPerfumeService } from "../Domain/services/IPerfumeService";
import { Perfume } from "../Domain/models/Perfume";
import { PerfumeDTO } from "../Domain/DTOs/PerfumeDTO";
import { PerfumeType } from "../Domain/enums/PerfumeType";
import { calculateNumberOfPlants } from "../helpers/NumberOfPlants"
import { LogerService } from "./LogerService";

export class PerfumeService implements IPerfumeService {
  constructor(private perfumeRepository: Repository<Perfume>){}//, private plantService: any) {}

  /**
   * Plant processing
   */
  async plantProcessing(plantId: number, quantity: number, volume: number, perfumeType: string): Promise<PerfumeDTO[]> {
    const logger = new LogerService();
    const numberOfPlants = calculateNumberOfPlants(quantity, volume);
    await logger.log(`Number of plants needed: ${numberOfPlants}`);

    const typeEnum = perfumeType as PerfumeType;
    const perfumeFromDb = await this.perfumeRepository.findOne({where: {type: typeEnum}});

    if (!perfumeFromDb) {
      throw new Error(`Perfume with type ${perfumeType} not found`);
    }

    const perfumes: Perfume[] = [];
    
    await logger.log(`Starting plant processing for ${Perfume.name} (${quantity} bottles of ${volume} ml)`);
 
    for (let i = 0; i < quantity; i++) {
    let perfume = this.perfumeRepository.create({
      name: perfumeFromDb.name,
      type: typeEnum,
      netQuantity: volume,
      plantId: plantId,
      expirationDate: new Date(
      new Date().setFullYear(new Date().getFullYear() + 2)
      )
    });
      if (perfume.perfumeAromaticOilStrength > 4.0) {
        const excess = perfume.perfumeAromaticOilStrength - 4.0;
        const percentage = excess * 100; // 0.65 → 65%

        /*const newPlant = await this.plantService.createPlant({
        commonName: Perfume.name
          });

        //smanji jačinu aromatičnih ulja nove biljke
       /*  await this.plantService.changeAromaticOilStrength(
            newPlant.id,
            newPlant.id,
            percentage
         );*/
      }


    perfume = await this.perfumeRepository.save(perfume);
    perfume.serialNumber = `PP-2025-${perfume.id}`;
    perfume = await this.perfumeRepository.save(perfume);

    perfumes.push(perfume);
  }
  return perfumes.map(p => this.toDTO(p));
}

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
      expirationDate: perfume.expirationDate,
      perfumeAromaticOilStrength: perfume.perfumeAromaticOilStrength
    };
  }
}
