export interface IStorageStrategy {
    canSend(packageCount: number): boolean;
    getProcessingTime(packageCount: number): number;
    getMaxPackagesPerShipment(): number;
    getStrategyName(): string;
}