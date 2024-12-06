const dataSource = require('./data-source');
const vulnerability = require("./src/entity/vulnerability.entity");

async function getVulnerabilities() {
  const vulnerabilityRepository = dataSource.getRepository(vulnerability);
  const vulnerabilities = await vulnerabilityRepository.find({
    order: {
      published: 'DESC'
    }
  });
  return vulnerabilities;
}

module.exports = getVulnerabilities;
