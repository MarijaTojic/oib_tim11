import { Request, Response, Router } from "express";
import { Repository } from "typeorm";
import { Log } from "../../Domain/models/Log";
import { LogDTO } from "../../Domain/DTOs/LogDTO";
import { ILogService } from "../../Domain/services/ILogService";

/**
 * AuditLogController – управља CRUD операцијама за евиденцију догађаја
 */
export class AuthController {
  private router: Router;
  private logService: ILogService;

  constructor(logService: ILogService) {
    this.router = Router();
    this.logService = logService;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post("/audit", this.createLog.bind(this));
    this.router.get("/audit/:id", this.getLogById.bind(this));
    this.router.get("/audit", this.getAllLogs.bind(this));
    this.router.put("/audit/:id", this.updateLog.bind(this));
    this.router.delete("/audit/:id", this.deleteLog.bind(this));
  }

  /**
   * Create a new audit log
   */
  private async createLog(req: Request, res: Response): Promise<void> {
    try {
      const data: LogDTO = req.body;

      // Validation
      if (!data.logtype || !["INFO", "WARNING", "ERROR"].includes(data.logtype)) {
        res.status(400).json({ success: false, message: "Invalid log type" });
        return;
      }
      if (!data.description || data.description.trim().length === 0) {
        res.status(400).json({ success: false, message: "Description is required" });
        return;
      }
      if (!data.datetime || isNaN(new Date(data.datetime).getTime())) {
        res.status(400).json({ success: false, message: "Invalid datetime" });
        return;
      }

      const log = await this.logService.createLog(data);
      res.status(201).json({ success: true, log });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error", error });
    }
  }

  /**
   * Get audit log by ID
   */
  private async getLogById(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: "Invalid ID" });
        return;
      }

      const log = await this.logService.getLogById(id);
      if (!log) {
        res.status(404).json({ success: false, message: `Log with ID ${id} not found` });
        return;
      }

      res.status(200).json({ success: true, log });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error", error });
    }
  }

  /**
   * Get all audit logs
   */
  private async getAllLogs(req: Request, res: Response): Promise<void> {
    try {
      const logs = await this.logService.getAllLogs();
      res.status(200).json({ success: true, logs });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error", error });
    }
  }

  /**
   * Update audit log by ID
   */
  private async updateLog(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const data: Partial<LogDTO> = req.body;

      if (isNaN(id)) {
        res.status(400).json({ success: false, message: "Invalid ID" });
        return;
      }

      const updatedLog = await this.logService.updateLog(id, data);
      res.status(200).json({ success: true, log: updatedLog });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error", error });
    }
  }

  /**
   * Delete audit log by ID
   */
  private async deleteLog(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: "Invalid ID" });
        return;
      }

      const deleted = await this.logService.deleteLog(id);
      if (!deleted) {
        res.status(404).json({ success: false, message: `Log with ID ${id} not found` });
        return;
      }

      res.status(200).json({ success: true, message: "Log deleted successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error", error });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}
