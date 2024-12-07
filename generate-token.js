const crypto = require("crypto");
const dataSource = require("./data-source");
const BotToken = require("./src/entity/bot-token.entity");

async function generateToken(botName, expiresAt = null) {
    const botTokenRepository = dataSource.getRepository(BotToken);

    const token = crypto.randomBytes(32).toString("hex");

    const newToken = botTokenRepository.create({
        token,
        botName,
        expiresAt,
    });

    await botTokenRepository.save(newToken);

    return token;
}

module.exports = generateToken;