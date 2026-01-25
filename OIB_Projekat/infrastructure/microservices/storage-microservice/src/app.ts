import express from 'express';
import cors from 'cors';
import "reflect-metadata";
import { initialize_database } from './Database/InitializeConnection';
import dotenv from 'dotenv';
import { Repository } from 'typeorm';
import { Package } from './Domain/Models/Package';
import { Warehouse } from './Domain/Models/Warehouse';
import { Db } from './Database/DbConnectionPool';
import { IStorageService } from './Domain/Services/IStorageService';
import { StorageService } from './Services/StorageService';
import { StorageController } from './Controllers/StorageController';
import { ILogService } from './Domain/Services/ILogService';
import { LogService } from './Services/LogService';

dotenv.config({ quiet: true });

const app = express();

// Read CORS settings from environment
const corsOrigin = process.env.CORS_ORIGIN ?? "*";
const corsMethods = process.env.CORS_METHODS?.split(",").map(m => m.trim()) ?? ["GET", "POST"];

// Protected microservice from unauthorized access
app.use(cors({
    origin: corsOrigin,
    methods: corsMethods,
}));

app.use(express.json());

initialize_database();

// ORM Repositories
const packageRepository: Repository<Package> = Db.getRepository(Package);
const warehouseRepository: Repository<Warehouse> = Db.getRepository(Warehouse);

// Services
const logService: ILogService = new LogService();
const storageService: IStorageService = new StorageService(logService);

// WebAPI routes
const storageController = new StorageController(storageService, logService);

// Registering routes
app.use('/api/v1', storageController.getRouter());

export default app;