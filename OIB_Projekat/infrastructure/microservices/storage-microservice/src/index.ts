import app from './app';

const port = process.env.PORT || 6246;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log('Database connected');
});