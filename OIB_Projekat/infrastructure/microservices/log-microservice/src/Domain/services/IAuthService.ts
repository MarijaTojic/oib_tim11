import { LogDTO } from "../DTOs/LogDTO";
import { AuthResponseType } from "../types/AuthResponse";

export interface IAuthService {
  log(data: LogDTO): Promise<AuthResponseType>;
  
}
