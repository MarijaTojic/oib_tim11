import { Request, Response, Router } from "express";
import { IGatewayService } from "../../Domain/services/IGatewayService";
import { LoginUserDTO } from "../../Domain/DTOs/LoginUserDTO";
import { RegistrationUserDTO } from "../../Domain/DTOs/RegistrationUserDTO";
import { authenticate } from "../../Database/Middlewares/authentification/AuthMiddleware";
import { authorize } from "../../Database/Middlewares/authorization/AuthorizeMiddleware";

export class GatewayController {
  private router: Router;
  private gatewayService: IGatewayService;

  constructor(gatewayService: IGatewayService) {
    this.router = Router();
    this.gatewayService = gatewayService;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Auth routes (public)
    this.router.post("/auth/login", this.login.bind(this));
    this.router.post("/auth/register", this.register.bind(this));

    // User routes (admin only)
    this.router.get("/users", authenticate, authorize("admin"), this.getAllUsers.bind(this));
    this.router.get("/users/:id", authenticate, authorize("admin", "seller", "manager"), this.getUserById.bind(this));
    this.router.put("/users/:id", authenticate, authorize("admin"), this.updateUser.bind(this));
    this.router.delete("/users/:id", authenticate, authorize("admin"), this.deleteUser.bind(this));

    // Production routes (seller, manager)
    this.router.get("/plants", authenticate, authorize("seller", "manager"), this.getAllPlants.bind(this));
    this.router.get("/plants/:id", authenticate, authorize("seller", "manager"), this.getPlantById.bind(this));
    this.router.post("/plants", authenticate, authorize("seller", "manager"), this.plantNewPlant.bind(this));
    this.router.post("/plants/harvest", authenticate, authorize("seller", "manager"), this.harvestPlants.bind(this));
    this.router.patch("/plants/:id/oil-strength", authenticate, authorize("seller", "manager"), this.adjustOilStrength.bind(this));

    // Processing routes (seller, manager)
    this.router.get("/perfumes", authenticate, authorize("seller", "manager"), this.getAllPerfumes.bind(this));
    this.router.get("/perfumes/:id", authenticate, authorize("seller", "manager"), this.getPerfumeById.bind(this));
    this.router.post("/processing/start", authenticate, authorize("seller", "manager"), this.startProcessing.bind(this));
    this.router.get("/perfumes/by-type", authenticate, authorize("seller", "manager"), this.getPerfumesByType.bind(this));

    // Packaging routes (seller, manager)
    this.router.get("/packages", authenticate, authorize("seller", "manager"), this.getAllPackages.bind(this));
    this.router.get("/packages/:id", authenticate, authorize("seller", "manager"), this.getPackageById.bind(this));
    this.router.post("/packages/pack", authenticate, authorize("seller", "manager"), this.packPerfumes.bind(this));
    this.router.post("/packages/:id/send", authenticate, authorize("seller", "manager"), this.sendPackageToStorage.bind(this));

    // Storage routes (seller, manager)
    this.router.get("/storages", authenticate, authorize("seller", "manager"), this.getAllStorages.bind(this));
    this.router.get("/storages/:id", authenticate, authorize("seller", "manager"), this.getStorageById.bind(this));
    this.router.post("/storages/send-packages", authenticate, authorize("seller", "manager"), this.sendPackagesFromStorage.bind(this));

    // Sales routes (seller, manager)
    this.router.get("/receipts", authenticate, authorize("seller", "manager"), this.getAllReceipts.bind(this));
    this.router.get("/receipts/:id", authenticate, authorize("seller", "manager"), this.getReceiptById.bind(this));
    this.router.post("/sales", authenticate, authorize("seller", "manager"), this.createSale.bind(this));

    // Log routes (admin)
    this.router.get("/logs", authenticate, authorize("admin"), this.getAllLogs.bind(this));
    this.router.get("/logs/:id", authenticate, authorize("admin"), this.getLogById.bind(this));

    // Analytics routes (admin)
    this.router.get("/analytics/sales", authenticate, authorize("admin"), this.getSalesAnalytics.bind(this));
    this.router.get("/analytics/performance", authenticate, authorize("admin"), this.getPerformanceAnalytics.bind(this));
  }

