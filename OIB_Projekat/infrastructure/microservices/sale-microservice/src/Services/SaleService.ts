import axios, { AxiosInstance } from "axios";
import { Repository } from "typeorm";
import QRCode from "qrcode";
import { ISalesService } from "../Domain/services/ISalesService";
import { CreateSaleDTO } from "../Domain/DTOs/CreateSaleDTO";
import { Catalogue } from "../Domain/models/Catalogue";
import { CatalogueDTO } from "../Domain/DTOs/catalogues/CatalogueDTO";
import { PerfumeDTO } from "../Domain/DTOs/perfumes/PerfumeDTO";

export class SalesService implements ISalesService {
  private gateway: AxiosInstance;

  constructor(private catalogueRepo: Repository<Catalogue>) {

    this.gateway = axios.create({
      baseURL: process.env.GATEWAY_API,
      timeout: 5000,
      headers: {
        "Content-Type": "application/json",
        "x-internal-key": process.env.SALES_INTERNAL_KEY!,
      },
    });
  }

  /** Sinhronizacija podataka iz PerfumeService u svoju bazu */
  async syncFromPerfumeService(): Promise<CatalogueDTO[]> {
    try {
      const res = await this.gateway.get<PerfumeDTO[]>("/perfumes");
      const perfumes = res.data;

      const savedItems: CatalogueDTO[] = [];

      for (const p of perfumes) {
        if (!p.id) continue;

        let dbEntry = await this.catalogueRepo.findOneBy({ perfume_name: p.name });
        if (!dbEntry) {
          dbEntry = this.catalogueRepo.create({
            perfume_name: p.name,
            perfume_quantity: 1,
          });
        } else {
          dbEntry.perfume_quantity += 1;
        }

        const saved = await this.catalogueRepo.save(dbEntry);

        savedItems.push({
          id: saved.id,
          price: saved.price,
          perfume_name: saved.perfume_name,
          perfume_quantity: saved.perfume_quantity,
        });
      }

      return savedItems;
    } catch (err) {
      console.error("Sync error:", err);
      throw new Error("Could not sync catalogue from PerfumeService");
    }
  }

  /** Dohvatanje kataloga – OVDE ČITAMO SAMO IZ VLASTITE BAZE */
  async getCatalogue(): Promise<CatalogueDTO[]> {
    const entries = await this.catalogueRepo.find();
    return entries.map((c) => ({
      id: c.id,
      price: c.price,
      perfume_name: c.perfume_name,
      perfume_quantity: c.perfume_quantity,
    }));
  }

    private async validateLocalSale(dto: CreateSaleDTO, catalogue: CatalogueDTO[]) {
    for (const p of dto.perfumes) {
      const exists = catalogue.find((c) => c.id === p.perfumeId);

      if (!exists) {
        throw new Error(`Perfume with id ${p.perfumeId} not found`);
      }

      if (exists.perfume_quantity < p.quantity) {
        throw new Error(`Not enough quantity for perfume ${exists.perfume_name}`);
      }
    }
  }

  private async generateLocalQRCode(dto: CreateSaleDTO, catalogue: CatalogueDTO[]) {

    const lines: string[] = [];
    let totalAmount = 0;

    lines.push("🧾 PERFUME RECEIPT");
    lines.push("--------------------------");
    lines.push("");

    dto.perfumes.forEach((p, index) => {
      const item = catalogue.find(c => c.id === p.perfumeId)!;
      const price = item.price;

      const total = price * p.quantity;
      totalAmount += total;

      lines.push(`${index + 1}. ${item.perfume_name} #${item.id}`);
      lines.push(`   Qty: ${p.quantity} × ${price} = ${total}`);
      lines.push("");
    });

    lines.push("--------------------------");
    lines.push(`TOTAL: ${totalAmount}`);
    lines.push("--------------------------");
    lines.push(`Date: ${new Date().toLocaleString()}`);

    const qrString = lines.join("\n");

    return QRCode.toDataURL(qrString);
  }

  private async updateLocalStock(dto: CreateSaleDTO) {
    for (const p of dto.perfumes) {
      const dbEntry = await this.catalogueRepo.findOneBy({ id: p.perfumeId });

      if (dbEntry) {
        dbEntry.perfume_quantity -= p.quantity;

        if (dbEntry.perfume_quantity < 0) {
          dbEntry.perfume_quantity = 0;
        }

        await this.catalogueRepo.save(dbEntry);
      }
    }
  }

  async sell(dto: CreateSaleDTO): Promise<{ success: boolean; message?: string; qrCode?: string }> {
    try {
      const catalogue = await this.getCatalogue();

      await this.validateLocalSale(dto, catalogue);

      const qrCode = await this.generateLocalQRCode(dto, catalogue);

      await this.updateLocalStock(dto);

      return { success: true, qrCode };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  }

}
