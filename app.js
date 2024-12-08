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
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

// Enable CORS for all routes
app.use(cors({
    origin: '*', // Allow all origins - customize this in production
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

AppDataSource.initialize()
    .then(() => {
        console.log('Database connected and synchronized');
    })
    .catch((error) => {
        console.error('Database connection error:', error.message);
    });

/**
 * @swagger
 * /generate-token:
 *   post:
 *     summary: Сгенерировать токен для бота
 *     description: Генерация токена для использования бота
 *     tags:
 *       - Bot Tokens
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               botName:
 *                 type: string
 *                 description: Название бота
 *                 example: "ScanBotTest"
 *     responses:
 *       200:
 *         description: Успешно сгенерирован токен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Сгенерированный токен
 *                   example: "76b7d6fbcf739df5f1b11966c738b37882a7bdca91f9bdc1c9deaee241958229"
 *       400:
 *         description: Ошибка в теле запроса
 *       500:
 *         description: Внутренняя ошибка сервера
 */
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

/**
 * @swagger
 * /api/v1/vulnerabilities:
 *   get:
 *     summary: Список всех уязвимостей
 *     description: Получаем список всех спарсенных уязвимостей
 *     tags:
 *       - Vulnerabilities  
 *     responses:
 *       200:
 *         description: Список уязвимостей получен успешно
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: ID уязвимости
 *                     example: "518a3ab1-6db7-53c6-8827-9e15d38f363c"
 *                   title:
 *                     type: string
 *                     description: Название уязвимости
 *                     example: "Exploit for CVE-2024-41713"
 *                   score:
 *                     type: number
 *                     description: Оценка уязвимости по шкале CVSS
 *                     example: 7.5
 *                   description:
 *                     type: string
 *                     description: Подробное описание уязвимости
 *                     example: "An authentication bypass in WordPress plugins..."
 *                   href:
 *                     type: string
 *                     description: Ссылка на уязвимость
 *                     example: "https://example.com/exploit/12345"
 *                   published:
 *                     type: string
 *                     format: date
 *                     description: Дата публикации
 *                     example: "2024-12-01"
 *                   type:
 *                     type: string
 *                     enum: [PoC, exploit]
 *                     description: Вид уязвимости
 *                     example: "exploit"
 *                   detectionScript:
 *                     type: string
 *                     nullable: true
 *                     description: Сгенерированный скрипт для проверки наличия данной уязвимости
 *                   contentType:
 *                     type: string
 *                     nullable: true
 *                     description: Вид получаемого ответа
 *                     example: "json"
 *                   technologiesUsed:
 *                     type: array
 *                     nullable: true
 *                     description: Список используемых сервисов/библиотек
 *                     items:
 *                       type: string
 *                       example: "WordPress"
 *       500:
 *         description: Внутренняя ошибка сервера
 */
app.get('/api/v1/vulnerabilities', async (req, res) => {
    const data = await getVulnerabilities()
    res.json(data)
});

/**
 * @swagger
 * /scans:
 *   get:
 *     summary: Получить все сканирования
 *     description: Получаем список всех сканирований, с вложенными scan-item
 *     tags:
 *       - Scans
 *     responses:
 *       200:
 *         description: Список сканирований получен успешно
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: ID сканирования
 *                     example: "518a3ab1-6db7-53c6-8827-9e15d38f363c"
 *                   ips:
 *                     type: array
 *                     description: Список сканированных ip адресов
 *                     items:
 *                       type: string
 *                       example: "192.168.1.1"
 *                   domains:
 *                     type: array
 *                     description: Список сканированных доменов
 *                     items:
 *                       type: string
 *                       example: "example.com"
 *                   started_at:
 *                     type: string
 *                     format: date-time
 *                     description: Время начала сканирования
 *                     example: "2024-12-07T10:00:00Z"
 *                   completed_at:
 *                     type: string
 *                     format: date-time
 *                     nullable: true
 *                     description: Время завершения сканирования
 *                     example: "2024-12-07T11:00:00Z"
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                     description: Время создания сканирования
 *                     example: "2024-12-07T09:00:00Z"
 *                   botTokenId:
 *                     type: string
 *                     nullable: true
 *                     description: ID использованного токена
 *                     example: "9b7d6fbc-f739-41b5-1196-738b37882a7b"
 *                   scan_items:
 *                     type: array
 *                     description: Список вложенных scan-item
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           description: ID scan-item
 *                           example: "7f8c2ab1-6d77-53c6-8e19-9518d38f301d"
 *                         ip:
 *                           type: string
 *                           nullable: true
 *                           description: Сканированный ip адрес
 *                           example: "192.168.1.1"
 *                         domain:
 *                           type: string
 *                           nullable: true
 *                           description: Сканированный домен
 *                           example: "example.com"
 *                         vulnerabilities:
 *                           type: array
 *                           nullable: true
 *                           description: Список использованных уязвимостей
 *                           items:
 *                             type: string
 *                             example: "uuid1"
 *                         passedExploits:
 *                           type: integer
 *                           description: Число уязвимостей, которые тестировались на заданном адресе
 *                           example: 5
 *                         foundExploits:
 *                           type: array
 *                           nullable: true
 *                           description: Список обнаруженных уязвимостей
 *                           items:
 *                             type: string
 *                             example: "exploit1"
 *                         failedExploits:
 *                           type: object
 *                           nullable: true
 *                           description: Список неудачных тестирований
 *                           example: { "exploit1": "Error message" }
 *                         startedAt:
 *                           type: string
 *                           format: date-time
 *                           nullable: true
 *                           description: Время начала сканирования
 *                           example: "2024-12-07T10:00:00Z"
 *                         completedAt:
 *                           type: string
 *                           format: date-time
 *                           nullable: true
 *                           description: Время завершения сканирования
 *                           example: "2024-12-07T11:00:00Z"
 *       500:
 *         description: Внутренняя ошибка сервера
 */
app.get('/scans', async (req, res) => {
    try {
      const data = await getScans();
      res.json(data);
    } catch (error) {
      console.error("Error fetching scans:", error.message);
      res.status(500).json({ message: "Failed to fetch scans" });
    }
  });
app.get('/scans', async (req, res) => {
    const data = await getScans()
    res.json(data)
});

app.get('/tokens', async (req, res) => {
    const data = await getTokens()
    res.json(data)
});

/**
 * @swagger
 * /vulnerabilities/search:
 *   get:
 *     summary: Поиск уязвимостей
 *     description: Поиск уязвимостей по названию либо описанию
 *     tags:
 *       - Vulnerabilities
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *           description: Поиск в тексте
 *           example: "WordPress"
 *     responses:
 *       200:
 *         description: Список найденных уязвимостей
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: ID уязвимости
 *                     example: "518a3ab1-6db7-53c6-8827-9e15d38f363c"
 *                   title:
 *                     type: string
 *                     description: Название уязвимости
 *                     example: "Exploit for CVE-2024-41713"
 *                   description:
 *                     type: string
 *                     description: Описание уязвимости
 *                     example: "An authentication bypass vulnerability in WordPress plugins..."
 *                   published:
 *                     type: string
 *                     format: date
 *                     description: Дата публикации
 *                     example: "2024-12-05"
 *                   type:
 *                     type: string
 *                     enum: [PoC, exploit]
 *                     description: Вид уязвиости
 *                     example: "exploit"
 *       400:
 *         description: Ошибка в заданном параметре
 *       500:
 *         description: Внутренняя ошибка сервера
 */
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

/**
 * @swagger
 * /generate-exploit:
 *   get:
 *     summary: Генерация скрипта для тестирования уязвимости
 *     description: Генерация скрипта на базе имеющихся данных с помощью Open AI API
 *     tags:
 *       - Vulnerabilities
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           description: ID уязвимости для которой нужно создать скрипт
 *           example: "1337DAY-ID-34108"
 *     responses:
 *       200:
 *         description: Скрипт сгенерирован успешно
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 detect:
 *                   type: string
 *                   description: Сгенерированный скрпит
 *                   example: "async function detect(url) { ... }"
 *                 forContentType:
 *                   type: string
 *                   description: Тип контента
 *                   example: "json"
 *                 technologiesUsed:
 *                   type: array
 *                   description: Список сервисов/библиотек связанный с уязвимостью
 *                   items:
 *                     type: string
 *                     example: "WordPress"
 *       400:
 *         description: Отсутствует параметр `id`.
 *       404:
 *         description: Не найдена уязвимость с заданным ID.
 *       500:
 *         description: Внутренняя ошибка сервера.
 */
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
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

/**
 * @swagger
 * /api/v1/scan:
 *   post:
 *     summary: Запуск сканирования
 *     description: Запускает сканирование по выбранным ip/domain и уязвимостям
 *     tags:
 *       - Scans
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               scan_items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     ip:
 *                       type: string
 *                       description: IP адрес.
 *                     domain:
 *                       type: string
 *                       description: Домен.
 *                     vulnerabilities:
 *                       type: array
 *                       description: Список уязвимостей, по которым нужно провести проверку.
 *                       items:
 *                         type: string
 *                         example: "MSF:EXPLOIT-MULTI-HTTP-WP_REALLYSIMPLESSL_2FA_BYPASS_RCE-"
 *           example:
 *             scan_items:
 *               - ip: ""
 *                 domain: "https://scout.fi.tempcloudsite.com"
 *                 vulnerabilities:
 *                   - "MSF:AUXILIARY-ADMIN-HTTP-WP_POST_SMTP_ACCT_TAKEOVER-"
 *                   - "MSF:EXPLOIT-MULTI-HTTP-WP_REALLYSIMPLESSL_2FA_BYPASS_RCE-"
 *     parameters:
 *       - in: header
 *         name: bot-token
 *         required: true
 *         description: Токен для авторизации запроса
 *         schema:
 *           type: string
 *           example: "76b7d6fbcf739df5f1b11966c738b37882a7bdca91f9bdc1c9deaee241958229"
 *     responses:
 *       200:
 *         description: Сканирование успешно запущено
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 scanId:
 *                   type: string
 *                   description: ID созданного сканирования
 *                 scanItems:
 *                   type: array
 *                   description: Список созданных scan-items
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: ID scan-item
 *       400:
 *         description: Неверное тело запроса
 *       401:
 *         description: Отсутствует либо просрочен токен
 *       500:
 *         description: Внутренняя ошибка сервера
 */
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
    console.log(`Swagger доступен на http://localhost:${PORT}/api-docs`);
});
