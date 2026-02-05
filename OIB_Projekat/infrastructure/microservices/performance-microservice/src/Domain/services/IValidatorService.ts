export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface IValidatorService {
  validateSimulationRequest(request: any): ValidationResult;
}
