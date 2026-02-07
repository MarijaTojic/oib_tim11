import { Router, Request, Response } from "express";
//import { ILogService } from "../../../log-microservice/src/Domain/services/ILogService";
import { IPlantsService } from "../Domain/services/IPlantsService";
import { PlantDTO } from "../Domain/DTOs/PlantDTO";
import { PlantStatus } from "../Domain/enums/PlantStatus";

export class PlantsController {
  private readonly router: Router;

  constructor(
    private readonly plantsService: IPlantsService,
   // private readonly logger: ILogService
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post("/plants", this.createPlant.bind(this));
    this.router.patch("/plants/:id/aromatic", this.changeAromaticOilStrength.bind(this));
    this.router.post("/plants/harvest", this.harvestPlants.bind(this));
    this.router.post("/internal/plant-request", this.handleInternalPlantRequest.bind(this));
    this.router.get("/plants", this.getAllPlants.bind(this));
    this.router.get("/plants/:id", this.getPlantById.bind(this));
  }


  /** POST create new plant */
    private async createPlant(req: Request, res: Response): Promise<void> {
      try {
        const plantDTO: PlantDTO = req.body;

        const createdPlant = await this.plantsService.createPlant(plantDTO);

             /* await this.logger.log(
                    `[production] CREATE_PLANT - SUCCESS: Plant ${createdPlant.commonName} successfully planted`
              );*/

        res.status(201).json(createdPlant);
      } catch (err) {
              /*await this.logger.log(
                `[production] CREATE_PLANT - FAIL: ${(err as Error).message}`
              );*/

        res.status(500).json({ message: (err as Error).message });
      }
    }

  /** PATCH change aromatic oil strength by percentage */
      private async changeAromaticOilStrength(req: Request, res: Response): Promise<void> {
        try {
          const id = parseInt(req.params.id, 10);
          const { percentage } = req.body;

          const updatedPlant =
            await this.plantsService.changeAromaticOilStrength(id, percentage);

          /*await this.logger.log(
            `[production] CHANGE_AROMA - SUCCESS: Aromatic oil strength changed by ${percentage}% for plant ${id}`
          );*/

          res.status(200).json(updatedPlant);
        } catch (err) {
         /* await this.logger.log(
            `[production] CHANGE_AROMA - FAIL: ${(err as Error).message}`
          );*/

          res.status(404).json({ message: (err as Error).message });
        }
      }

  /** POST harvest plants */
    private async harvestPlants(req: Request, res: Response): Promise<void> {
      try {
        const { commonName, quantity } = req.body;

        const harvested =
          await this.plantsService.harvestPlants(commonName, quantity);

       /* await this.logger.log(
          `[production] HARVEST - SUCCESS: Harvested ${quantity} plants of type ${commonName}`
        );*/

        res.status(200).json(harvested);
      } catch (err) {
        /*await this.logger.log(
          `[production] HARVEST - FAIL: ${(err as Error).message}`
        );*/

        res.status(400).json({ message: (err as Error).message });
      }
    }


 private async handleInternalPlantRequest(req: Request, res: Response): Promise<void> {
  try {
    const { commonName, previousOilStrength } = req.body;

    const newPlant = await this.plantsService.createPlant({
      commonName,
      latinName: "",
      aromaticOilStrength: 0,
      countryOfOrigin: "",
      status: PlantStatus.PLANTED,
      quantity: 1,
      //id: 0
    });

    let adjustedStrength = newPlant.aromaticOilStrength;
    let adjustmentNote = "No adjustment (previous ≤ 4.0)";

    if (previousOilStrength && previousOilStrength > 4.0) {
    
      const factor = 4.0 / previousOilStrength;   

      adjustedStrength = Number((newPlant.aromaticOilStrength * factor).toFixed(2));
      
      const percentageToApply = factor * 100;     
      await this.plantsService.changeAromaticOilStrength(newPlant.id!, percentageToApply);

      adjustmentNote = `Adjusted proportionally: ${previousOilStrength.toFixed(2)} → ${adjustedStrength.toFixed(2)} (${(factor * 100).toFixed(1)}% of original)`;
     
    }
    /*await this.logger.log(
      `[production] INTERNAL_PLANT_REQUEST - SUCCESS: ${commonName} | ${adjustmentNote}`
    );*/

    res.status(201).json({
      ...this.plantsService.toDTO(newPlant),
      adjustedOilStrength: adjustedStrength,
      adjustmentNote
    });
  } catch (err) {
    console.error(err);
    //await this.logger.log(`[production] INTERNAL_PLANT_REQUEST - FAIL: ${(err as Error).message}`);
    res.status(500).json({ message: (err as Error).message });
  }
}

  private async getAllPlants(req: Request, res: Response): Promise<void> {
  try {
    const plants = await this.plantsService.getAllPlants();
    res.json(plants);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
}

private async getPlantById(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    const plant = await this.plantsService.getPlantById(id);
    res.json(plant);
  } catch (err) {
    res.status(404).json({ message: (err as Error).message });
  }
}

  public getRouter(): Router {
    return this.router;
  }
}
