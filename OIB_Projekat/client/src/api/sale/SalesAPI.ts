import { ISalesAPI } from "./ISalesAPI";
import { CatalogueDTO } from "../../models/catalogues/CatalogueDTO";
import axios, { AxiosInstance } from "axios";

export class SalesAPI implements ISalesAPI {
  private readonly axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: import.meta.env.VITE_GATEWAY_URL,
      timeout: 5000,
    });

    this.axiosInstance.interceptors.request.use(config => {
      const token = localStorage.getItem("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  async getCatalogue(): Promise<CatalogueDTO[]> {
    const res = await this.axiosInstance.get<CatalogueDTO[]>("/sales/catalogue");
    return res.data;
  }

  async sell(userId: number, quantities: Record<number, number>) {
    const perfumesPayload = Object.entries(quantities)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => ({ perfumeId: Number(id), quantity: qty }));

    if (perfumesPayload.length === 0) throw new Error("No perfumes selected");

    const res = await this.axiosInstance.post("/sales/sell", {
      userId,
      perfumes: perfumesPayload
    });

    return res.data;
  }

}
