import { Request, Response, Router } from 'express';
import { IStorageService } from '../Domain/Services/IStorageService';
import { ILogService } from '../Domain/Services/ILogService';
import { CreatePackageDTO } from '../Domain/DTOs/CreatePackageDTO';
import { CreateWarehouseDTO } from '../Domain/DTOs/CreateWarehouseDTO';
import { validatePackageData, validatePackageIds } from '../Validators/PackageValidator';
import { validateWarehouseData } from '../Validators/WarehouseValidator';

export class StorageController {
    private router: Router;
    private storageService: IStorageService;
    private readonly logService: ILogService;

    constructor(storageService: IStorageService, logService: ILogService) {
        this.router = Router();
        this.storageService = storageService;
        this.logService = logService;
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        // Package endpoints
        this.router.post('/storage/packages', this.receivePackage.bind(this));
        this.router.post('/storage/ship', this.sendPackages.bind(this));

        // Warehouse endpoints
        this.router.post('/storage/warehouses', this.createWarehouse.bind(this));
        this.router.get('/storage/warehouses', this.getWarehouses.bind(this));
    }

    /**
     * POST /api/v1/storage/packages
     * Receives a new package into warehouse
     */
    private async receivePackage(req: Request, res: Response): Promise<void> {
        try {
            await this.logService.log("Package receive request received", "INFO");

            const data: CreatePackageDTO = req.body as CreatePackageDTO;

            // Validate input
            const validation = validatePackageData(data);
            if (!validation.success) {
                res.status(400).json({ success: false, message: validation.message });
                return;
            }

            // Get user from JWT (passed by Gateway)
            const userId = (req as any).user?.id || 0;

            const result = await this.storageService.receivePackage(data, userId);

            if (result.success) {
                res.status(201).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            await this.logService.log(`Server error in receivePackage: ${error}`, "ERROR");
            res.status(500).json({
                success: false,
                message: "Server error while receiving package"
            });
        }
    }

    /**
     * POST /api/v1/storage/ship
     * Ships packages from warehouse (role-based)
     */
    private async sendPackages(req: Request, res: Response): Promise<void> {
        try {
            await this.logService.log("Send packages request received", "INFO");

            const { packageIds } = req.body;

            // Validate package IDs
            const idValidation = validatePackageIds(packageIds);
            if (!idValidation.success) {
                res.status(400).json({ success: false, message: idValidation.message });
                return;
            }

            // Get user info from JWT
            const userRole = (req as any).user?.role || 'seller';
            const userId = (req as any).user?.id || 0;

            const result = await this.storageService.sendPackages(packageIds, userRole, userId);

            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            await this.logService.log(`Server error in sendPackages: ${error}`, "ERROR");
            res.status(500).json({
                success: false,
                message: "Server error while shipping packages"
            });
        }
    }

    /**
     * POST /api/v1/storage/warehouses
     * Creates a new warehouse
     */
    private async createWarehouse(req: Request, res: Response): Promise<void> {
        try {
            await this.logService.log("Create warehouse request received", "INFO");

            const data: CreateWarehouseDTO = req.body as CreateWarehouseDTO;

            // Validate input
            const validation = validateWarehouseData(data);
            if (!validation.success) {
                res.status(400).json({ success: false, message: validation.message });
                return;
            }

            const userId = (req as any).user?.id || 0;

            const result = await this.storageService.createWarehouse(data, userId);

            if (result.success) {
                res.status(201).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            await this.logService.log(`Server error in createWarehouse: ${error}`, "ERROR");
            res.status(500).json({
                success: false,
                message: "Server error while creating warehouse"
            });
        }
    }

    /**
     * GET /api/v1/storage/warehouses
     * Returns all warehouses with packages
     */
    private async getWarehouses(req: Request, res: Response): Promise<void> {
        try {
            await this.logService.log("Get warehouses request received", "INFO");

            const result = await this.storageService.getWarehouses();

            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(500).json(result);
            }
        } catch (error) {
            await this.logService.log(`Server error in getWarehouses: ${error}`, "ERROR");
            res.status(500).json({
                success: false,
                message: "Server error while fetching warehouses"
            });
        }
    }

    public getRouter(): Router {
        return this.router;
    }
}