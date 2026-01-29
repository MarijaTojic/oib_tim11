import express from 'express';
import cors from 'cors';
import "reflect-metadata";
import dotenv from 'dotenv';
import { initialize_database } from './Database/InitializeConnection';
import { Db } from './Database/DbConnectionPool';
import { Repository } from 'typeorm';

import { Catalogue } from './Domain/models/Catalogue';

import { ISalesService } from './Domain/services/ISalesService';
import { SalesService } from './Services/SaleService';

import { ILogerService } from './Domain/services/ILogerService';
import { LogerService } from './Services/LogerService';

import { SalesController } from './WebAPI/controllers/SalesController';

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
const catalogueRepository: Repository<Catalogue> = Db.getRepository(Catalogue);

// Services
const salesService: ISalesService = new SalesService(); 
const logerService: ILogerService = new LogerService();

// WebAPI routes
const salesController = new SalesController(salesService, logerService);

// Registering routes
app.use('/api/v1', salesController.getRouter());

export default app;