import { ILogService } from '../Domain/Services/ILogService';

export class LogService implements ILogService {
    async log(message: string, type?: "INFO" | "WARNING" | "ERROR"): Promise<boolean> {
        console.log(`[${type || 'INFO'}]: ${message}`);
        return true;
    }
}