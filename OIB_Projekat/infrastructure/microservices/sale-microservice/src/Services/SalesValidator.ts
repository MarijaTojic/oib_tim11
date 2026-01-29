import { CreateSaleDTO } from "../Domain/DTOs/CreateSaleDTO";

export interface ValidationResult {
  success: boolean;
  message?: string;
}

export class SalesValidator {

  static validateSaleDto(dto: CreateSaleDTO): ValidationResult {
    if (!dto.userId || typeof dto.userId !== "number") {
      return { success: false, message: "Invalid or missing userId" };
    }

    if (!dto.perfumes || !Array.isArray(dto.perfumes) || dto.perfumes.length === 0) {
      return { success: false, message: "perfumes array is required and cannot be empty" };
    }

    for (let i = 0; i < dto.perfumes.length; i++) {
      const p = dto.perfumes[i];
      if (!p.perfumeId || typeof p.perfumeId !== "number") {
        return { success: false, message: `Perfume at index ${i} must have a valid perfumeId` };
      }
      if (!p.quantity || typeof p.quantity !== "number" || p.quantity <= 0) {
        return { success: false, message: `Perfume at index ${i} must have a positive quantity` };
      }
    }

    return { success: true };
  }

  static validatePackages(packages: any[]): ValidationResult {
    if (!Array.isArray(packages) || packages.length === 0) {
      return { success: false, message: "Packages array is empty or invalid" };
    }

    for (let i = 0; i < packages.length; i++) {
      const pkg = packages[i];
      if (!pkg.perfumeId || typeof pkg.perfumeId !== "number") {
        return { success: false, message: `Package at index ${i} must have a valid perfumeId` };
      }
    }

    return { success: true };
  }
}