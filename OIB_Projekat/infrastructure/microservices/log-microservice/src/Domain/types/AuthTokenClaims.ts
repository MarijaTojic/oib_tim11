import { LogInfo } from "../enums/Log";

export type AuthTokenClaims = {
  id: number;
  logtype: LogInfo;
  datetime: Date;
  description: string;
};
