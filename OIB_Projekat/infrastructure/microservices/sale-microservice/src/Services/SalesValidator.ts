import axios, { AxiosInstance } from "axios";
import { ISalesService } from "../Domain/services/ISalesService";
import { CreateSaleDTO } from "../Domain/DTOs/CreateSaleDTO";
import { PerfumeDTO } from "../Domain/DTOs/perfumes/PerfumeDTO";
import QRCode from "qrcode"; // npm install qrcode + npm i --save-dev @types/qrcode

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

  async sell(dto: CreateSaleDTO): Promise<{ success: boolean; message?: string; qrCode?: string }> {
    try {
      await this.log("INFO", `Sale started for user ${dto.userId}`);

      const perfumes = await this.getCatalogue(); // koristi cache

      // Provjera da svi parfemi postoje
      for (const p of dto.perfumes) {
        if (!perfumes.find(x => x.id === p.perfumeId)) {
          const msg = `Perfume ${p.perfumeId} not found`;
          await this.log("ERROR", msg);
          throw new Error(msg);
        }
      }

      const perfumeIds = dto.perfumes.map(p => p.perfumeId);

      const storageRes = await this.gateway.post("/storage/send", {
        perfumeIds,
        userRole: "manager",
        userId: dto.userId
      });

      if (!storageRes.data.success) {
        await this.log("ERROR", "Storage send failed");
        throw new Error("Storage failed");
      }

      const packages = storageRes.data.packages;

      // Priprema podataka za Analytics
      const perfumesSold = packages.map((pkg: any) => ({
        perfumeId: pkg.perfumeId,
        userId: dto.userId
      }));

      // Pošalji na Analytics i dobiješ "račun"
      const receipt = await this.gateway.post("/analytics/sale", perfumesSold);

      // Generisanje QR koda sa podacima iz računa
      const qrData = receipt.data.perfumeDetails.map((p: any) => ({
        perfumeId: p.perfumeId,
        perfumeName: p.perfumeName,
        quantity: p.quantity,
        price: p.price,
        totalPrice: p.totalPrice
      }));

      const qrString = JSON.stringify({
        userId: dto.userId,
        totalAmount: receipt.data.totalAmount,
        perfumes: qrData
      });

      const qrCode = await QRCode.toDataURL(qrString);

      await this.log("INFO", `Sale success for user ${dto.userId}`);
      return { success: true, qrCode };

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
        datetime: new Date()
      });
    } catch (err) {
      console.error(`[SalesService][${type}] ${message}`, err);
    }
  }
}