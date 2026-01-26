import { LogType } from "../enums/LogType";

export interface LogDTO {
  id?: number;
  logType: LogType;
  description: string;
  timestamp?: Date;
  microserviceName?: string;
}
