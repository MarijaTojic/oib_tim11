import { RegistrationUserDTO } from "../../Domain/DTOs/RegistrationUserDTO";
import { UserRole } from "../../Domain/enums/UserRole";

// Helper function to check if a string contains a number
function containsNumber(str: string): boolean {
  for (let i = 0; i < str.length; i++) {
    if (!isNaN(Number(str[i]))) {
      return true;
    }
  }
  return false;
}

export function validateRegistrationData(data: RegistrationUserDTO): { success: boolean; message?: string } {
  if (!data.username || data.username.trim().length < 3) {
    return { success: false, message: "Username must be at least 3 characters long" };
  }
  
  if (!data.password || data.password.length < 6) {
    return { success: false, message: "Password must be at least 6 characters long" };
  }
  
  if (!data.email || !data.email.includes("@")) {
    return { success: false, message: "Invalid email address" };
  }
  
  if (!Object.values(UserRole).includes(data.role)) {
    return { success: false, message: "Invalid role" };
  }

  // Validation for name and surname (no numbers)
  if (!data.name || containsNumber(data.name)) {
    return { success: false, message: "First name cannot contain numbers" };
  }

  if (!data.surname || containsNumber(data.surname)) {
    return { success: false, message: "Last name cannot contain numbers" };
  }

  return { success: true };
}
