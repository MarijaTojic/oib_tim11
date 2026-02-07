console.clear();
import { createApp } from './app';

const port = process.env.PORT || 5000;

createApp()
  .then((app) => {
    app.listen(port, () => {
      console.log(`\x1b[32m[TCPListen@2.1]\x1b[0m localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('\x1b[31m[Startup]\x1b[0m Failed to start log microservice', error);
    process.exit(1);
  });
