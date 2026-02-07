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

app.use(cors({
  origin: allowedOrigins,
  methods: corsMethods,
}));

app.use(express.json());

const internalKey = process.env.ANALYTICS_INTERNAL_KEY;
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
const receiptRepository: Repository<Receipt> = Db.getRepository(Receipt);
const reportRepository: Repository<ReportAnalysis> = Db.getRepository(ReportAnalysis);
// Services
const logService: ILogService = new HttpLogService();
const analyticsService: IAnalyticsService = new AnalyticsService(receiptRepository, reportRepository);
const validatorService: IValidatorService = new ValidatorService();

// WebAPI routes
const analyticsController = new AnalyticsController(analyticsService, logService, validatorService);

// Registering routes
app.use('/api/v1', analyticsController.getRouter());

export default app;
