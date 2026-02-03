import { IPerfumeAPI } from "./IPerfumeAPI";
import { PerfumeDTO } from "../../models/perfumes/PerfumeDTO";
import axios, { AxiosInstance } from "axios";

export class PerfumeAPI implements IPerfumeAPI{
     private readonly axiosInstance: AxiosInstance;
     
     constructor(){
        this.axiosInstance = axios.create({
            baseURL: import.meta.env.VITE_GATEWAY_URL,
            headers: {
                "Content-Type": "application/json",
            }
        })
     }

    async getAllPerfumes(): Promise<PerfumeDTO[]> {
       const token = localStorage.getItem("authToken");
        console.log("TOKEN:", token);

        const response = await this.axiosInstance.get<PerfumeDTO[]>(
            "/perfumes",
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

        return response.data;
    }
    
    async plantProcessing(plantId: number, quantity: number, volume: number, perfumeType: string): Promise<PerfumeDTO[]> {
    const token = localStorage.getItem("authToken");

    const response = await this.axiosInstance.post<PerfumeDTO[]>(
      "/processing",
      {
        plantId,
        quantity,
        volume,
        perfumeType,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  }

}