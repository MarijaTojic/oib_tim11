import { LogInfo } from "../enums/Log";

export interface LogDTO {
    logtype: LogInfo;
    datetime: Date;
    description: string;
}