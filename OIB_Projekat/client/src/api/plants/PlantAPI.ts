import { IPlantAPI } from "./IPlantAPI";
import { PlantDTO } from "../../models/plants/PlantDTO";

export class PlantAPI implements IPlantAPI {
  private baseUrl = "/api/v1/plants";

  async getAllPlants(): Promise<PlantDTO[]> {
    const res = await fetch(this.baseUrl);
    if (!res.ok) throw new Error("Failed to fetch plants");
    return res.json();
  }

  async getPlantById(id: number): Promise<PlantDTO> {
    const res = await fetch(`${this.baseUrl}/${id}`);
    if (!res.ok) throw new Error("Plant not found");
    return res.json();
  }

  async createPlant(plant: PlantDTO): Promise<PlantDTO> {
    const plantToSend = { ...plant, aromaticOilStrength: Number((Math.random() * 4 + 1).toFixed(2)) };
    const res = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(plantToSend),
    });
    if (!res.ok) throw new Error("Failed to create plant");
    return res.json();
  }

  async changeAromaticOilStrength(id: number, percentage: number): Promise<PlantDTO> {
    const res = await fetch(`${this.baseUrl}/${id}/aromatic`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ percentage }),
    });
    if (!res.ok) throw new Error("Failed to change aromatic oil strength");
    return res.json();
  }

  async harvestPlants(commonName: string, quantity: number): Promise<PlantDTO[]> {
    const res = await fetch(`${this.baseUrl}/harvest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commonName, quantity }),
    });
    if (!res.ok) throw new Error("Failed to harvest plants");
    return res.json();
  }
}
