const { Pool } = require('pg');
require('dotenv').config(); // Загружаем переменные окружения из .env

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false, // Отключение проверки сертификата, если требуется
    },
});

// Проверка подключения
pool.connect((err) => {
    if (err) {
        console.error('Ошибка подключения к PostgreSQL:', err.message);
    } else {
        console.log('Успешное подключение к PostgreSQL.');
    }
});

module.exports = pool;
