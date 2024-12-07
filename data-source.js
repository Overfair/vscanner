const { DataSource } = require("typeorm");
require("dotenv").config();
const Vulnerability = require("./src/entity/vulnerability.entity");
const BotToken = require("./src/entity/bot-token.entity");
const Scan = require("./src/entity/scan.entity");
const ScanItem = require("./src/entity/scan-item.entity");

const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    synchronize: true,
    logging: true,
    entities: [Vulnerability, BotToken, Scan, ScanItem],
});

module.exports = AppDataSource;
