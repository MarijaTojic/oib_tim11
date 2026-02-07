import { IPlantAPI } from "./IPlantAPI";
import { PlantDTO } from "../../models/plants/PlantDTO";
import { PlantStatus } from "../../enums/PlantStatus";

export class PlantAPI implements IPlantAPI {
  private baseUrl = `${import.meta.env.VITE_GATEWAY_URL}/plants`;

  async getAllPlants(): Promise<PlantDTO[]> {
    const token = localStorage.getItem("authToken");
    const res = await fetch(this.baseUrl, {
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}`}
    });
    if (!res.ok) throw new Error("Failed to fetch plants");
    return res.json();
  }

  async getPlantById(id: number): Promise<PlantDTO> {
    const res = await fetch(`${this.baseUrl}/${id}`);
    if (!res.ok) throw new Error("Plant not found");
    return res.json();
  }

  async createPlant(plant: PlantDTO): Promise<PlantDTO> {
    const token = localStorage.getItem("authToken");
    console.log(token);
    const { id,  ...plantWithoutId } = plant;
    //const plantToSend = { ...plant, aromaticOilStrength: Number((Math.random() * 4 + 1).toFixed(2)) };
    const plantToSend: PlantDTO = {
      commonName: plant.commonName,
      latinName: plant.latinName || "",
      countryOfOrigin: plant.countryOfOrigin || "",
      status: PlantStatus.PLANTED, 
      aromaticOilStrength: Number((Math.random() * 4 + 1).toFixed(2)),
      quantity: plant.quantity || 1,
    };

    const res = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}`},
      body: JSON.stringify(plantToSend),
    });
    if (!res.ok) throw new Error("Failed to create plant");
    return res.json();
  }

  async changeAromaticOilStrength(id: number, percentage: number): Promise<PlantDTO> {
    const token = localStorage.getItem("authToken");
    console.log("Token being sent:", token);

    const res = await fetch(`${this.baseUrl}/${id}/aromatic`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}`},
      body: JSON.stringify({ percentage }),
    });
    if (!res.ok) throw new Error("Failed to change aromatic oil strength");
    return res.json();
  }

  async harvestPlants(commonName: string, quantity: number): Promise<PlantDTO[]> {
    const token = localStorage.getItem("authToken");
    const res = await fetch(`${this.baseUrl}/harvest`, {
      method: "POST",
      headers: { "Content-Type": "application/json",  "Authorization": `Bearer ${token}`},
      body: JSON.stringify({ commonName, quantity }),
    });
    if (!res.ok) throw new Error("Failed to harvest plants");
    return res.json();
  }
}
