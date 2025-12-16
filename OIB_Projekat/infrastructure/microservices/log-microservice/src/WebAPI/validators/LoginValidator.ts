import { LogDTO } from "../../Domain/DTOs/LogDTO";

export function validateLoginData(data: LogDTO): { success: boolean; message?: string } {
  if (!data.description) {
    return { success: false, message: "Description can not be empty!" };
  }
  return { success: true };
}
