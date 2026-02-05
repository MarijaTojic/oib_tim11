import axios, { AxiosInstance } from "axios";
import { ISalesService } from "../Domain/services/ISalesService";
import { CreateSaleDTO } from "../Domain/DTOs/CreateSaleDTO";
import { PerfumeDTO } from "../Domain/DTOs/perfumes/PerfumeDTO";
import { CatalogueDTO } from "../Domain/DTOs/catalogues/CatalogueDTO";
import QRCode from "qrcode"; // npm install qrcode

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

  async getCatalogue(): Promise<CatalogueDTO> {
    try {
      if (this.perfumeCache && Date.now() - this.cacheTimestamp < this.cacheTTL) {
        return {
          allPerfumes: this.perfumeCache,
          amount: this.perfumeCache.length,
        };
      }

      const res = await this.gateway.get<PerfumeDTO[]>("/perfumes"); 
      this.perfumeCache = res.data;
      this.cacheTimestamp = Date.now();

      const catalogue: CatalogueDTO = {
        allPerfumes: res.data,
        amount: res.data.length,
      };

      return catalogue;
    } catch (err: any) {
      throw new Error("Could not fetch catalogue");
    }
  }

  // Prodaja parfema
  async sell(dto: CreateSaleDTO): Promise<{ success: boolean; message?: string; qrCode?: string }> {
    try {
      const catalogue = await this.getCatalogue();

      for (const p of dto.perfumes) {
        if (!catalogue.allPerfumes.find(x => x.id === p.perfumeId)) {
          throw new Error(`Perfume ${p.perfumeId} not found`);
        }
      }

      const perfumeIds = dto.perfumes.map(p => p.perfumeId);

      const storageRes = await this.gateway.post("/storage/send", {
        perfumeIds,
        userRole: "manager",
        userId: dto.userId,
      });

      if (!storageRes.data.success) {
        throw new Error("Storage failed");
      }

      const packages = storageRes.data.packages;

      const perfumesSold = packages.map((pkg: any) => ({
        perfumeId: pkg.perfumeId,
        userId: dto.userId,
      }));

      const receipt = await this.gateway.post("/analytics/sale", perfumesSold);

      // Generiši QR kod
      const qrData = receipt.data.perfumeDetails.map((p: any) => ({
        perfumeId: p.perfumeId,
        perfumeName: p.perfumeName,
        quantity: p.quantity,
        price: p.price,
        totalPrice: p.totalPrice,
      }));

      const qrString = JSON.stringify({
        userId: dto.userId,
        totalAmount: receipt.data.totalAmount,
        perfumes: qrData,
      });

      const qrCode = await QRCode.toDataURL(qrString);

      return { success: true, qrCode };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }
}
