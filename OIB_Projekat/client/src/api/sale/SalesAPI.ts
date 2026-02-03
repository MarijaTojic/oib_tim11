import axios, { AxiosInstance } from "axios";
import { ISalesAPI } from "./ISalesAPI";
import { CatalogueDTO } from "../../models/catalogues/CatalogueDTO";

export class SalesAPI implements ISalesAPI {
  private readonly axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: import.meta.env.VITE_GATEWAY_URL,
      headers: { "Content-Type": "application/json" },
      timeout: 5000,
    });
  }

  async getCatalogue(): Promise<CatalogueDTO> {
    const response = (await this.axiosInstance.get<CatalogueDTO>("/sales/catalogue")).data;
    return response;
  }

  async sell(
    userId: number,
    perfumeIds: number[]
  ): Promise<{ success: boolean; message?: string; qrCode?: string }> {
    const response = (
      await this.axiosInstance.post<{ success: boolean; message?: string; qrCode?: string }>("/sales/sell", {
        userId,
        perfumes: perfumeIds.map(id => ({ perfumeId: id })),
      })
    ).data;

    return response;
  }
}
