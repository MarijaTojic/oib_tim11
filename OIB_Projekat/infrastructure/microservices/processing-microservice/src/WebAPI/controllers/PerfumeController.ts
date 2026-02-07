import { Router, Request, Response } from "express";
//import { ILogService } from "../../../../log-microservice/src/Domain/services/ILogService";
import { IPerfumeService } from "../../Domain/services/IPerfumeService";
import { PerfumeType } from "../../Domain/enums/PerfumeType";

export class PerfumeController {
  private readonly router: Router;

  constructor(
    private readonly perfumesService: IPerfumeService,
    //private readonly logger: ILogService
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get("/perfumes/:type/:quantity", this.getPerfumeByTypeAndQuantity.bind(this));
    this.router.get("/perfumes", this.getAllPerfumes.bind(this));
    this.router.post("/processing", this.plantProcessing.bind(this));
  }

  private async getPerfumeByTypeAndQuantity(req: Request, res: Response): Promise<void>{
    try{
      const typeParam = req.params.type;
      const quantity = parseFloat(req.params.quantity);
      const type = PerfumeType[typeParam as  keyof typeof PerfumeType];
      //this.logger.log('Fetching perfume with type');
      const perfume = await this.perfumesService.getPerfumeByTypeAndQuantity(type, quantity);
      res.status(200).json(perfume);
    } catch (err){
      //this.logger.log((err as Error).message);
      res.status(400).json({message: (err as Error).message});
    }
  }

  private async getAllPerfumes(req: Request, res: Response): Promise<void>{
    try{
      //this.logger.log("Fetching all perfumes");
      const perfumes = await this.perfumesService.getAllPerfumes();
      res.status(200).json(perfumes);
    } catch (err){
      //this.logger.log((err as Error).message);
      res.status(400).json({message: (err as Error).message});
    }
  }

  private async plantProcessing(req: Request, res: Response): Promise<void>{
    try{
        const { plantId, quantity, volume, perfumeType } = req.body;

        if(!plantId || !quantity || !volume || !perfumeType){
          res.status(400).json({message: "Missing parameters!"});
          return;
        }

        const processedPerfumes = await this.perfumesService.plantProcessing(plantId, Number(quantity), Number(volume), perfumeType);
        res.status(200).json(processedPerfumes);
    } catch (err){
      //this.logger.log((err as Error).message);
      res.status(400).json({message: (err as Error).message});
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}