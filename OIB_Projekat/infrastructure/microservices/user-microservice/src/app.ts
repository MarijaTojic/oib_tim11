import express from 'express';
import cors from 'cors';
import "reflect-metadata";
import dotenv from 'dotenv';
import { initialize_database } from './Database/InitializeConnection';
import { Repository } from 'typeorm';
import { Db } from './Database/DbConnectionPool';

import { User } from './Domain/models/User';
import { IUsersService } from './Domain/services/IUsersService';
import { UsersService } from './Services/UsersService';
import { UsersController } from './WebAPI/controllers/UsersController';

import { ILogService } from '../../log-microservice/src/Domain/services/ILogService';
import { LogService } from '../../log-microservice/src/Services/LogService';
import { Log } from '../../log-microservice/src/Domain/models/Log';

dotenv.config({ quiet: true });

const app = express();

// Read CORS settings from environment
const corsOrigin = process.env.CORS_ORIGIN ?? "*";
const corsMethods = process.env.CORS_METHODS?.split(",").map(m => m.trim()) ?? ["POST"];

// Enable CORS
app.use(cors({
  origin: corsOrigin,
  methods: corsMethods,
}));

app.use(express.json());

// Initialize DB
initialize_database();

// ORM Repositories
const userRepository: Repository<User> = Db.getRepository(User);

// Log repository 
const auditRepository: Repository<Log> = Db.getRepository(Log as any);

// Services
const userService: IUsersService = new UsersService(userRepository);
const loggerService: ILogService = new LogService(auditRepository as any);

// WebAPI routes
const userController = new UsersController(userService, loggerService);

// Register routes
app.use('/api/v1', userController.getRouter());

export default app;
