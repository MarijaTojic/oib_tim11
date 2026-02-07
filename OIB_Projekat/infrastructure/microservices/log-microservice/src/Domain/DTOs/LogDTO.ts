import { LogInfo } from "../enums/Log";

export interface LogDTO {
    id: number;
    logtype: LogInfo;
    datetime: Date;
    description: string;
}