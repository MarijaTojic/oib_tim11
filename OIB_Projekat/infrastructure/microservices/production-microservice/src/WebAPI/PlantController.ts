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

        const createdPlant = await this.plantsService.createPlant(plantDTO);

              await this.logger.log(
                    `[production] CREATE_PLANT - SUCCESS: Plant ${createdPlant.commonName} successfully planted`
              );

        res.status(201).json(createdPlant);
      } catch (err) {
              await this.logger.log(
                `[production] CREATE_PLANT - FAIL: ${(err as Error).message}`
              );

        res.status(500).json({ message: (err as Error).message });
      }
    }



  /** PUT change aromatic oil strength by percentage */
      private async changeAromaticOilStrength(req: Request, res: Response): Promise<void> {
        try {
          const id = parseInt(req.params.id, 10);
          const { percentage } = req.body;

          const updatedPlant =
            await this.plantsService.changeAromaticOilStrength(id, percentage);

          await this.logger.log(
            `[production] CHANGE_AROMA - SUCCESS: Aromatic oil strength changed by ${percentage}% for plant ${id}`
          );

          res.status(200).json(updatedPlant);
        } catch (err) {
          await this.logger.log(
            `[production] CHANGE_AROMA - FAIL: ${(err as Error).message}`
          );

          res.status(404).json({ message: (err as Error).message });
        }
      }

  /** POST harvest plants */
    private async harvestPlants(req: Request, res: Response): Promise<void> {
      try {
        const { commonName, quantity } = req.body;

        const harvested =
          await this.plantsService.harvestPlants(commonName, quantity);

        await this.logger.log(
          `[production] HARVEST - SUCCESS: Harvested ${quantity} plants of type ${commonName}`
        );

        res.status(200).json(harvested);
      } catch (err) {
        await this.logger.log(
          `[production] HARVEST - FAIL: ${(err as Error).message}`
        );

        res.status(400).json({ message: (err as Error).message });
      }
    }



  public getRouter(): Router {
    return this.router;
  }
}
