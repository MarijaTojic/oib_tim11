import express from 'express';
import cors from 'cors';
import 'reflect-metadata';
import dotenv from 'dotenv';
import { initialize_database } from './Database/InitializeConnection';
import { Db } from './Database/DbConnectionPool';
import { Repository } from 'typeorm';

import { PerformanceResult } from './Domain/models/PerformanceResult';
import { IPerformanceService } from './Domain/services/IPerformanceService';
import { PerformanceService } from './Services/PerformanceService';
import { PerformanceController } from './WebAPI/controllers/PerformanceController';

import { IValidatorService } from './Domain/services/IValidatorService';
import { ValidatorService } from './Services/ValidatorService';

import { ILogService } from '../../log-microservice/src/Domain/services/ILogService';
import { LogService } from '../../log-microservice/src/Services/LogService';
import { Log } from '../../log-microservice/src/Domain/models/Log';

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

// Initialize DB
initialize_database();

// ORM Repositories
const performanceRepository: Repository<PerformanceResult> = Db.getRepository(PerformanceResult);
const auditRepository: Repository<Log> = Db.getRepository(Log as any);

// Services
const logService: ILogService = new LogService(auditRepository as any);
const performanceService: IPerformanceService = new PerformanceService(performanceRepository);
const validatorService: IValidatorService = new ValidatorService();

// WebAPI routes
const performanceController = new PerformanceController(performanceService, logService, validatorService);

// Registering routes
app.use('/api/v1', performanceController.getRouter());

export default app;
