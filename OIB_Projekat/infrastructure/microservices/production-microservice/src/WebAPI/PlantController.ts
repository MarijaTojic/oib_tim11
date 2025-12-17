import { Router, Request, Response } from "express";
import { ILogerService } from "../Domain/services/ILogerService";
import { IPlantsService } from "../Domain/services/IPlantsService";
import { PlantDTO } from "../Domain/DTOs/PlantDTO";

export class PlantsController {
  private readonly router: Router;

  constructor(
    private readonly plantsService: IPlantsService,
    private readonly logger: ILogerService
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post("/plants", this.createPlant.bind(this));
    this.router.put("/plants/:id/aroma", this.changeAromaticOilStrength.bind(this));
    this.router.post("/plants/harvest", this.harvestPlants.bind(this));
  }


  /** POST create new plant */
  private async createPlant(req: Request, res: Response): Promise<void> {
    try {
      const plantDTO: PlantDTO = req.body;
      this.logger.log("Creating new plant");
      const createdPlant = await this.plantsService.createPlant(plantDTO);
      res.status(201).json(createdPlant);
    } catch (err) {
      this.logger.log((err as Error).message);
      res.status(500).json({ message: (err as Error).message });
    }
  }

  /** PUT change aromatic oil strength by percentage */
  private async changeAromaticOilStrength(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const { percentage } = req.body;

      this.logger.log(
        `Changing aromatic oil strength for plant ${id} by ${percentage}%`
      );

      const updatedPlant =
        await this.plantsService.changeAromaticOilStrength(id, percentage);

      res.status(200).json(updatedPlant);
    } catch (err) {
      this.logger.log((err as Error).message);
      res.status(404).json({ message: (err as Error).message });
    }
  }

  /** POST harvest plants */
  private async harvestPlants(req: Request, res: Response): Promise<void> {
    try {
      const { commonName, quantity } = req.body;

      this.logger.log(
        `Harvesting ${quantity} plants with name ${commonName}`
      );

      const harvested =
        await this.plantsService.harvestPlants(commonName, quantity);

      res.status(200).json(harvested);
    } catch (err) {
      this.logger.log((err as Error).message);
      res.status(400).json({ message: (err as Error).message });
    }
  }


  public getRouter(): Router {
    return this.router;
  }
}
