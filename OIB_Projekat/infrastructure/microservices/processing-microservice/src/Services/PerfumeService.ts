import { Repository } from "typeorm";
import { IPerfumeService } from "../Domain/services/IPerfumeService";
import { Perfume } from "../Domain/models/Perfume";
import { Plant } from "../../../production-microservice/src/Domain/models/Plant";
import { PerfumeDTO } from "../Domain/DTOs/PerfumeDTO";
import { PerfumeType } from "../Domain/enums/PerfumeType";
import { calculateNumberOfPlants } from "../helpers/NumberOfPlants"
//import { ILogService } from "../../../log-microservice/src/Domain/services/ILogService";
import axios from "axios";

export class PerfumeService implements IPerfumeService {
  constructor(private perfumeRepository: Repository<Perfume>, private plantRepository: Repository<Plant>/*, private logger: ILogService*/){}
  //, private plantService: IPlantsService) {}

  async plantProcessing(plantId: number, quantity: number, volume: number, perfumeType: string): Promise<PerfumeDTO[]> {
    const numberOfPlants = calculateNumberOfPlants(quantity, volume);
    //await this.logger.log(`Number of plants needed: ${numberOfPlants}`);

    const typeEnum = perfumeType as PerfumeType;
    const perfumeFromDb = await this.perfumeRepository.findOne({where: {type: typeEnum}});
    console.log("Perfume found:", perfumeFromDb);
    if (!perfumeFromDb) {
      throw new Error(`Perfume with type ${perfumeType} not found`);
    }
    
    //const plant = await this.plantRepository.findOne({ where: { id: plantId } });

    /*if (!plant) {
      throw new Error(`Biljka sa ID ${plantId} ne postoji`);
    }*/

    //const plantOilStrength = plant?.aromaticOilStrength;
    //await this.logger.log(`Jačina biljke ID ${plantId}: ${plantOilStrength}`);

    const perfumes: Perfume[] = [];
    
    //await this.logger.log(`Starting plant processing for ${Perfume.name} (${quantity} bottles of ${volume} ml)`);
 
    for (let i = 0; i < quantity; i++) {
    let perfume = this.perfumeRepository.create({
      name: perfumeFromDb.name,
      type: typeEnum,
      netQuantity: volume,
      plantId: plantId,
      expirationDate: new Date(
      new Date().setFullYear(new Date().getFullYear() + 2)
      ),
      quantity: quantity
    });
  /*if (perfume.perfumeAromaticOilStrength > 4.0) {
  const excess = perfume.perfumeAromaticOilStrength - 4.0;
  const targetFactor = 4.0 / perfume.perfumeAromaticOilStrength;  

  // Šalji zahtev production servisu
  const response = await axios.post('http://localhost:6854/api/v1/internal/plant-request', {  
    commonName: perfumeFromDb.name,          
    previousOilStrength: perfume.perfumeAromaticOilStrength
  }, {
    headers: { 'X-API-Key': process.env.PRODUCTION_API_KEY || 'secret' }
  });

  const newPlant = response.data;

  //await this.logger.log(`Nova biljka zasađena i korigovana na ${newPlant.adjustedOilStrength}`);
}*/

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
      perfumeAromaticOilStrength: perfume.perfumeAromaticOilStrength,
      quantity: perfume.quantity
    };
  }
}
