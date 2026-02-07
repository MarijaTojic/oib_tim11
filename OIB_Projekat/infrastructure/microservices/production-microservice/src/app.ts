import express from "express";
import cors from "cors";
import "reflect-metadata";
import dotenv from "dotenv";
import { Repository } from "typeorm";

import { initialize_database } from "./Database/InitializeConnection";
import { Db } from "./Database/DbConnectionPool";

import { Plant } from "./Domain/models/Plant";
import { IPlantsService } from "./Domain/services/IPlantsService";
//import { ILogService } from "../../log-microservice/src/Domain/services/ILogService";

import { PlantsService } from "./Services/PlantService";
//import { LogService } from "../../log-microservice/src/Services/LogService";
import { PlantsController } from "./WebAPI/PlantController";
//import { Log } from "../../log-microservice/src/Domain/models/Log";

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
//const auditRepository: Repository<Log> = Db.getRepository(Log as any);

//const loggerService: ILogService = new LogService(auditRepository as any);
const plantsService: IPlantsService = new PlantsService(plantRepository);


const plantsController = new PlantsController(
  plantsService,
  //loggerService
);

app.use("/api/v1", plantsController.getRouter());

export default app;
