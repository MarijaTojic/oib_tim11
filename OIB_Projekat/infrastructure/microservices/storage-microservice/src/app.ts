import express from 'express';
import cors from 'cors';
import "reflect-metadata";
import dotenv from 'dotenv';
import { initialize_database } from './Database/InitializeConnection';
import { Repository } from 'typeorm';
import { Db } from './Database/DbConnectionPool';

import { Package } from './Domain/Models/Package';
import { Warehouse } from './Domain/Models/Warehouse';
import { IStorageService } from './Domain/Services/IStorageService';
import { StorageService } from './Services/StorageService';
import { StorageController } from './Controllers/StorageController';

import { ILogService } from '../../log-microservice/src/Domain/services/ILogService';
import { LogService } from '../../log-microservice/src/Services/LogService';
import { Log } from '../../log-microservice/src/Domain/models/Log';

dotenv.config({ quiet: true });

const app = express();

// Read CORS settings from environment
const corsOrigin = process.env.CORS_ORIGIN ?? "*";
const corsMethods = process.env.CORS_METHODS?.split(",").map(m => m.trim()) ?? ["GET", "POST"];

app.use(cors({
    origin: corsOrigin,
    methods: corsMethods,
}));

app.use(express.json());

// Initialize DB
initialize_database();

// ORM Repositories
const packageRepository: Repository<Package> = Db.getRepository(Package);
const warehouseRepository: Repository<Warehouse> = Db.getRepository(Warehouse);

// Log repository
const auditRepository: Repository<Log> = Db.getRepository(Log as any);

// Services
const loggerService: ILogService = new LogService(auditRepository as any);
const storageService: IStorageService = new StorageService(loggerService);

// WebAPI routes
const storageController = new StorageController(storageService, loggerService);

// Register routes
app.use('/api/v1', storageController.getRouter());

export default app;
