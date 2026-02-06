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
    this.router.post("/packaging/send", this.sendAmbalage.bind(this));
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

  private async sendAmbalage(req: Request, res: Response): Promise<void> {
    try {
        const { storageID, perfumeType, quantity, senderAddress } = req.body;

        if (!storageID) {
            res.status(400).json({ message: "Missing storageID!" });
            return;
        }

        const sid = Number(storageID);
        if (isNaN(sid)) {
            res.status(400).json({ message: "storageID must be a number" });
            return;
        }

        let sent = await this.packagingService.sendAmbalage(sid);

        if (!sent) {
            if (!perfumeType || !quantity || !senderAddress) {
            res.status(400).json({ message: "No available packaging and missing fields to create new!" });
            return;
            }

            const qty = Number(quantity);
            if (isNaN(qty)) {
            res.status(400).json({ message: "Quantity must be a number" });
            return;
            }

            const newPackaging = await this.packagingService.perfumePackagin(
            perfumeType,
            qty,
            senderAddress,
            sid
            );

            sent = newPackaging[0];
        }

        res.status(200).json(sent);
        } catch (err) {
        console.error(err);
        res.status(500).json({ message: (err as Error).message || "Internal Server Error" });
        }
    }

  public getRouter(): Router {
    return this.router;
  }
}