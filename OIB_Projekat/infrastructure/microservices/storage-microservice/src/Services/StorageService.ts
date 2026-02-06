import { getRepository } from 'typeorm';
import { Package } from '../Domain/Models/Package';
import { Warehouse } from '../Domain/Models/Warehouse';
import { PackageStatus } from '../Domain/Enums/PackageStatus';
import { CreatePackageDTO } from '../Domain/DTOs/CreatePackageDTO';
import { CreateWarehouseDTO } from '../Domain/DTOs/CreateWarehouseDTO';
import { IStorageService } from '../Domain/Services/IStorageService';
import { ILogService } from "../../../log-microservice/src/Domain/services/ILogService";
import { IStorageStrategy } from './IStorageStrategy';
import { DistributionStrategy } from './DistributionStrategy';
import { WarehouseStrategy } from './WarehouseStrategy';
import { In } from 'typeorm';

export class StorageService implements IStorageService {
    private logerService: ILogService;

    constructor(logerService: ILogService) {
        this.logerService = logerService;
    }

    private getStrategy(userRole: string): IStorageStrategy {
        return userRole === 'manager'
            ? new DistributionStrategy()
            : new WarehouseStrategy();
    }

    async receivePackage(dto: CreatePackageDTO, userId: number): Promise<{
        success: boolean;
        message: string;
        data?: any;
    }> {
        try {
            this.logerService.log("Package receive request received");

            const packageRepo = getRepository(Package);
            const warehouseRepo = getRepository(Warehouse);

            // ISPRAVLJENO: dodato where
            const warehouse = await warehouseRepo.findOne({
                where: { id: dto.warehouseId }
            });

            if (!warehouse) {
                return {
                    success: false,
                    message: `Warehouse with id ${dto.warehouseId} not found`
                };
            }

            const currentPackages = await packageRepo.count({
                where: { warehouse: { id: dto.warehouseId } }
            });

            if (currentPackages >= warehouse.maxPackages) {
                return {
                    success: false,
                    message: `Warehouse ${warehouse.name} is at full capacity`
                };
            }

            const newPackage = packageRepo.create({
                name: dto.name,
                senderAddress: dto.senderAddress,
                warehouse: warehouse,
            });

            const savedPackage = await packageRepo.save(newPackage);

            this.logerService.log(
                `Package ${savedPackage.id} received in warehouse ${warehouse.id} by user ${userId}`
            );

            return {
                success: true,
                message: 'Package received successfully',
                data: savedPackage
            };
        } catch (error) {
            this.logerService.log(`Failed to receive package: ${error}`);
            return {
                success: false,
                message: 'Server error while receiving package'
            };
        }
    }

    async sendPackages(packageIds: number[], userRole: string, userId: number): Promise<{
        success: boolean;
        message: string;
        data?: {
            packageCount: number;
            processingTime: string;
            strategy: string;
        };
    }> {
        try {
            this.logerService.log("Send packages request received");

            const packageRepo = getRepository(Package);
            const strategy = this.getStrategy(userRole);

            if (!strategy.canSend(packageIds.length)) {
                return {
                    success: false,
                    message: `Cannot send ${packageIds.length} packages. Max allowed: ${strategy.getMaxPackagesPerShipment()}`
                };
            }

            const packages = await packageRepo.find({
                where: { id: In(packageIds) },
                relations: ['warehouse']
            });

            if (packages.length !== packageIds.length) {
                const foundIds = packages.map(p => p.id);
                const missingIds = packageIds.filter(id => !foundIds.includes(id));
                return {
                    success: false,
                    message: `Packages not found: ${missingIds.join(', ')}`
                };
            }

            const invalidPackages = packages.filter(pkg => pkg.status !== PackageStatus.PACKED);
            if (invalidPackages.length > 0) {
                return {
                    success: false,
                    message: `Packages ${invalidPackages.map(p => p.id).join(', ')} are not in PACKED status`
                };
            }

            await packageRepo.update(packageIds, { status: PackageStatus.SHIPPED });

            const processingTime = strategy.getProcessingTime(packageIds.length);

            this.logerService.log(
                `Sent ${packageIds.length} packages. Processing time: ${processingTime}s. Role: ${userRole} by user ${userId}`
            );

            return {
                success: true,
                message: 'Packages shipped successfully',
                data: {
                    packageCount: packageIds.length,
                    processingTime: `${processingTime}s`,
                    strategy: strategy.getStrategyName()
                }
            };
        } catch (error) {
            this.logerService.log(`Failed to send packages: ${error}`);
            return {
                success: false,
                message: 'Server error while sending packages'
            };
        }
    }

    async createWarehouse(dto: CreateWarehouseDTO, userId: number): Promise<{
        success: boolean;
        message: string;
        data?: any;
    }> {
        try {
            this.logerService.log("Create warehouse request received");

            const warehouseRepo = getRepository(Warehouse);
            const warehouse = warehouseRepo.create(dto);
            const savedWarehouse = await warehouseRepo.save(warehouse);

            this.logerService.log(
                `Warehouse ${savedWarehouse.id} created by user ${userId}`
            );

            return {
                success: true,
                message: 'Warehouse created successfully',
                data: savedWarehouse
            };
        } catch (error) {
            this.logerService.log(`Failed to create warehouse: ${error}`);
            return {
                success: false,
                message: 'Server error while creating warehouse'
            };
        }
    }

    async getWarehouses(): Promise<{
        success: boolean;
        data?: any[];
    }> {
        try {
            const warehouseRepo = getRepository(Warehouse);
            const warehouses = await warehouseRepo.find({ relations: ['packages'] });

            return {
                success: true,
                data: warehouses
            };
        } catch (error) {
            this.logerService.log(`Failed to get warehouses: ${error}`);
            return {
                success: false,
                data: []
            };
        }
    }

    async checkPackageAvailability(packageIds: number[]): Promise<{
        available: boolean;
        missingIds?: number[];
        message?: string;
    }> {
        try {
            const packageRepo = getRepository(Package);
            const packages = await packageRepo.findByIds(packageIds);

            if (packages.length === packageIds.length) {
                return {
                    available: true,
                    message: 'All packages are available'
                };
            }

            const foundIds = packages.map(p => p.id);
            const missingIds = packageIds.filter(id => !foundIds.includes(id));

            return {
                available: false,
                missingIds: missingIds,
                message: `Packages not found: ${missingIds.join(', ')}`
            };
        } catch (error) {
            this.logerService.log(`Failed to check package availability: ${error}`);
            return {
                available: false,
                message: 'Server error while checking availability'
            };
        }
    }
}