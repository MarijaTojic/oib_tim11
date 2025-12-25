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
import { ILogerService } from './Domain/services/ILogerService';
import { LogerService } from './Services/LogerService';

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

initialize_database();

// ORM Repositories
const perfumeRepository: Repository<Perfume> = Db.getRepository(Perfume);

// Services
const perfumeService: IPerfumeService = new PerfumeService(perfumeRepository);
const logerService: ILogerService = new LogerService();

// WebAPI routes
const perfumeController = new PerfumeController(perfumeService, logerService);

// Registering routes
app.use('/api/v1', perfumeController.getRouter());

export default app;
