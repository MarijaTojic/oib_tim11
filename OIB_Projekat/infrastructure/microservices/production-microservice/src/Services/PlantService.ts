import { Repository } from "typeorm";
import { IPlantsService } from "../Domain/services/IPlantsService";
import { Plant } from "../Domain/models/Plant";
import { PlantDTO } from "../Domain/DTOs/PlantDTO";

export class PlantsService implements IPlantsService {
  constructor(private plantRepository: Repository<Plant>) {}

  /* Get all plants */
  async getAllPlants(): Promise<PlantDTO[]> {
    const plants = await this.plantRepository.find();
    return plants.map((plant) => this.toDTO(plant));
  }

  /** Get a single plant by ID */
  async getPlantById(id: number): Promise<PlantDTO> {
    const plant = await this.plantRepository.findOne({ where: { id } });
    if (!plant) throw new Error(`Plant with ID ${id} not found`);
    return this.toDTO(plant);
  }
  /**
   * Create / plant new plant
   */
  async createPlant(plantDTO: PlantDTO): Promise<PlantDTO> {
    const plant = this.plantRepository.create({
      commonName: plantDTO.commonName,
      latinName: plantDTO.latinName,
      countryOfOrigin: plantDTO.countryOfOrigin,
      status: plantDTO.status,
      aromaticOilStrength: Number(
        (Math.random() * 4 + 1).toFixed(2) // 1.0 – 5.0
      )
    });

    const savedPlant = await this.plantRepository.save(plant);
    return this.toDTO(savedPlant);
  }

  /**
   * Change aromatic oil strength by percentage
   */
  async changeAromaticOilStrength(id: number,percentage: number): Promise<PlantDTO> {

    const plant = await this.plantRepository.findOne({ where: { id } });
    if (!plant) throw new Error(`Plant with ID ${id} not found`);

    plant.aromaticOilStrength = Number(
      (plant.aromaticOilStrength * (percentage / 100)).toFixed(2)
    );

    const savedPlant = await this.plantRepository.save(plant);
    return this.toDTO(savedPlant);
  }

  /**
   * Harvest plants
   */
  async harvestPlants(commonName: string,quantity: number): Promise<PlantDTO[]> {

    const plants = await this.plantRepository.find({
      where: { commonName },
      take: quantity
    });

    if (plants.length < quantity) {
      throw new Error(`Not enough plants with name ${commonName}`);
    }

    await this.plantRepository.remove(plants);
    return plants.map(p => this.toDTO(p));
  }

  
  /**
   * Convert Plant entity to PlantDTO
   */
  private toDTO(plant: Plant): PlantDTO {
    return {
      id: plant.id,
      commonName: plant.commonName,
      latinName: plant.latinName,
      aromaticOilStrength: plant.aromaticOilStrength,
      countryOfOrigin: plant.countryOfOrigin,
      status: plant.status
    };
  }
}
