export function calculateNumberOfPlants(bottleVolume: number, bottleNumber : number): number {
    let volume = bottleVolume * bottleNumber;
    return Math.ceil(volume/50);
}