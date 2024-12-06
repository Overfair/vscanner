const puppeteer = require("puppeteer");
const dataSource = require('./data-source');
const vulnerability = require("./src/entity/vulnerability.entity");

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

async function parser() {
  const exploits = await parseExploits('exploit');
  await dataSource.getRepository(vulnerability).upsert(
    exploits.map(expl => ({
      id: expl.id,
      title: expl.title,
      score: expl.score,
      description: expl.source,
      href: expl.href,
      published: new Date(expl.published),
      type: 'exploit',
    })),
    { conflictPaths: ['id'] }
  );
  const pocs = await parseExploits('POC');
  await dataSource.getRepository(vulnerability).upsert(
    pocs.map(poc => ({
      id: poc.id,
      title: poc.title,
      score: poc.score,
      description: poc.source,
      href: poc.href,
      published: new Date(poc.published),
      type: 'PoC',
    })),
    { conflictPaths: ['id'] }
  );
  return { exploits, pocs };
}

module.exports = parser;