const dataSource = require("./data-source");
const Vulnerability = require("./src/entity/vulnerability.entity");

async function searchVulnerabilities(query) {
    const vulnerabilityRepository = dataSource.getRepository(Vulnerability);

    if (!query) {
        return vulnerabilityRepository.find({
            order: {
                published: 'DESC'
            }
        })
    }

    return vulnerabilityRepository.createQueryBuilder("vulnerability")
        .where("vulnerability.title ILIKE :query", { query: `%${query}%` })
        .orWhere("vulnerability.description ILIKE :query", { query: `%${query}%` })
        .orderBy("vulnerability.title", "ASC")
        .getMany();
}

module.exports = searchVulnerabilities;