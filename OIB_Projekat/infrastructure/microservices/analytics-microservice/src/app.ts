import express from 'express';
import cors from 'cors';
import "reflect-metadata";
import { initialize_database } from './Database/InitializeConnection';
import dotenv from 'dotenv';
import { Repository } from 'typeorm';
import { Receipt } from './Domain/models/Receipt';
import { ReportAnalysis } from './Domain/models/ReportAnalysis';
import { Db } from './Database/DbConnectionPool';
import { IAnalyticsService } from './Domain/services/IAnalyticsService';
import { AnalyticsService } from './Services/AnalyticsService';
import { AnalyticsController } from './WebAPI/controllers/AnalyticsController';
import { ILogerService } from './Domain/services/ILogerService';
import { LogerService } from './Services/LogerService';
import { IValidatorService } from './Domain/services/IValidatorService';
import { ValidatorService } from './Services/ValidatorService';

dotenv.config({ quiet: true });

const app = express();

// Read CORS settings from environment
const corsOrigin = process.env.CORS_ORIGIN ?? "*";
const corsMethods = process.env.CORS_METHODS?.split(",").map(m => m.trim()) ?? ["GET", "POST", "PUT", "DELETE", "PATCH"];

// Protected microservice from unauthorized access
app.use(cors({
  origin: corsOrigin,
  methods: corsMethods,
}));

app.use(express.json());

initialize_database();

// ORM Repositories
const receiptRepository: Repository<Receipt> = Db.getRepository(Receipt);
const reportRepository: Repository<ReportAnalysis> = Db.getRepository(ReportAnalysis);

// Services
const analyticsService: IAnalyticsService = new AnalyticsService(receiptRepository, reportRepository);
const logerService: ILogerService = new LogerService();
const validatorService: IValidatorService = new ValidatorService();

// WebAPI routes
const analyticsController = new AnalyticsController(analyticsService, logerService, validatorService);

// Registering routes
app.use('/api/v1', analyticsController.getRouter());

export default app;
