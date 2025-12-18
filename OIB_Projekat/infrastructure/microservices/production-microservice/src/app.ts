import express from "express";
import cors from "cors";
import "reflect-metadata";
import dotenv from "dotenv";
import { Repository } from "typeorm";

import { initialize_database } from "./Database/InitializeConnection";
import { Db } from "./Database/DbConnectionPool";

import { Plant } from "./Domain/models/Plant";
import { IPlantsService } from "./Domain/services/IPlantsService";
import { ILogerService } from "./Domain/services/ILogerService";

import { PlantsService } from "./Services/PlantService";
import { LogerService } from "./Services/LogerService";
import { PlantsController } from "./WebAPI/PlantController";

dotenv.config({ quiet: true });

const app = express();

const corsOrigin = process.env.CORS_ORIGIN ?? "*";
const corsMethods =
  process.env.CORS_METHODS?.split(",").map(m => m.trim()) ??
  ["GET", "POST", "PUT", "DELETE"];

app.use(
  cors({
    origin: corsOrigin,
    methods: corsMethods
  })
);

app.use(express.json());

initialize_database();

const plantRepository: Repository<Plant> = Db.getRepository(Plant);

const loggerService: ILogerService = new LogerService();
const plantsService: IPlantsService = new PlantsService(plantRepository);


const plantsController = new PlantsController(
  plantsService,
  loggerService
);

app.use("/api/v1", plantsController.getRouter());

export default app;