  // =========================
  // Auth handlers
  // =========================
  /**
   * POST /api/v1/auth/login
   * Authenticates a user
   */
  private async login(req: Request, res: Response): Promise<void> {
    try {
      const data: LoginUserDTO = req.body;
      const result = await this.gatewayService.login(data);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  /**
   * POST /api/v1/auth/register
   * Registers a new user
   */
  private async register(req: Request, res: Response): Promise<void> {
    try {
      const data: RegistrationUserDTO = req.body;
      const result = await this.gatewayService.register(data);
      res.status(201).json(result);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  // =========================
  // User handlers
  // =========================
  /**
   * GET /api/v1/users
   * Get all users
   */
  private async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.gatewayService.getAllUsers();
      res.status(200).json(users);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  /**
   * GET /api/v1/users/:id
   * Get user by ID
   */
  private async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const user = await this.gatewayService.getUserById(id);
      res.status(200).json(user);
    } catch (err) {
      res.status(404).json({ message: (err as Error).message });
    }
  }

  /**
   * PUT /api/v1/users/:id
   * Update user
   */
  private async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const user = await this.gatewayService.updateUser(id, req.body);
      res.status(200).json(user);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  /**
   * DELETE /api/v1/users/:id
   * Delete user
   */
  private async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      await this.gatewayService.deleteUser(id);
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  // =========================
  // Production (Plants) handlers
  // =========================
  private async getAllPlants(req: Request, res: Response): Promise<void> {
    try {
      const plants = await this.gatewayService.getAllPlants();
      res.status(200).json(plants);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getPlantById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const plant = await this.gatewayService.getPlantById(id);
      res.status(200).json(plant);
    } catch (err) {
      res.status(404).json({ message: (err as Error).message });
    }
  }

  private async plantNewPlant(req: Request, res: Response): Promise<void> {
    try {
      const plant = await this.gatewayService.plantNewPlant(req.body);
      res.status(201).json(plant);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async harvestPlants(req: Request, res: Response): Promise<void> {
    try {
      const { plantId, quantity } = req.body;
      const plants = await this.gatewayService.harvestPlants(plantId, quantity);
      res.status(200).json(plants);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async adjustOilStrength(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const { percentage } = req.body;
      const plant = await this.gatewayService.adjustAromaticOilStrength(id, percentage);
      res.status(200).json(plant);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  // =========================
  // Processing (Perfumes) handlers
  // =========================
  private async getAllPerfumes(req: Request, res: Response): Promise<void> {
    try {
      const perfumes = await this.gatewayService.getAllPerfumes();
      res.status(200).json(perfumes);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getPerfumeById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const perfume = await this.gatewayService.getPerfumeById(id);
      res.status(200).json(perfume);
    } catch (err) {
      res.status(404).json({ message: (err as Error).message });
    }
  }

  private async startProcessing(req: Request, res: Response): Promise<void> {
    try {
      const { plantId, quantity, volume, perfumeType } = req.body;
      const perfumes = await this.gatewayService.startProcessing(plantId, quantity, volume, perfumeType);
      res.status(201).json(perfumes);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getPerfumesByType(req: Request, res: Response): Promise<void> {
    try {
      const { type, quantity } = req.query;
      const perfumes = await this.gatewayService.getPerfumesByType(type as string, Number(quantity));
      res.status(200).json(perfumes);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  // =========================
  // Packaging handlers
  // =========================
  private async getAllPackages(req: Request, res: Response): Promise<void> {
    try {
      const packages = await this.gatewayService.getAllPackages();
      res.status(200).json(packages);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getPackageById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const pkg = await this.gatewayService.getPackageById(id);
      res.status(200).json(pkg);
    } catch (err) {
      res.status(404).json({ message: (err as Error).message });
    }
  }

  private async packPerfumes(req: Request, res: Response): Promise<void> {
    try {
      const { perfumeIds, storageId } = req.body;
      const pkg = await this.gatewayService.packPerfumes(perfumeIds, storageId);
      res.status(201).json(pkg);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async sendPackageToStorage(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const pkg = await this.gatewayService.sendPackageToStorage(id);
      res.status(200).json(pkg);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  // =========================
  // Storage handlers
  // =========================
  private async getAllStorages(req: Request, res: Response): Promise<void> {
    try {
      const storages = await this.gatewayService.getAllStorages();
      res.status(200).json(storages);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getStorageById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const storage = await this.gatewayService.getStorageById(id);
      res.status(200).json(storage);
    } catch (err) {
      res.status(404).json({ message: (err as Error).message });
    }
  }

  private async sendPackagesFromStorage(req: Request, res: Response): Promise<void> {
    try {
      const { quantity } = req.body;
      const packages = await this.gatewayService.sendPackagesFromStorage(quantity);
      res.status(200).json(packages);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  // =========================
  // Sales handlers
  // =========================
  private async getAllReceipts(req: Request, res: Response): Promise<void> {
    try {
      const receipts = await this.gatewayService.getAllReceipts();
      res.status(200).json(receipts);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getReceiptById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const receipt = await this.gatewayService.getReceiptById(id);
      res.status(200).json(receipt);
    } catch (err) {
      res.status(404).json({ message: (err as Error).message });
    }
  }

  private async createSale(req: Request, res: Response): Promise<void> {
    try {
      const receipt = await this.gatewayService.createSale(req.body);
      res.status(201).json(receipt);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  // =========================
  // Log handlers
  // =========================
  private async getAllLogs(req: Request, res: Response): Promise<void> {
    try {
      const logs = await this.gatewayService.getAllLogs();
      res.status(200).json(logs);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getLogById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const log = await this.gatewayService.getLogById(id);
      res.status(200).json(log);
    } catch (err) {
      res.status(404).json({ message: (err as Error).message });
    }
  }

  // =========================
  // Analytics handlers
  // =========================
  private async getSalesAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const analytics = await this.gatewayService.getSalesAnalytics(req.query);
      res.status(200).json(analytics);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getPerformanceAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const analytics = await this.gatewayService.getPerformanceAnalytics();
      res.status(200).json(analytics);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}
