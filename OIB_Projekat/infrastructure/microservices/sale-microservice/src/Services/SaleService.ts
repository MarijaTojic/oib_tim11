import axios from "axios";
import { ISalesService } from "../Domain/services/ISalesService";
import { CreateSaleDTO } from "../Domain/DTOs/CreateSaleDTO";

export class SalesService implements ISalesService {
  private gateway = axios.create({
    baseURL: process.env.GATEWAY_API,
    timeout: 5000,
    headers: { "Content-Type": "application/json" }
  });

  async getCatalogue() {
    try {
      const perfumes = await this.gateway.get("/perfumes");
      return perfumes.data;
    } catch (err) {
      await this.log("ERROR", "Failed to fetch catalogue");
      throw err;
    }
  }

  async sell(dto: CreateSaleDTO) {
    try {
      await this.log("INFO", `Sale started for user ${dto.userId}`);

      const perfumesRes = await this.gateway.get("/perfumes");
      const perfumes = perfumesRes.data;

      for (const p of dto.perfumes) {
        const exists = perfumes.find((x: any) => x.id === p.perfumeId);
        if (!exists) {
          await this.log("ERROR", `Perfume ${p.perfumeId} not found`);
          throw new Error(`Perfume ${p.perfumeId} not found`);
        }
      }

      const packageIds = dto.perfumes.map(p => p.perfumeId);

      const storageRes = await this.gateway.post("/storage/send", {
        packageIds,
        userRole: "manager",
        userId: dto.userId
      });

      if (!storageRes.data.success) {
        await this.log("ERROR", "Storage send failed");
        throw new Error("Storage failed");
      }

      const receiptPayload = {
        userId: dto.userId,
        perfumeDetails: dto.perfumes.map(p => {
          const perf = perfumes.find((x: any) => x.id === p.perfumeId);
          return {
            perfumeId: perf.id,
            perfumeName: perf.name,
            quantity: p.quantity,
            totalPrice: perf.price ? perf.price * p.quantity : 0
          };
        }),
        totalAmount: dto.perfumes.reduce((sum, p) => {
          const perf = perfumes.find((x: any) => x.id === p.perfumeId);
          return sum + ((perf?.price || 0) * p.quantity);
        }, 0)
      };

      const analyticsRes = await this.gateway.post("/analytics/receipt", receiptPayload);

      await this.log("INFO", `Sale success for user ${dto.userId}`);

      return {
        success: true,
        receipt: analyticsRes.data
      };

    } catch (error:any) {
      await this.log("ERROR", `Sale failed: ${error.message}`);
      return {
        success: false,
        message: error.message
      };
    }
  }

  private async log(type: "INFO" | "ERROR", message: string) {
    try {
      await this.gateway.post("/logs", {
        logtype: type,
        description: message,
        datetime: new Date()
      });
    } catch {}
  }
}