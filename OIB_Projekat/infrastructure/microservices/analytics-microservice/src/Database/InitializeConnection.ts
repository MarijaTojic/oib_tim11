import { Db } from './DbConnectionPool';

export async function initialize_database() {
  try {
    await Db.initialize();
    console.log('\x1b[34m[DbConn@1.0.0]\x1b[0m Analytics database connected');
  } catch (err) {
    console.error('\x1b[31m[DbConn@1.0.0]\x1b[0m Error during database initialization', err);
  }
}
