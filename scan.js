const dataSource = require("./data-source");
const scan = require("./src/entity/scan.entity");
const scanItem = require("./src/entity/scan-item.entity");
const botToken = require("./src/entity/bot-token.entity");
const axios = require('axios');

async function scanAll(scanData, botTokenHeader) {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  console.log("scanData received:", scanData);

  try {
    // Проверяем токен
    const botTokenRepository = dataSource.getRepository(botToken);
    const validToken = await botTokenRepository.findOne({ where: { token: botTokenHeader, isActive: true } });
    
    if (!validToken) {
      throw new Error("Токен не существует, либо деактивирован");
    }

    if (validToken.expiresAt && new Date(validToken.expiresAt) < new Date()) {
      throw new Error("Просроченный токен");
    }

    // Разделяем IP и домены
    const ips = scanData
      .filter((item) => item.ip && !item.domain)
      .map((item) => item.ip);
    const domains = scanData
      .filter((item) => item.domain && !item.ip)
      .map((item) => item.domain);

    // Создаем запись в таблице Scan
    const scanRepository = dataSource.getRepository(scan);
    const newScan = await scanRepository.save(
      scanRepository.create({
        ips,
        domains,
      })
    );

    // Создаем записи в таблице ScanItem
    const scanItemRepository = dataSource.getRepository(scanItem);
    const scanItems = [];

    for (const item of scanData) {
      const createdItem = await scanItemRepository.save(
        scanItemRepository.create({
          ip: item.ip || null,
          domain: item.domain || null,
          vulnerabilities: item.vulnerabilities,
          scan_id: newScan.id,
        })
      );
      scanItems.push(createdItem);
    }

    axios.get(`https://xec2e00cgl.execute-api.us-east-1.amazonaws.com/scan_id=${newScan.id}`)
      .catch(e => {
        console.log('Lambda Scan Error:', e.message)
      })

    await queryRunner.commitTransaction();

    return {
      scanId: newScan.id,
      scanItems,
    };
  } catch (error) {
    console.error("Ошибка при обработке сканирования:", error.message);
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}

module.exports = scanAll;