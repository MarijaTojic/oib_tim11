import express from 'express';
import cors from 'cors';
import "reflect-metadata";
import { initialize_database } from './Database/InitializeConnection';
import dotenv from 'dotenv';
import { Repository } from 'typeorm';
import { Log } from './Domain/models/Log';
import { Db } from './Database/DbConnectionPool';
import { LogService } from './Services/LogService';
import { AuthController } from './WebAPI/controllers/AuthController';
import { ILogService } from './Domain/services/ILogService';

dotenv.config({ quiet: true });

export async function createApp(): Promise<express.Express> {
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

  await initialize_database();

  // ORM Repositories
  const auditRepository: Repository<Log> = Db.getRepository(Log);

  // Services
  const logService: ILogService = new LogService(auditRepository);

  // WebAPI routes
  const authController = new AuthController(logService);

  // Registering routes
  app.use('/api/v1', authController.getRouter());

  return app;
}
