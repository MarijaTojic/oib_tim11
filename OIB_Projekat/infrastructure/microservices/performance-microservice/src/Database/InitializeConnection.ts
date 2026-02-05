import { Db } from './DbConnectionPool';
import { DatabaseSeeder } from './DatabaseSeeder';
import { PerformanceResult } from '../Domain/models/PerformanceResult';

export async function initialize_database() {
  try {
    await Db.initialize();
    console.log('\x1b[34m[DbConn@1.12.4]\x1b[0m Database connected');

    // Run seeder
    const performanceRepository = Db.getRepository(PerformanceResult);
    const seeder = new DatabaseSeeder(performanceRepository);
    await seeder.seed();
  } catch (err) {
    console.error('\x1b[31m[DbConn@1.12.4]\x1b[0m Error during DataSource initialization ', err);
  }
}
