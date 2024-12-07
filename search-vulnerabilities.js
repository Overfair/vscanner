const dataSource = require("./data-source");
const Vulnerability = require("./src/entity/vulnerability.entity");

async function searchVulnerabilities(query, query2, query3, query4) {
    const vulnerabilityRepository = dataSource.getRepository(Vulnerability);

    if (!query) {
        return vulnerabilityRepository.find({
            order: {
                published: 'DESC'
            }
        })
    }

    const queryBuilder = vulnerabilityRepository.createQueryBuilder("vulnerability")
        .where("vulnerability.title ILIKE :query", { query: `%${query}%` })
        .orWhere("vulnerability.description ILIKE :query", { query: `%${query}%` })
        .orderBy("vulnerability.title", "ASC")

    if (query2) {
        queryBuilder.orWhere("vulnerability.title ILIKE :query2", { query2: `%${query2}%` })
        queryBuilder.orWhere("vulnerability.description ILIKE :query2", { query2: `%${query2}%` })
    }

    if (query3) {
        queryBuilder.orWhere("vulnerability.title ILIKE :query3", { query3: `%${query3}%` })
        queryBuilder.orWhere("vulnerability.description ILIKE :query3", { query3: `%${query3}%` })
    }

    if (query4) {
        queryBuilder.orWhere("vulnerability.title ILIKE :query4", { query4: `%${query4}%` })
        queryBuilder.orWhere("vulnerability.description ILIKE :query4", { query4: `%${query4}%` })
    }

    return queryBuilder.getMany();
}

module.exports = searchVulnerabilities;