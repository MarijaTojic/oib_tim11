import { Router, Request, Response } from "express";
import { IPackagingService } from "../../Domain/services/IPackagingService";

export class PackagingController {
  private readonly router: Router;

  constructor(private readonly packagingService: IPackagingService) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post("/packaging", this.createPackaging.bind(this));
  }

  private async createPackaging(req: Request, res: Response): Promise<void> {
    try {
      const { perfumeType, quantity, senderAddress, storageID } = req.body;

      if (!perfumeType || !quantity || !senderAddress || !storageID) {
        res.status(400).json({ message: "Missing required fields!" });
        return;
      }

      const packaged = await this.packagingService.perfumePackagin(
        perfumeType,
        Number(quantity),
        senderAddress,
        Number(storageID)
      );

      res.status(201).json(packaged);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: (err as Error).message || "Internal Server Error" });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}