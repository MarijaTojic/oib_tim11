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

        // Proveri da li parfem već postoji u tvojoj bazi
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
      perfume_name: c.perfume_name,
      perfume_quantity: c.perfume_quantity,
    }));
  }

  /** Prodaja parfema – smanjenje količine u sopstvenoj bazi i generisanje QR koda */
  async sell(dto: CreateSaleDTO): Promise<{ success: boolean; message?: string; qrCode?: string }> {
    try {
      const catalogue = await this.getCatalogue();

      for (const p of dto.perfumes) {
        const exists = catalogue.find((c) => c.id === p.perfumeId);
        if (!exists) throw new Error(`Perfume with id ${p.perfumeId} not found`);
        if (exists.perfume_quantity < p.quantity)
          throw new Error(`Not enough quantity for perfume ${exists.perfume_name}`);
      }

      const perfumeIds: number[] = [];
      for (const p of dto.perfumes) {
        for (let i = 0; i < p.quantity; i++) perfumeIds.push(p.perfumeId);
      }

      // Slanje parfema u storage mikroservis
      const storageRes = await this.gateway.post("/storage/send", {
        perfumeIds,
        userRole: "manager",
        userId: dto.userId,
      });
      if (!storageRes.data?.success) throw new Error("Storage failed");

      // Slanje podataka u analytics mikroservis
      const perfumesSold = storageRes.data.packages.map((pkg: any) => ({
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

      // Ažuriranje lokalne baze nakon prodaje
      for (const p of dto.perfumes) {
        const dbEntry = await this.catalogueRepo.findOneBy({ id: p.perfumeId });
        if (dbEntry) {
          dbEntry.perfume_quantity -= p.quantity;
          if (dbEntry.perfume_quantity < 0) dbEntry.perfume_quantity = 0;
          await this.catalogueRepo.save(dbEntry);
        }
      }

      return { success: true, qrCode };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  }
}
