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
        started_at: {
            type: "timestamp",
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
        passed_exploits: {
            type: "int",
            default: 0,
        },
        found_exploits: {
            type: "json",
            nullable: true,
        },
        failed_exploits: {
            type: "json",
            nullable: true
        },
        vulnerabilities: {
            type: "simple-array",
            nullable: true,
        },
        scan_id: {
            type: "uuid",
            nullable: true,
        },
    },
    relations: {
        scan: {
            target: "Scan", 
            type: "many-to-one",
            joinColumn: {
                name: "scan_id"
            },
            eager: true
        },
    },
});