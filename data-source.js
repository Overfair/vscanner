const { DataSource } = require("typeorm");
require("dotenv").config();
const Vulnerability = require("./src/entity/vulnerability");

const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    synchronize: true,
    logging: true,
    entities: [Vulnerability],
});

module.exports = AppDataSource;
