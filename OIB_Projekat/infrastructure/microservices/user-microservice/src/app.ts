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

const internalKey = process.env.USER_INTERNAL_KEY;
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
// Services
const userService: IUsersService = new UsersService(userRepository);

// WebAPI routes
const userController = new UsersController(userService);

// Register routes
app.use('/api/v1', userController.getRouter());

export default app;
