const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "BotToken",
    tableName: "bot_tokens",
    columns: {
        id: {
            primary: true,
            type: "uuid",
            generated: "uuid",
        },
        token: {
            type: "varchar",
            unique: true,
            length: 255,
        },
        botName: {
            type: "varchar",
            length: 100,
        },
        createdAt: {
            type: "timestamp",
            default: () => "CURRENT_TIMESTAMP",
        },
        expiresAt: {
            type: "timestamp",
            nullable: true,
        },
        isActive: {
            type: "boolean",
            default: true,
        },
    },
    relations: {
        scans: {
            target: "Scan",
            type: "one-to-many",
            inverseSide: "botToken",
        },
    },
});