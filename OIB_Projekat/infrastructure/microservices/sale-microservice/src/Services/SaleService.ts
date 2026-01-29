import axios, { AxiosInstance } from "axios";
import { ISalesService } from "../Domain/services/ISalesService";
import { CreateSaleDTO } from "../Domain/DTOs/CreateSaleDTO";
import { PerfumeDTO } from "../Domain/DTOs/perfumes/PerfumeDTO";
import { SalesValidator } from "../Services/SalesValidator";

export class SalesService implements ISalesService {
  private gateway: AxiosInstance;
  private perfumeCache: PerfumeDTO[] | null = null;
  private cacheTimestamp: number = 0;
  private cacheTTL = 5 * 60 * 1000; // 5 minuta

  constructor() {
    this.gateway = axios.create({
      baseURL: process.env.GATEWAY_API,
      timeout: 5000,
      headers: { "Content-Type": "application/json" },
    });
  }

  async getCatalogue(): Promise<PerfumeDTO[]> {
    if (this.perfumeCache && Date.now() - this.cacheTimestamp < this.cacheTTL) {
      return this.perfumeCache;
    }

    try {
      const res = await this.gateway.get<PerfumeDTO[]>("/perfumes");
      this.perfumeCache = res.data;
      this.cacheTimestamp = Date.now();
      return res.data;
    } catch (err: any) {
      await this.log("ERROR", `Failed to fetch catalogue: ${err.message}`);
      throw new Error("Could not fetch catalogue");
    }
  }

  async sell(dto: CreateSaleDTO): Promise<{ success: boolean; message?: string }> {
    try {
      const validation = SalesValidator.validateSaleDto(dto);
      if (!validation.success) {
        await this.log("ERROR", `Sale validation failed: ${validation.message}`);
        return { success: false, message: validation.message };
      }

      await this.log("INFO", `Sale started for user ${dto.userId}`);

      const perfumes = await this.getCatalogue();

      // Provjera da svi parfemi postoje
      for (const p of dto.perfumes) {
        if (!perfumes.find(x => x.id === p.perfumeId)) {
          const msg = `Perfume ${p.perfumeId} not found`;
          await this.log("ERROR", msg);
          return { success: false, message: msg };
        }
      }

      const perfumeIds = dto.perfumes.map(p => p.perfumeId);

      // Slanje zahtjeva u microservice za skladištenje
      const storageRes = await this.gateway.post("/storage/send", {
        perfumeIds,
        userRole: "manager",
        userId: dto.userId,
      });

      if (!storageRes.data.success) {
        await this.log("ERROR", "Storage send failed");
        return { success: false, message: "Storage failed" };
      }

      const packages = storageRes.data.packages; //proveriti da ovako vraca

      const packageValidation = SalesValidator.validatePackages(packages);
      if (!packageValidation.success) {
        await this.log("ERROR", `Package validation failed: ${packageValidation.message}`);
        return { success: false, message: packageValidation.message };
      }

      // Slanje prodanih parfema u microservice za analitiku
      const perfumesSold = packages.map((pkg: any) => ({
        perfumeId: pkg.perfumeId,
        userId: dto.userId,
      }));

      await this.gateway.post("/analytics/sale", perfumesSold);

      await this.log("INFO", `Sale success for user ${dto.userId}`);
      return { success: true };
    } catch (error: any) {
      await this.log("ERROR", `Sale failed: ${error.message}`);
      return { success: false, message: error.message };
    }
  }

  private async log(type: "INFO" | "ERROR", message: string) {
    try {
      await this.gateway.post("/logs", {
        logtype: type,
        description: message,
        datetime: new Date(),
      });
    } catch (err) {
      console.error(`[SalesService][${type}] ${message}`, err);
    }
  }
}