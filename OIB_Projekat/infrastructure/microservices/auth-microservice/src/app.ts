import express, { type RequestHandler } from 'express';
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

dotenv.config({ quiet: true });

const app = express();

// Read CORS settings from environment
const corsOrigin = process.env.CORS_ORIGIN ?? "*";
const corsMethods = process.env.CORS_METHODS?.split(",").map(m => m.trim()) ?? ["POST"];
const allowedOrigins = corsOrigin === "*"
  ? "*"
  : corsOrigin.split(",").map(origin => origin.trim()).filter(Boolean);

// Protected microservice from unauthorized access
const corsMiddleware = cors({
  origin: allowedOrigins,
  methods: corsMethods,
}) as unknown as RequestHandler;

app.use(corsMiddleware);

app.use(express.json());

const internalKey = process.env.AUTH_INTERNAL_KEY;
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
const userRepository: Repository<User> = Db.getRepository(User);
const authService: IAuthService = new AuthService(userRepository);

// WebAPI routes
const authController = new AuthController(authService/*, logService*/);

// Registering routes
app.use('/api/v1', authController.getRouter());

export default app;
