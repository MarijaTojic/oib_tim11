import { Request, Response, Router } from "express";
import axios from "axios";
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
    this.router.get("/users", authenticate, authorize("admin", "seller", "manager"), this.getAllUsers.bind(this));
    this.router.get("/users/:id", authenticate, authorize("admin", "seller", "manager"), this.getUserById.bind(this));
    this.router.put("/users/:id", authenticate, authorize("admin", "seller", "manager"), this.updateUser.bind(this));
    this.router.delete("/users/:id", authenticate, authorize("admin", "seller", "manager"), this.deleteUser.bind(this));

    // Production routes (seller, manager)
    this.router.get("/plants", authenticate, authorize("seller", "manager"), this.getAllPlants.bind(this));
    this.router.get("/plants/:id", authenticate, authorize("seller", "manager"), this.getPlantById.bind(this));
    this.router.post("/plants", authenticate, authorize("seller", "manager"), this.plantNewPlant.bind(this));
    this.router.post("/plants/harvest", authenticate, authorize("seller", "manager"), this.harvestPlants.bind(this));
    this.router.patch("/plants/:id/aromatic", authenticate, authorize("seller", "manager"), this.adjustOilStrength.bind(this));

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
    this.router.get("/performance/:id/pdf", authenticate, authorize("admin"), this.downloadPerformancePdf.bind(this));

    // Analytics routes (admin only)
    this.router.post(
      "/analytics/receipts",
      this.allowInternalOrRoles("ANALYTICS_INTERNAL_KEY", "admin"),
      this.createReceipt.bind(this)
    );
    this.router.get("/analytics/receipts/:userId", authenticate, authorize("admin"), this.getReceipts.bind(this));
    this.router.get("/analytics/receipts/detail/:id", authenticate, authorize("admin"), this.getReceiptById.bind(this));
    this.router.delete("/analytics/receipts/:id", authenticate, authorize("admin"), this.deleteReceipt.bind(this));
    this.router.post("/analytics/reports", authenticate, authorize("admin"), this.createReportAnalysis.bind(this));
    this.router.get("/analytics/reports", authenticate, authorize("admin"), this.getReportAnalysisList.bind(this));
    this.router.get("/analytics/reports/:id", authenticate, authorize("admin"), this.getReportAnalysisById.bind(this));
    this.router.get("/analytics/reports/:id/pdf", authenticate, authorize("admin"), this.downloadReportAnalysisPdf.bind(this));
    this.router.delete("/analytics/reports/:id", authenticate, authorize("admin"), this.deleteReportAnalysis.bind(this));
    this.router.patch("/analytics/reports/:id/export", authenticate, authorize("admin"), this.exportReportAnalysis.bind(this));
    this.router.post("/analytics/analysis/sales", authenticate, authorize("admin"), this.calculateSalesAnalysis.bind(this));
    this.router.get("/analytics/analysis/top-ten", authenticate, authorize("admin"), this.getTopTenPerfumes.bind(this));
    this.router.get("/analytics/analysis/trend", authenticate, authorize("admin"), this.getSalesTrend.bind(this));

    // Routing routes (admin, seller, manager)
    this.router.get("/routing/routes", authenticate, authorize("admin", "seller", "manager"), this.getRouteMap.bind(this));
    this.router.get("/routing/health", authenticate, authorize("admin", "seller", "manager"), this.getRouteHealth.bind(this));

    // Log routes (admin or internal)
    this.router.post("/logs", this.allowInternalOrAdmin.bind(this), this.createLog.bind(this));
    this.router.get("/logs", this.allowInternalOrAdmin.bind(this), this.getAllLogs.bind(this));
    this.router.get("/logs/:id", this.allowInternalOrAdmin.bind(this), this.getLogById.bind(this));
    this.router.put("/logs/:id", this.allowInternalOrAdmin.bind(this), this.updateLog.bind(this));
    this.router.delete("/logs/:id", this.allowInternalOrAdmin.bind(this), this.deleteLog.bind(this));

    // Sales routes (seller, manager)
    this.router.get("/sales/catalogue", authenticate, authorize("seller", "manager"),this.getCatalogue.bind(this));
    this.router.post("/sales/sell", authenticate, authorize("seller", "manager"), this.sell.bind(this));

    // Packaging routes (seller, manager)
    this.router.post("/packaging", authenticate, authorize("seller", "manager"), this.packagePerfumes.bind(this));
    this.router.post("/packaging/send", authenticate, authorize("seller", "manager"), this.sendAmbalage.bind(this));

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
      res.status(result.success ? 200 : 401).json(result);
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
      res.status(result.success ? 201 : 400).json(result);
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
      const id = this.parseParamToInt(req.params.id);
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
      const id = this.parseParamToInt(req.params.id);
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
      const id = this.parseParamToInt(req.params.id);
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
      const id = this.parseParamToInt(req.params.id);
      const plant = await this.gatewayService.getPlantById(id);
      res.status(200).json(plant);
    } catch (err) {
      res.status(404).json({ message: (err as Error).message });
    }
  }

  private async plantNewPlant(req: Request, res: Response): Promise<void> {
    try {
      console.log(req.body)
      const plant = await this.gatewayService.plantNewPlant(req.body);
      res.status(201).json(plant);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async harvestPlants(req: Request, res: Response): Promise<void> {
    try {
      const { commonName, quantity } = req.body;
      const plants = await this.gatewayService.harvestPlants(commonName, quantity);
      res.status(200).json(plants);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async adjustOilStrength(req: Request, res: Response): Promise<void> {
    try {
      const id = this.parseParamToInt(req.params.id);
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
      const id = this.parseParamToInt(req.params.id);
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
      this.handleServiceError(res, err, "Performance");
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
      this.handleServiceError(res, err, "Performance");
    }
  }

  /**
   * GET /api/v1/performance/:id
   * Get performance result by ID
   */
  private async getPerformanceResultById(req: Request, res: Response): Promise<void> {
    try {
      const id = this.parseParamToInt(req.params.id);
      const result = await this.gatewayService.getPerformanceResultById(id);
      res.status(200).json(result);
    } catch (err) {
      this.handleServiceError(res, err, "Performance", 404);
    }
  }

  /**
   * DELETE /api/v1/performance/:id
   * Delete performance result
   */
  private async deletePerformanceResult(req: Request, res: Response): Promise<void> {
    try {
      const id = this.parseParamToInt(req.params.id);
      await this.gatewayService.deletePerformanceResult(id);
      res.status(204).send();
    } catch (err) {
      this.handleServiceError(res, err, "Performance");
    }
  }

  /**
   * GET /api/v1/performance/:id/compare
   * Compare algorithms from simulation
   */
  private async comparePerformanceAlgorithms(req: Request, res: Response): Promise<void> {
    try {
      const id = this.parseParamToInt(req.params.id);
      const comparison = await this.gatewayService.comparePerformanceAlgorithms(id);
      res.status(200).json(comparison);
    } catch (err) {
      this.handleServiceError(res, err, "Performance");
    }
  }

  /**
   * PATCH /api/v1/performance/:id/export
   * Update performance result export date
   */
  private async exportPerformanceResult(req: Request, res: Response): Promise<void> {
    try {
      const id = this.parseParamToInt(req.params.id);
      await this.gatewayService.exportPerformanceResult(id);
      res.status(200).json({ message: 'Export date updated' });
    } catch (err) {
      this.handleServiceError(res, err, "Performance");
    }
  }

  /**
   * GET /api/v1/performance/:id/pdf
   * Download performance report PDF
   */
  private async downloadPerformancePdf(req: Request, res: Response): Promise<void> {
    try {
      const id = this.parseParamToInt(req.params.id);
      const result = await this.gatewayService.getPerformancePdf(id);
      res.setHeader("Content-Type", result.contentType);
      res.status(200).send(Buffer.from(result.data));
    } catch (err) {
      this.handleServiceError(res, err, "Performance");
    }
  }

  // =========================
  // Analytics Receipts handlers
  // =========================
  private async createReceipt(req: Request, res: Response): Promise<void> {
    try {
      const receipt = await this.gatewayService.createReceipt(req.body);
      res.status(201).json({ success: true, data: receipt });
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getReceipts(req: Request, res: Response): Promise<void> {
    try {
      const userId = this.parseParamToInt(req.params.userId);
      const { startDate, endDate } = req.query;
      const receipts = await this.gatewayService.getReceipts(
        userId,
        startDate ? String(startDate) : undefined,
        endDate ? String(endDate) : undefined
      );
      res.status(200).json({ success: true, data: receipts });
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getReceiptById(req: Request, res: Response): Promise<void> {
    try {
      const id = this.parseParamToInt(req.params.id);
      const receipt = await this.gatewayService.getReceiptById(id);
      res.status(200).json({ success: true, data: receipt });
    } catch (err) {
      res.status(404).json({ message: (err as Error).message });
    }
  }

  private async deleteReceipt(req: Request, res: Response): Promise<void> {
    try {
      const id = this.parseParamToInt(req.params.id);
      await this.gatewayService.deleteReceipt(id);
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  // =========================
  // Analytics handlers
  // =========================
  private async createReportAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const report = await this.gatewayService.createReportAnalysis(req.body);
      res.status(201).json({ success: true, data: report });
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getReportAnalysisList(req: Request, res: Response): Promise<void> {
    try {
      const { limit } = req.query;
      const reports = await this.gatewayService.getReportAnalysisList(limit ? Number(limit) : undefined);
      res.status(200).json({ success: true, data: reports });
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getReportAnalysisById(req: Request, res: Response): Promise<void> {
    try {
      const id = this.parseParamToInt(req.params.id);
      const report = await this.gatewayService.getReportAnalysisById(id);
      res.status(200).json({ success: true, data: report });
    } catch (err) {
      res.status(404).json({ message: (err as Error).message });
    }
  }

  private async downloadReportAnalysisPdf(req: Request, res: Response): Promise<void> {
    try {
      const id = this.parseParamToInt(req.params.id);
      const result = await this.gatewayService.getReportAnalysisPdf(id);
      res.setHeader("Content-Type", result.contentType);
      res.status(200).send(Buffer.from(result.data));
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async deleteReportAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const id = this.parseParamToInt(req.params.id);
      await this.gatewayService.deleteReportAnalysis(id);
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async exportReportAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const id = this.parseParamToInt(req.params.id);
      await this.gatewayService.exportReportAnalysis(id);
      res.status(200).json({ success: true, message: "Report export updated" });
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async calculateSalesAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.gatewayService.calculateSalesAnalysis(req.body);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getTopTenPerfumes(_req: Request, res: Response): Promise<void> {
    try {
      const result = await this.gatewayService.getTopTenPerfumes();
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getSalesTrend(req: Request, res: Response): Promise<void> {
    try {
      const { days } = req.query;
      const result = await this.gatewayService.getSalesTrend(days ? Number(days) : undefined);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  // =========================
  // Routing handlers
  // =========================
  private async getRouteMap(_req: Request, res: Response): Promise<void> {
    try {
      const routes = this.gatewayService.getRouteMap();
      res.status(200).json({ success: true, data: routes });
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getRouteHealth(_req: Request, res: Response): Promise<void> {
    try {
      const routes = await this.gatewayService.getRouteHealth();
      res.status(200).json({ success: true, data: routes });
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  // =========================
  // Log handlers
  // =========================
  private async createLog(req: Request, res: Response): Promise<void> {
    try {
      const log = await this.gatewayService.createLog(req.body);
      res.status(201).json({ success: true, log });
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getAllLogs(_req: Request, res: Response): Promise<void> {
    try {
      const logs = await this.gatewayService.getAllLogs();
      res.status(200).json({ success: true, logs });
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getLogById(req: Request, res: Response): Promise<void> {
    try {
      const id = this.parseParamToInt(req.params.id);
      const log = await this.gatewayService.getLogById(id);
      res.status(200).json({ success: true, log });
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async updateLog(req: Request, res: Response): Promise<void> {
    try {
      const id = this.parseParamToInt(req.params.id);
      const log = await this.gatewayService.updateLog(id, req.body);
      res.status(200).json({ success: true, log });
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async deleteLog(req: Request, res: Response): Promise<void> {
    try {
      const id = this.parseParamToInt(req.params.id);
      await this.gatewayService.deleteLog(id);
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  // =========================
  // Sales handlers
  // =========================
  private async getCatalogue(req: Request, res: Response): Promise<void> {
    try {
      const catalogue = await this.gatewayService.getCatalogue();
      res.status(200).json(catalogue);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async sell(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.gatewayService.sell(req.body);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  //Packaging
  private async packagePerfumes(req: Request, res: Response): Promise<void>{
    try{
        const { perfumeType, quantity, senderAddress, stroageID } = req.body;

      const result = await this.gatewayService.packagingPerfumes(
        perfumeType,
        quantity,
        senderAddress,
        stroageID
    );

    res.status(201).json(result);
    } catch(err){
      res.status(500).json({message: (err as Error).message});
    }
    
  }

  private async sendAmbalage(req: Request, res: Response): Promise<void> {
    try {
      const { storageID, perfumeType, quantity, senderAddress } = req.body;

      if (!storageID) {
        res.status(400).json({ message: "Missing storageID!" });
        return;
      }

      const sent = await this.gatewayService.sendAmbalage(Number(storageID),);

      if (!sent) {
        res.status(500).json({ message: "Failed to send or create packaging" });
        return;
      }

      res.status(200).json(sent);
    } catch (err) {
      console.error("GatewayController sendAmbalage error:", err);
      res.status(500).json({ message: (err as Error).message });
    }
  }

  public getRouter(): Router {
    return this.router;
  }

  private parseParamToInt(param: string | string[]): number {
    const value = Array.isArray(param) ? param[0] : param;
    return parseInt(value, 10);
  }

  private allowInternalOrRoles(internalKeyEnv: string, ...roles: string[]) {
    return (req: Request, res: Response, next: () => void): void => {
      const internalKey = process.env[internalKeyEnv];
      const providedKey = req.header("x-internal-key");

      if (internalKey && providedKey === internalKey) {
        next();
        return;
      }

      authenticate(req, res, () => authorize(...roles)(req, res, next));
    };
  }

  private allowInternalOrAdmin(req: Request, res: Response, next: () => void): void {
    this.allowInternalOrRoles("LOG_INTERNAL_KEY", "admin")(req, res, next);
  }

  private handleServiceError(
    res: Response,
    err: unknown,
    serviceName: string,
    fallbackStatus = 500
  ): void {
    if (axios.isAxiosError(err)) {
      if (!err.response) {
        res.status(503).json({ message: `${serviceName} service unavailable` });
        return;
      }

      const message =
        (err.response.data as { message?: string } | undefined)?.message ??
        err.message ??
        `${serviceName} service error`;

      res.status(err.response.status).json({ message });
      return;
    }

    const message = err instanceof Error ? err.message : `${serviceName} service error`;
    res.status(fallbackStatus).json({ message });
  }
}
