const express = require('express');
const pool = require('./src/config/db');
const AppDataSource = require('./data-source');
const app = express();
const parser = require('./parser');
const generateDetectorFor = require('./generate-detector');
const getVulnerabilities = require('./get-vulnerabilities');
const analyzeWebsite = require('./analyze-services');
const updateDetectionScript = require('./update-detection-script');
const generateToken = require("./generate-token");

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

app.post('/generate-token', async (req, res) => {
    const { botName } = req.body;

    try {
        const data = await generateToken(botName);
        res.json(data);
    } catch (error) {
        console.error('Ошибка при создании токена:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.get('/parser', async (req, res) => {
    const exploits = await parser();
    res.json(exploits);
});

app.get('/vulnerabilities', async (req, res) => {
    const data = await getVulnerabilities()
    res.json(data)
});

app.post('/update-detection-script', async (req, res) => {
    const { id, detectionScript } = req.body;

    try {
        const data = await updateDetectionScript(id, detectionScript);
        res.json(data);
    } catch (error) {
        console.error('Ошибка при обновлении скрипта:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.get('/generate-exploit', async (req, res) => {
    const data = await generateDetectorFor(req.params.id)
    res.json(data)
})

app.get('/get-services', async (req, res) => {
    const domain = req.query.url; // Correct query parameter
    if (!domain) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }
  
    try {
      const data = await analyzeWebsite(domain);
      res.json(data);
    } catch (error) {
      console.error('Ошибка анализа:', error.message);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  });

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
