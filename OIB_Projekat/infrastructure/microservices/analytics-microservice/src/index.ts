import app from './app';

const PORT = process.env.PORT || 3007;

app.listen(PORT, () => {
  console.log(`\x1b[36m[Analytics@1.0.0]\x1b[0m Server running on port ${PORT}`);
});
