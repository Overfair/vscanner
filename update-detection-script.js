const dataSource = require('./data-source');
const vulnerability = require("./src/entity/vulnerability.entity");

async function updateDetectionScript(id, detectionScript) {
  const vulnerabilityRepository = dataSource.getRepository(vulnerability);

  const result = await vulnerabilityRepository.update(id, { detectionScript });

  if (result.affected === 0) {
    throw new Error(`Не найдена уязвимость: ${id}`);
  }

  return { message: 'Скрипт обновлен успешно!' };
}

module.exports = updateDetectionScript;