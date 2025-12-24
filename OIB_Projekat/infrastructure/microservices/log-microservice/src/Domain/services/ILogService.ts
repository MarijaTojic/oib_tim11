import { LogDTO } from "../DTOs/LogDTO";

export interface ILogService {
  
  log(message: string, type?: "INFO" | "WARNING" | "ERROR"): Promise<boolean>;

 
  createLog(log: LogDTO): Promise<LogDTO>;


  getAllLogs(): Promise<LogDTO[]>;

  
  //getLogById(id: number): Promise<LogDTO | null>;

 
  //updateLog(id: number, log: Partial<LogDTO>): Promise<LogDTO>;

  
  deleteLog(id: number): Promise<boolean>;
}
