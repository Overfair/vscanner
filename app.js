const express = require('express');
const pool = require('./src/config/db');
const AppDataSource = require('./data-source');
const app = express();
const parser = require('./parser');

app.use(express.json());

AppDataSource.initialize()
    .then(() => {
        console.log('Database connected and synchronized');
    })
    .catch((error) => {
        console.error('Database connection error:', error.message);
    });

// Пример запроса к базе данных
app.get('/test', async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка выполнения запроса:', error.message);
        res.status(500).send('Ошибка сервера');
    }
});

app.get('/parser', async (req, res) => {
    const exploits = await parser();
    res.json(exploits);
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
