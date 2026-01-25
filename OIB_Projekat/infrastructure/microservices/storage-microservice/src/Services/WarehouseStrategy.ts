import { IStorageStrategy } from './IStorageStrategy';

export class WarehouseStrategy implements IStorageStrategy {
    canSend(packageCount: number): boolean {
        return packageCount <= 1;
    }

    getProcessingTime(packageCount: number): number {
        return 2.5 * packageCount;
    }

    getMaxPackagesPerShipment(): number {
        return 1;
    }

    getStrategyName(): string {
        return 'Warehouse Center';
    }
}