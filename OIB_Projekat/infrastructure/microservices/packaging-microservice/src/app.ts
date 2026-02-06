import express from 'express';
import cors from 'cors';
import "reflect-metadata";
import { initialize_database } from './Database/InitializeConnection';
import dotenv from 'dotenv';
import { Repository } from 'typeorm';
import { Packaging } from './Domain/models/Packaging';
import { Db } from './Database/DbConnectionPool';
import { IPackagingService } from './Domain/services/IPackagingService';
import { PackagingService } from './Services/PackagingService';
import { PackagingController } from './WebAPI/controllers/PackagingController';
import { ILogService } from '../../log-microservice/src/Domain/services/ILogService';
import { LogService } from '../../log-microservice/src/Services/LogService';
import { Log } from '../../log-microservice/src/Domain/models/Log';

dotenv.config({ quiet: true });

const app = express();

// Read CORS settings from environment
const corsOrigin = process.env.CORS_ORIGIN ?? "*";
const corsMethods = process.env.CORS_METHODS?.split(",").map(m => m.trim()) ?? ["POST"];

// Protected microservice from unauthorized access
app.use(cors({
  origin: corsOrigin,
  methods: corsMethods,
}));

app.use(express.json());

// Initialize DB
initialize_database();

// ORM Repositories
const packagingRepository: Repository<Packaging> = Db.getRepository(Packaging);
const auditRepository: Repository<Log> = Db.getRepository(Log as any);

// Services
const logService: ILogService = new LogService(auditRepository as any);
const perfumeService: IPackagingService = new PackagingService(packagingRepository);

// WebAPI routes
const packagingController = new PackagingController(perfumeService);

// Registering routes
app.use('/api/v1', packagingController.getRouter());

export default app;
