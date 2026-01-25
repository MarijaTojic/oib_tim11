export interface ILogService {
    log(message: string, type?: "INFO" | "WARNING" | "ERROR"): Promise<boolean>;
}