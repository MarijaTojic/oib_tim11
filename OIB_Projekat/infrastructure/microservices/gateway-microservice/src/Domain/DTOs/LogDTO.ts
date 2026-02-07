import { LogType } from "../enums/LogType";

export interface LogDTO {
  id?: number;
  logtype: LogType;
  description: string;
  datetime: string;
}
