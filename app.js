const express = require('express');
const AppDataSource = require('./data-source');
const app = express();
const parser = require('./parser');
const generateDetectorFor = require('./generate-detector');
const getVulnerabilities = require('./get-vulnerabilities');
const analyzeWebsite = require('./analyze-services');
const updateDetectionScript = require('./update-detection-script');
const generateToken = require("./generate-token");
const getScans = require('./get-scans');
const getTokens = require('./get-tokens');
const searchVulnerabilities = require("./search-vulnerabilities");
const cors = require('cors');
const scanAll = require('./scan');

// Enable CORS for all routes
app.use(cors({
    origin: '*', // Allow all origins - customize this in production
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

AppDataSource.initialize()
    .then(() => {
        console.log('Database connected and synchronized');
    })
    .catch((error) => {
        console.error('Database connection error:', error.message);
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

app.get('/api/v1/vulnerabilities', async (req, res) => {
    const data = await getVulnerabilities()
    res.json(data)
});

app.get('/scans', async (req, res) => {
    const data = await getScans()
    res.json(data)
});

app.get('/tokens', async (req, res) => {
    const data = await getTokens()
    res.json(data)
});

app.get("/vulnerabilities/search", async (req, res) => {
    const { query, query2, query3, query4 } = req.query;
    try {
        const results = await searchVulnerabilities(query, query2, query3, query4);
        res.json(results);
    } catch (error) {
        console.error("Ошибка:", error.message);
        res.status(500).json({ error: "Ошибка при поиске уязвимостей" });
    }
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

app.post('/api/v1/scan', async (req, res) => {
    try {
        const botTokenHeader = req.headers["bot-token"];
        if (!botTokenHeader) {
            return res.status(401).json({ message: "Отсутсвует токен" });
        }
            const { scan_items } = req.body;

        if (!Array.isArray(scan_items)) {
            return res.status(400).json({ message: "Тело запроса должно содержать массив объектов" });
        }

        const data = await scanAll(scan_items, botTokenHeader);

        res.json(data);
    } catch (e) {
        console.error("Ошибка:", e.message);
        res.status(500).send({ message: e.message });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
