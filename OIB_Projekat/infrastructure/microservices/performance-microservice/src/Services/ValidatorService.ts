import { IValidatorService, ValidationResult } from '../Domain/services/IValidatorService';
import { SimulationRequestDTO } from '../Domain/DTOs';
import { LogisticsAlgorithm } from '../Domain/models/PerformanceResult';

export class ValidatorService implements IValidatorService {
  validateSimulationRequest(request: SimulationRequestDTO): ValidationResult {
    const errors: string[] = [];

    // Validate simulation name
    if (!request.simulationName || typeof request.simulationName !== 'string') {
      errors.push('Simulation name is required and must be a string');
    }

    // Validate algorithms array
    if (!request.algorithms || !Array.isArray(request.algorithms)) {
      errors.push('Algorithms must be an array');
    } else if (request.algorithms.length === 0) {
      errors.push('At least one algorithm is required');
    } else {
      const validAlgorithms = Object.values(LogisticsAlgorithm);
      request.algorithms.forEach((algorithm: any, index: number) => {
        if (!validAlgorithms.includes(algorithm)) {
          errors.push(
            `Algorithm ${index + 1}: Invalid algorithm. Must be one of: ${validAlgorithms.join(', ')}`
          );
        }
      });
    }

    // Validate optional parameters
    if (request.numberOfSimulations !== undefined) {
      if (typeof request.numberOfSimulations !== 'number' || request.numberOfSimulations <= 0) {
        errors.push('Number of simulations must be a positive number');
      }
    }

    if (request.numberOfParticles !== undefined) {
      if (typeof request.numberOfParticles !== 'number' || request.numberOfParticles <= 0) {
        errors.push('Number of particles must be a positive number');
      }
    }

    if (request.numberOfIterations !== undefined) {
      if (typeof request.numberOfIterations !== 'number' || request.numberOfIterations <= 0) {
        errors.push('Number of iterations must be a positive number');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
