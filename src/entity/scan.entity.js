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
        started_at: {
            type: "timestamp",
            nullable: true,
        },
        fail_message: {
            type: "varchar",
            nullable: true,
        },
        completed_at: {
            type: "timestamp",
            nullable: true,
        },
        created_at: {
            type: "timestamp",
            default: () => "CURRENT_TIMESTAMP",
        },
        bot_token_id: {
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