import express, { type RequestHandler } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { IGatewayService } from './Domain/services/IGatewayService';
import { GatewayService } from './Services/GatewayService';
import { GatewayController } from './WebAPI/controllers/GatewayController';

dotenv.config({ quiet: true });

const app = express();

// Read CORS settings from environment (must be explicit)
const corsOrigin = process.env.CORS_ORIGIN;
const corsMethodsRaw = process.env.CORS_METHODS;

if (!corsOrigin || !corsMethodsRaw) {
  throw new Error("CORS_ORIGIN and CORS_METHODS must be set in env");
}

const allowedOrigins = corsOrigin.split(",").map(origin => origin.trim()).filter(Boolean);
if (allowedOrigins.includes("*")) {
  throw new Error("CORS_ORIGIN must not include '*'");
}

const corsMethods = corsMethodsRaw.split(",").map(m => m.trim()).filter(Boolean);

// Protected microservice from unauthorized access
const corsMiddleware = cors({
  origin: allowedOrigins,
  methods: corsMethods,
}) as unknown as RequestHandler;

app.use(corsMiddleware);

app.use(express.json());

// Services (Dependency Injection)
const gatewayService: IGatewayService = new GatewayService();

// WebAPI routes
const gatewayController = new GatewayController(gatewayService);

// Registering routes
app.use('/api/v1', gatewayController.getRouter());

export default app;
