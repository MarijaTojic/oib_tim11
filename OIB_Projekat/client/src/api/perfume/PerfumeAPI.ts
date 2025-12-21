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
       const response = (await this.axiosInstance.get<PerfumeDTO[]>("/perfumes")).data;
       return response;
    }
    
}