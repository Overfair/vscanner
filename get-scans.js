const dataSource = require('./data-source');
const scan = require("./src/entity/scan.entity");

async function getScans() {
  const scanRepository = dataSource.getRepository(scan);
  const scans = await scanRepository.find({
    relations: {
      scan_items: true
    },
    order: {
      createdAt: 'DESC'
    }
  });
  return scans;
}

module.exports = getScans;
