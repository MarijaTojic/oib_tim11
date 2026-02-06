import express from 'express';
import cors from 'cors';
import "reflect-metadata";
import dotenv from 'dotenv';
import { initialize_database } from './Database/InitializeConnection';
import { Db } from './Database/DbConnectionPool';
import { Repository } from 'typeorm';

import { Receipt } from './Domain/models/Receipt';
import { ReportAnalysis } from './Domain/models/ReportAnalysis';
import { IAnalyticsService } from './Domain/services/IAnalyticsService';
import { AnalyticsService } from './Services/AnalyticsService';
import { AnalyticsController } from './WebAPI/controllers/AnalyticsController';

import { IValidatorService } from './Domain/services/IValidatorService';
import { ValidatorService } from './Services/ValidatorService';

import { ILogService } from '../../log-microservice/src/Domain/services/ILogService';
import { LogService } from '../../log-microservice/src/Services/LogService';
import { Log } from '../../log-microservice/src/Domain/models/Log';

dotenv.config({ quiet: true });

const app = express();

// Read CORS settings from environment
const corsOrigin = process.env.CORS_ORIGIN ?? "*";
const corsMethods = process.env.CORS_METHODS?.split(",").map(m => m.trim()) ?? ["GET", "POST", "PUT", "DELETE", "PATCH"];

app.use(cors({
  origin: corsOrigin,
  methods: corsMethods,
}));

app.use(express.json());

// Initialize DB
initialize_database();

// ORM Repositories
const receiptRepository: Repository<Receipt> = Db.getRepository(Receipt);
const reportRepository: Repository<ReportAnalysis> = Db.getRepository(ReportAnalysis);
const auditRepository: Repository<Log> = Db.getRepository(Log as any);

// Services
const logService: ILogService = new LogService(auditRepository as any);
const analyticsService: IAnalyticsService = new AnalyticsService(receiptRepository, reportRepository);
const validatorService: IValidatorService = new ValidatorService();

// WebAPI routes
const analyticsController = new AnalyticsController(analyticsService, logService, validatorService);

// Registering routes
app.use('/api/v1', analyticsController.getRouter());

export default app;
