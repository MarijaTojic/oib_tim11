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
import { HttpLogService } from './Services/HttpLogService';

dotenv.config({ quiet: true });

const app = express();

// Read CORS settings from environment (must be explicit)
const corsOrigin = process.env.CORS_ORIGIN;
const corsMethodsRaw = process.env.CORS_METHODS;

if (!corsOrigin || !corsMethodsRaw) {
  throw new Error("CORS_ORIGIN and CORS_METHODS must be set in env");
}

const allowedOrigins = corsOrigin.split(",").map(origin => origin.trim()).filter(Boolean);
if (allowedOrigins.includes("*")) {
  throw new Error("CORS_ORIGIN must not include '*'");
}

const corsMethods = corsMethodsRaw.split(",").map(m => m.trim()).filter(Boolean);

// Protected microservice from unauthorized access
app.use(cors({
  origin: allowedOrigins,
  methods: corsMethods,
}));

app.use(express.json());

const internalKey = process.env.PERFORMANCE_INTERNAL_KEY;
app.use((req, res, next) => {
  if (!internalKey) {
    res.status(500).json({ success: false, message: "Internal key missing" });
    return;
  }

  const providedKey = req.header("x-internal-key");
  if (providedKey !== internalKey) {
    res.status(403).json({ success: false, message: "Forbidden" });
    return;
  }

  next();
});

// Initialize DB
initialize_database();

// ORM Repositories
const performanceRepository: Repository<PerformanceResult> = Db.getRepository(PerformanceResult);

// Services
const logService: ILogService = new HttpLogService();
const performanceService: IPerformanceService = new PerformanceService(performanceRepository);
const validatorService: IValidatorService = new ValidatorService();

// WebAPI routes
const performanceController = new PerformanceController(performanceService, logService, validatorService);

// Registering routes
app.use('/api/v1', performanceController.getRouter());

export default app;
