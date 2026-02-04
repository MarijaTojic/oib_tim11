import { PlantDTO } from "../DTOs/PlantDTO";
import { Plant } from "../models/Plant";

export interface IPlantsService {
  
  getAllPlants(): Promise<PlantDTO[]>;
  getPlantById(id: number): Promise<PlantDTO>;
  createPlant(plant: PlantDTO): Promise<PlantDTO>;
  changeAromaticOilStrength(id: number,percentage: number): Promise<PlantDTO>;
  harvestPlants(commonName: string, quantity: number): Promise<PlantDTO[]>;
  toDTO(plant: PlantDTO): PlantDTO;

}
