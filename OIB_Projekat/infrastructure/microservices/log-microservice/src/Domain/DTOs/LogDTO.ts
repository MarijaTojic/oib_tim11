import { LogInfo } from "../enums/Log";

export interface LogDTO {
    id: Number;
    logtype: LogInfo;
    datetime: Date;
    description: string;
}