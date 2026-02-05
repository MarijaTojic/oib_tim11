import app from './app';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const PORT = process.env.PORT || 5549;

app.listen(PORT, () => {
  console.log(`\x1b[35m[Performance@1.0.0]\x1b[0m Microservice running on port ${PORT}`);
});
