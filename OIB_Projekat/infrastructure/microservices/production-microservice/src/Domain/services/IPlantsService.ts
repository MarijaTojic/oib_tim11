import { PlantDTO } from "../DTOs/PlantDTO";

export interface IPlantsService {

  getAllPlants(): Promise<PlantDTO[]>;
  getPlantById(id: number): Promise<PlantDTO>;
  /**
   * Create / plant a new plant
   * Aromatic oil strength is generated randomly
   */
  createPlant(plant: PlantDTO): Promise<PlantDTO>;

  /**
   * Change aromatic oil strength by percentage
   */
  changeAromaticOilStrength(id: number,percentage: number): Promise<PlantDTO>;

  /**
   * Harvest plants by common name and quantity
   */
  harvestPlants(commonName: string, quantity: number): Promise<PlantDTO[]>;

}
