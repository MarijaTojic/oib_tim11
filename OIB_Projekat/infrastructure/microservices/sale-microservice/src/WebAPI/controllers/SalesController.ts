import { Router, Request, Response } from "express";
import { ISalesService } from "../../Domain/services/ISalesService";
import { ILogService } from "../../../../log-microservice/src/Domain/services/ILogService";
import { CreateSaleDTO } from "../../Domain/DTOs/CreateSaleDTO";
import { SalesValidator } from "../../Services/SalesValidator";

export class SalesController {
  private readonly router: Router;

  constructor(
    private readonly salesService: ISalesService,
    private readonly logger: ILogService,
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get("/sales/catalogue", this.getCatalogue.bind(this));
    this.router.post("/sales/catalogue/sync", this.syncCatalogue.bind(this));
    this.router.post("/sales/sell", this.sell.bind(this));
  }

  /** GET /sales/catalogue - prikazuje katalog iz tvoje baze */
  private async getCatalogue(req: Request, res: Response): Promise<void> {
    try {
      const catalogue = await this.salesService.getCatalogue();
      res.status(200).json(catalogue);
    } catch (err) {
      await this.logger.log(`ERROR: Failed to fetch catalogue - ${(err as Error).message}`);
      res.status(500).json({ message: "Failed to fetch catalogue" });
    }
  }

  /** POST /sales/catalogue/sync - preuzima parfeme iz PerfumeService i čuva u svoj katalog */
  private async syncCatalogue(req: Request, res: Response): Promise<void> {
    try {
      const syncedCatalogue = await this.salesService.syncFromPerfumeService();
      await this.logger.log(`INFO: Catalogue synced successfully, ${syncedCatalogue.length} items saved`);
      res.status(200).json(syncedCatalogue);
    } catch (err) {
      await this.logger.log(`ERROR: Catalogue sync failed - ${(err as Error).message}`);
      res.status(500).json({ message: "Failed to sync catalogue" });
    }
  }

  /** POST /sales/sell - prodaja parfema i smanjenje količina u tvom katalogu */
  private async sell(req: Request, res: Response): Promise<void> {
    try {
      const saleDto: CreateSaleDTO = req.body;

      // VALIDACIJA DTO koristeći SalesValidator
      const validation = SalesValidator.validateSaleDto(saleDto);
      if (!validation.success) {
        await this.logger.log(`ERROR: Sale validation failed - ${validation.message}`);
        res.status(400).json({ message: validation.message });
        return;
      }

      const result = await this.salesService.sell(saleDto);

      if (!result.success) {
        await this.logger.log(`ERROR: Sale failed for user ${saleDto.userId} - ${result.message}`);
        res.status(400).json(result);
        return;
      }

      await this.logger.log(`INFO: Sale successful for user ${saleDto.userId}`);
      res.status(200).json(result);

    } catch (err) {
      await this.logger.log(`ERROR: Unexpected sale error - ${(err as Error).message}`);
      res.status(500).json({ message: "Unexpected error during sale" });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}
