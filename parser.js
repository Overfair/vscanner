const puppeteer = require("puppeteer");
const dataSource = require('./data-source');
const vulnerability = require("./src/entity/vulnerability.entity");
const generateDetector = require("./generate-detector");

async function parseExploits(query='exploit') {
  let exploits = [];
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on('request', request => {
    request.continue();
  });
  page.on('response', async response => {
    if (response.url().includes('https://sploitus.com/search')) {
      const json = await response.json();
      exploits = json.exploits
    }
  });
  await page.goto(`https://sploitus.com/?query=${query}#exploits`);
  await new Promise(resolve => setTimeout(resolve, 1000));
  await page.waitForSelector('span.label[data-id="date"]');
  await page.click('span.label[data-id="date"]');
  await new Promise(resolve => setTimeout(resolve, 4000));
  await browser.close();
  return exploits;
}

async function generateDetectorAndSave(exploits, type) {
  const items = []
  for (const exploit of exploits) {
    const detectResponse = await generateDetector(exploit.source)
    items.push(await dataSource.getRepository(vulnerability).upsert({
      id: exploit.id,
      title: exploit.title,
      score: exploit.score,
      description: exploit.source,
      href: exploit.href,
      published: new Date(exploit.published),
      detectionScript: detectResponse.detect,
      contentType: detectResponse.forContentType,
      technologiesUsed: detectResponse.technologiesUsed,
      type,
    }, { conflictPaths: ['id'] }))
  }
  return items
}

async function parser() {
  const exploits = await parseExploits('GPON');
  await generateDetectorAndSave(exploits, 'exploit')
  return exploits
  // const exploits = await parseExploits('exploit');
  // await generateDetectorAndSave(exploits, 'exploit')

  // const pocs = await parseExploits('POC');
  // await generateDetectorAndSave(pocs, 'PoC')

  // return { exploits, pocs };
}

module.exports = parser;