import axios, { AxiosInstance } from "axios";
import { ISalesService } from "../Domain/services/ISalesService";
import { CreateSaleDTO } from "../Domain/DTOs/CreateSaleDTO";
import { PerfumeDTO } from "../Domain/DTOs/perfumes/PerfumeDTO";
import { CatalogueDTO } from "../Domain/DTOs/catalogues/CatalogueDTO";
import QRCode from "qrcode"; 

export class SalesService implements ISalesService {
  private gateway: AxiosInstance;

  private catalogueCache: CatalogueDTO[] | null = null;
  private cacheTimestamp: number = 0;
  private cacheTTL = 5 * 60 * 1000; // 5 minuta

  constructor() {
    this.gateway = axios.create({
      baseURL: process.env.GATEWAY_API,
      timeout: 5000,
      headers: {
        "Content-Type": "application/json",
        "x-internal-key": process.env.SALES_INTERNAL_KEY!,
      },
    });
  }

  async getCatalogue(): Promise<CatalogueDTO[]> {
    try {
      const now = Date.now();

      if (this.catalogueCache && (now - this.cacheTimestamp) < this.cacheTTL) {
        return this.catalogueCache;
      }

      const res = await this.gateway.get<PerfumeDTO[]>("/perfumes");
      const perfumes = res.data;

      const map = new Map<string, CatalogueDTO>();

      for (const p of perfumes) {
        if (!p.id) continue;

        if (!map.has(p.name)) {
          map.set(p.name, {
            id: p.id,
            perfume_name: p.name,
            perfume_quantity: 1,
          });
        } else {
          map.get(p.name)!.perfume_quantity += 1;
        }
      }

      const catalogue = Array.from(map.values());

      this.catalogueCache = catalogue;
      this.cacheTimestamp = now;

      return catalogue;

    } catch (err) {
      console.error("Catalogue error:", err);
      throw new Error("Could not fetch catalogue");
    }
  }

  async sell(dto: CreateSaleDTO): Promise<{ success: boolean; message?: string; qrCode?: string }> {
    try {
      const catalogue = await this.getCatalogue(); 

      for (const p of dto.perfumes) {
        const exists = catalogue.find(c => c.id === p.perfumeId);
        if (!exists) {
          throw new Error(`Perfume with id ${p.perfumeId} not found in catalogue`);
        }

        if (exists.perfume_quantity < p.quantity) {
          throw new Error(`Not enough quantity for perfume ${exists.perfume_name}`);
        }
      }

      const perfumeIds: number[] = [];

      for (const p of dto.perfumes) {
        for (let i = 0; i < p.quantity; i++) {
          perfumeIds.push(p.perfumeId);
        }
      }

      const storageRes = await this.gateway.post("/storage/send", {
        perfumeIds,
        userRole: "manager",
        userId: dto.userId,
      });

      if (!storageRes.data?.success) {
        throw new Error("Storage failed");
      }

      const packages = storageRes.data.packages;

      const perfumesSold = packages.map((pkg: any) => ({
        perfumeId: pkg.perfumeId,
        userId: dto.userId,
      }));

      const receipt = await this.gateway.post("/analytics/sale", perfumesSold);

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
