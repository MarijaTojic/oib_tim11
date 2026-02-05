import express from 'express';
import cors from 'cors';
import 'reflect-metadata';
import { initialize_database } from './Database/InitializeConnection';
import dotenv from 'dotenv';
import { Repository } from 'typeorm';
import { PerformanceResult } from './Domain/models/PerformanceResult';
import { Db } from './Database/DbConnectionPool';
import { IPerformanceService } from './Domain/services/IPerformanceService';
import { PerformanceService } from './Services/PerformanceService';
import { PerformanceController } from './WebAPI/controllers/PerformanceController';
import { ILogerService } from './Domain/services/ILogerService';
import { LogerService } from './Services/LogerService';
import { IValidatorService } from './Domain/services/IValidatorService';
import { ValidatorService } from './Services/ValidatorService';

dotenv.config({ quiet: true });

const app = express();

// Read CORS settings from environment
const corsOrigin = process.env.CORS_ORIGIN ?? '*';
const corsMethods = process.env.CORS_METHODS?.split(',').map(m => m.trim()) ?? ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

// Protected microservice from unauthorized access
app.use(cors({
  origin: corsOrigin,
  methods: corsMethods,
}));

app.use(express.json());

initialize_database();

// ORM Repositories
const performanceRepository: Repository<PerformanceResult> = Db.getRepository(PerformanceResult);

// Services
const performanceService: IPerformanceService = new PerformanceService(performanceRepository);
const logerService: ILogerService = new LogerService();
const validatorService: IValidatorService = new ValidatorService();

// WebAPI routes
const performanceController = new PerformanceController(performanceService, logerService, validatorService);

// Registering routes
app.use('/api/v1', performanceController.getRouter());

export default app;
