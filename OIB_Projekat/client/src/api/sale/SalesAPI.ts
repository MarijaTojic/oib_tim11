import { ISalesAPI } from "./ISalesAPI";
import { CatalogueDTO } from "../../models/catalogues/CatalogueDTO";
import axios, { AxiosInstance } from "axios";

export class SalesAPI implements ISalesAPI {
  private readonly axiosInstance: AxiosInstance;

  constructor() {
    const token = localStorage.getItem("authToken");
    //console.log("Auth token:", token);
    this.axiosInstance = axios.create({
      baseURL: import.meta.env.VITE_GATEWAY_URL,
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      timeout: 5000,
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
