import express from 'express';
import cors from 'cors';
import "reflect-metadata";
import { initialize_database } from './Database/InitializeConnection';
import dotenv from 'dotenv';
import { Repository } from 'typeorm';
import { Perfume } from './Domain/models/Perfume';
import { Db } from './Database/DbConnectionPool';
import { IPerfumeService } from './Domain/services/IPerfumeService';
import { PerfumeService } from './Services/PerfumeService';
import { PerfumeController } from './WebAPI/controllers/PerfumeController';
//import { ILogService } from '../../log-microservice/src/Domain/services/ILogService';
//import { LogService } from '../../log-microservice/src/Services/LogService';
//import { Log } from '../../log-microservice/src/Domain/models/Log';
import { Plant } from '../../production-microservice/src/Domain/models/Plant';

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
const perfumeRepository: Repository<Perfume> = Db.getRepository(Perfume);
const plantRepository: Repository<Plant> = Db.getRepository(Plant);
//const auditRepository: Repository<Log> = Db.getRepository(Log as any);

// Services
//const logService: ILogService = new LogService(auditRepository as any);
const perfumeService: IPerfumeService = new PerfumeService(perfumeRepository, plantRepository/*, logService*/);

// WebAPI routes
const perfumeController = new PerfumeController(perfumeService/*, logService*/);

// Registering routes
app.use('/api/v1', perfumeController.getRouter());

export default app;
