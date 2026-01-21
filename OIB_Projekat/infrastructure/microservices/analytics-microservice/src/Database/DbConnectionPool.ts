import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { Receipt, ReportAnalysis } from '../Domain';

dotenv.config();

export const Db = new DataSource({
  type: 'mysql',
  host: process.env.DATABASE_HOST || 'localhost',
  port: Number(process.env.DATABASE_PORT) || 3306,
  username: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE_NAME || 'izvestaji_analize',
  ssl: { rejectUnauthorized: false },
  synchronize: true,
  logging: false,
  entities: [Receipt, ReportAnalysis],
});
