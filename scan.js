const axios = require('axios')
const net = require("net");
const scanItem = require("./src/entity/scan-item.entity");
const scan = require("./src/entity/scan.entity");
const dataSource = require("./data-source");

const DEFAULT_PORTS = [80, 443, 8080, 8443];

function checkPort(ip, port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });

    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });

    socket.connect(port, ip);
  });
}

function checkDomain(domain) {
  return new Promise((resolve) => {
    axios.get(`http://${domain}`)
      .then(() => resolve(true))
      .catch((e) => {
        if (e.response) {
          resolve(true)
        } else {
          resolve(false)
        }
      });
  });
}

async function scanAll(ips, domains) {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  const ipsWithPorts = []
  const skippedIps = []

  for (const ip of ips) {
    for (const port of DEFAULT_PORTS) {
      console.log(`Checking port ${port} for IP ${ip}`);
      if (await checkPort(ip, port)) {
        ipsWithPorts.push(`${ip}:${port}`);
      } else {
        skippedIps.push(`${ip}:${port}`);
      }
    }
  }
  console.log(ipsWithPorts);

  const workingDomains = []
  const skippedDomains = []
  for (const domain of domains) {
    if (await checkDomain(domain)) {
      workingDomains.push(domain);
    } else {
      skippedDomains.push(domain);
    }
  }

  console.log(workingDomains);

  try {
    const scanRepository = dataSource.getRepository(scan);
    const scanItemRepository = dataSource.getRepository(scanItem);

    const newScan = await scanRepository.save(
      scanRepository.create({
        ips: ipsWithPorts,
        domains,
        startedAt: new Date()
      })
    );

    const scanItems = [];
    
    for (const ip of ipsWithPorts) {
      const item = await scanItemRepository.save(
        scanItemRepository.create({
          ip,
          scan: newScan,
          startedAt: new Date()
        })
      );
      scanItems.push(item);
    }

    for (const domain of domains) {
      const item = await scanItemRepository.save(
        scanItemRepository.create({
          domain,
          scan: newScan,
          startedAt: new Date()
        })
      );
      scanItems.push(item);
    }

    await axios.get(`https://xec2e00cgl.execute-api.us-east-1.amazonaws.com/scan_id=${scan.id}`)

    await queryRunner.commitTransaction();

    return {
      scanItems,
      skippedIps,
      skippedDomains
    };
  } catch (err) {
    await queryRunner.rollbackTransaction();
    throw err;
  } finally {
    await queryRunner.release();
  }
}

module.exports = scanAll;