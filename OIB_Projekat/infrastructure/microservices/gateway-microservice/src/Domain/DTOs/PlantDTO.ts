import { PlantStatus } from "../enums/PlantStatus";

export interface PlantDTO {
  id?: number;
  commonName: string;
  aromaticOilStrength: number;
  latinName: string;
  originCountry: string;
  status: PlantStatus;
}
