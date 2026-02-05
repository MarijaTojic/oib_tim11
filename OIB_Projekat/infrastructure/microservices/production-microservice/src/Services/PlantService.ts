import { Repository } from "typeorm";
import { IPlantsService } from "../Domain/services/IPlantsService";
import { Plant } from "../Domain/models/Plant";
import { PlantDTO } from "../Domain/DTOs/PlantDTO";

export class PlantsService implements IPlantsService {
  constructor(private plantRepository: Repository<Plant>) {}

  async getAllPlants(): Promise<PlantDTO[]> {
    const plants = await this.plantRepository.find();
    return plants.map((plant) => this.toDTO(plant));
  }

  
  async getPlantById(id: number): Promise<PlantDTO> {
    const plant = await this.plantRepository.findOne({ where: { id } });
    if (!plant) throw new Error(`Plant with ID ${id} not found`);
    return this.toDTO(plant);
  }


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

 
 async changeAromaticOilStrength(id: number, percentage: number): Promise<PlantDTO> {
  const plant = await this.plantRepository.findOne({ where: { id } });
  if (!plant) throw new Error(`Plant with ID ${id} not found`);


  if (percentage <= 0) {
    throw new Error("Percentage must be greater than 0");
  }


  plant.aromaticOilStrength = Number(
    (plant.aromaticOilStrength * (percentage / 100)).toFixed(2)
  );

  if (plant.aromaticOilStrength < 0) {
    plant.aromaticOilStrength = 0;
  }

  const savedPlant = await this.plantRepository.save(plant);
  return this.toDTO(savedPlant);
}

async harvestPlants(commonName: string, quantity: number): Promise<PlantDTO[]> {
 
  const plants = await this.plantRepository.find({ where: { commonName } });

  if (plants.length === 0) {
    throw new Error(`No plants with name ${commonName} found`);
  }

  const plant = plants[0]; 

  if (plant.quantity < quantity) {
    throw new Error(`Not enough plants with name ${commonName}. Available: ${plant.quantity}`);
  }

  
  plant.quantity -= quantity;
  await this.plantRepository.save(plant);

  
  return [this.toDTO(plant)];
  
}

   public toDTO(plant: Plant): PlantDTO {
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
