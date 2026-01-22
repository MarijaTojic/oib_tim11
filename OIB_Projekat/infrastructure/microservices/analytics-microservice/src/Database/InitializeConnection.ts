import { Db } from './DbConnectionPool';
import { DatabaseSeeder } from './DatabaseSeeder';
import { Receipt } from '../Domain/models/Receipt';
import { ReportAnalysis } from '../Domain/models/ReportAnalysis';

export async function initialize_database() {
  try {
    await Db.initialize();
    console.log('\x1b[34m[DbConn@1.0.0]\x1b[0m Analytics database connected');

    // Run seeder
    const receiptRepository = Db.getRepository(Receipt);
    const reportRepository = Db.getRepository(ReportAnalysis);
    const seeder = new DatabaseSeeder(receiptRepository, reportRepository);
    await seeder.seed();
  } catch (err) {
    console.error('\x1b[31m[DbConn@1.0.0]\x1b[0m Error during database initialization', err);
  }
}
