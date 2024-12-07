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
    // pool.query("DELETE FROM scans WHERE true")
    // pool.query("DELETE FROM scan_items WHERE true")
    if (err) {
        console.error('Ошибка подключения к PostgreSQL:', err.message);
    } else {
        console.log('Успешное подключение к PostgreSQL.');
    }
});

module.exports = pool;
