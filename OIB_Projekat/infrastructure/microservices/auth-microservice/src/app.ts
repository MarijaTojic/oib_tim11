import express from 'express';
import cors from 'cors';
import "reflect-metadata";
import dotenv from 'dotenv';
import { initialize_database } from './Database/InitializeConnection';
import { Db } from './Database/DbConnectionPool';
import { Repository } from 'typeorm';

import { User } from './Domain/models/User';
import { IAuthService } from './Domain/services/IAuthService';
import { AuthService } from './Services/AuthService';
import { AuthController } from './WebAPI/controllers/AuthController';

/*import { ILogService } from '../../log-microservice/src/Domain/services/ILogService';
import { LogService } from '../../log-microservice/src/Services/LogService';
import { Log } from '../../log-microservice/src/Domain/models/Log';*/

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
const userRepository: Repository<User> = Db.getRepository(User);
//const auditRepository: Repository<Log> = Db.getRepository(Log as any);

// Services
//const logService: ILogService = new LogService(auditRepository as any);
const authService: IAuthService = new AuthService(userRepository);

// WebAPI routes
const authController = new AuthController(authService/*, logService*/);

// Registering routes
app.use('/api/v1', authController.getRouter());

export default app;
