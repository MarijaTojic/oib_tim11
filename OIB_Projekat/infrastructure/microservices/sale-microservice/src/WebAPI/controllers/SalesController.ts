import { Router, Request, Response } from "express";
import { ISalesService } from "../../Domain/services/ISalesService";
import { ILogService } from "../../../../log-microservice/src/Domain/services/ILogService";

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
    this.router.post("/sales/sell", this.sell.bind(this));
  }

  private async getCatalogue(req: Request, res: Response): Promise<void> {
    try {
      const catalogue = await this.salesService.getCatalogue();
      res.status(200).json(catalogue);
    } catch (err) {
      await this.logger.log(`ERROR: Failed to fetch catalogue - ${(err as Error).message}`);
      res.status(500).json({ message: "Failed to fetch catalogue" });
    }
  }

  private async sell(req: Request, res: Response): Promise<void> {
    try {
      const saleDto = req.body;

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
