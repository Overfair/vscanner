const express = require('express');
const pool = require('./src/config/db');
const app = express();

app.use(express.json());

// Пример запроса к базе данных
app.get('/test', async (req, res) => {
    try {
        const result = await pool.query('SELECT 1 AS result;');
        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка выполнения запроса:', error.message);
        res.status(500).send('Ошибка сервера');
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
