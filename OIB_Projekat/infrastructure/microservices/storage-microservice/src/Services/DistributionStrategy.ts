import { IStorageStrategy } from './IStorageStrategy';

export class DistributionStrategy implements IStorageStrategy {
    canSend(packageCount: number): boolean {
        return packageCount <= 3;
    }

    getProcessingTime(packageCount: number): number {
        return 0.5 * packageCount;
    }

    getMaxPackagesPerShipment(): number {
        return 3;
    }

    getStrategyName(): string {
        return 'Distribution Center';
    }
}