const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "Scan",
    tableName: "scans",
    columns: {
        id: {
            primary: true,
            type: "uuid",
            generated: "uuid",
        },
        ips: {
            type: "simple-array",
        },
        domains: {
            type: "simple-array",
        },
        startedAt: {
            type: "timestamp",
            nullable: true,
        },
        failMessage: {
            type: "varchar",
            nullable: true,
        },
        completedAt: {
            type: "timestamp",
            nullable: true,
        },
        createdAt: {
            type: "timestamp",
            default: () => "CURRENT_TIMESTAMP",
        },
        botTokenId: {
            type: "uuid",
            nullable: true,
        },
    },
    relations: {
        bot_token: {
            target: "BotToken",
            type: "many-to-one",
            joinColumn: true,
            eager: true,
        },
        scan_items: {
            target: "ScanItem",
            type: "one-to-many",
            inverseSide: "scan",
        },
    },
});