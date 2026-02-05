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
    this.router.post("/processing", authenticate, authorize("seller", "manager"), this.startProcessing.bind(this));
    this.router.get("/perfumes/by-type", authenticate, authorize("seller", "manager"), this.getPerfumesByType.bind(this));

    // Performance routes (admin only)
    this.router.post("/performance/simulate", authenticate, authorize("admin"), this.runPerformanceSimulation.bind(this));
    this.router.get("/performance", authenticate, authorize("admin"), this.getPerformanceResults.bind(this));
    this.router.get("/performance/:id", authenticate, authorize("admin"), this.getPerformanceResultById.bind(this));
    this.router.delete("/performance/:id", authenticate, authorize("admin"), this.deletePerformanceResult.bind(this));
    this.router.get("/performance/:id/compare", authenticate, authorize("admin"), this.comparePerformanceAlgorithms.bind(this));
    this.router.patch("/performance/:id/export", authenticate, authorize("admin"), this.exportPerformanceResult.bind(this));
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
      console.log("💡 Backend received payload:", req.body);
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
  // Performance handlers
  // =========================
  /**
   * POST /api/v1/performance/simulate
   * Runs performance simulation
   */
  private async runPerformanceSimulation(req: Request, res: Response): Promise<void> {
    try {
      const simulationData = req.body;
      const results = await this.gatewayService.runPerformanceSimulation(simulationData);
      res.status(201).json(results);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  /**
   * GET /api/v1/performance
   * Get all performance results
   */
  private async getPerformanceResults(req: Request, res: Response): Promise<void> {
    try {
      const { limit } = req.query;
      const results = await this.gatewayService.getPerformanceResults(limit ? Number(limit) : undefined);
      res.status(200).json(results);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  /**
   * GET /api/v1/performance/:id
   * Get performance result by ID
   */
  private async getPerformanceResultById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await this.gatewayService.getPerformanceResultById(id);
      res.status(200).json(result);
    } catch (err) {
      res.status(404).json({ message: (err as Error).message });
    }
  }

  /**
   * DELETE /api/v1/performance/:id
   * Delete performance result
   */
  private async deletePerformanceResult(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      await this.gatewayService.deletePerformanceResult(id);
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  /**
   * GET /api/v1/performance/:id/compare
   * Compare algorithms from simulation
   */
  private async comparePerformanceAlgorithms(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const comparison = await this.gatewayService.comparePerformanceAlgorithms(id);
      res.status(200).json(comparison);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  /**
   * PATCH /api/v1/performance/:id/export
   * Update performance result export date
   */
  private async exportPerformanceResult(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      await this.gatewayService.exportPerformanceResult(id);
      res.status(200).json({ message: 'Export date updated' });
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}
