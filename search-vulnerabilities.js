const dataSource = require("./data-source");
const Vulnerability = require("./src/entity/vulnerability.entity");

async function searchVulnerabilities(query) {
    const vulnerabilityRepository = dataSource.getRepository(Vulnerability);

    const vulnerabilities = await vulnerabilityRepository.createQueryBuilder("vulnerability")
        .where("vulnerability.title ILIKE :query", { query: `%${query}%` })
        .orWhere("vulnerability.description ILIKE :query", { query: `%${query}%` })
        .orderBy("vulnerability.title", "ASC")
        .getMany();

    return vulnerabilities;
}

module.exports = searchVulnerabilities;