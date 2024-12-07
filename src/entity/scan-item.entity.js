const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "ScanItem",
    tableName: "scan_items",
    columns: {
        id: {
            primary: true,
            type: "uuid",
            generated: "uuid",
        },
        ip: {
            type: "varchar",
            nullable: true,
        },
        domain: {
            type: "varchar",
            nullable: true,
        },
        startedAt: {
            type: "timestamp",
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
        passedExploits: {
            type: "int",
            default: 0,
        },
        foundExploits: {
            type: "simple-array",
            nullable: true,
        },
        failedExploits: {
            type: "json",
            nullable: true
        }
    },
    relations: {
        scan: {
            target: "Scan",
            type: "many-to-one",
            joinColumn: true,
        },
    },
});