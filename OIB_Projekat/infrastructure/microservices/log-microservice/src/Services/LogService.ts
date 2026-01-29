import { Repository } from "typeorm";
import { ILogService } from "../Domain/services/ILogService";
import { Log } from "../Domain/models/Log";
import { LogDTO } from "../Domain/DTOs/LogDTO";
import { LogInfo } from "../Domain/enums/Log";

export class LogService implements ILogService {
  constructor(private auditRepository: Repository<LogDTO>) {
    console.log(`\x1b[35m[Logger@1.0.0]\x1b[0m Service started`);
  }

  /**
   * Simple log message (INFO by default)
   */
  async log(message: string, type: "INFO" | "WARNING" | "ERROR" = "INFO"): Promise<boolean> {
    try {
      const log = this.auditRepository.create({
        logtype: LogInfo.INFO,
        description: "",
        datetime: new Date(),
      });
      await this.auditRepository.save(log);
      console.log(`\x1b[35m[Logger@1.0.0]\x1b[0m ${type}: ${message}`);
      return true;
    } catch (error) {
      console.error(`\x1b[31m[Logger@1.0.0]\x1b[0m Failed to log message:`, error);
      return false;
    }
  }


  async createLog(log: LogDTO): Promise<LogDTO> {
    const newLog = this.auditRepository.create({
      logtype: log.logtype,
      description: log.description,
      datetime: log.datetime ? new Date(log.datetime) : new Date(),
    });
    const savedLog = await this.auditRepository.save(newLog);
    return this.toDTO(savedLog);
  }

 
  async getAllLogs(): Promise<LogDTO[]> {
    const logs = await this.auditRepository.find();
    return logs.map(log => this.toDTO(log));
  }

  
  async getLogById(id: number): Promise<LogDTO | null> {
    const log = await this.auditRepository.findOne({ where: { id } });
    return log ? this.toDTO(log) : null;
  }

 
  async updateLog(id: number, logData: Partial<LogDTO>): Promise<LogDTO> {
    const existingLog = await this.auditRepository.findOne({ where: { id } });
    if (!existingLog) throw new Error(`Log with ID ${id} not found`);

    const updated = { ...existingLog, ...logData };
    if (logData.datetime) updated.datetime = new Date(logData.datetime);

    const savedLog = await this.auditRepository.save(updated);
    return this.toDTO(savedLog);
  }


  async deleteLog(id: number): Promise<boolean> {
    const result = await this.auditRepository.delete(id);
    return result.affected !== undefined && result.affected !== null && result.affected > 0;
  }


  private toDTO(log: LogDTO): LogDTO {
    return {
      id: log.id,
      logtype: log.logtype,
      description: log.description,
      datetime: log.datetime,
    };
  }
}
