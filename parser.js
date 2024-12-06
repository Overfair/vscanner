const puppeteer = require("puppeteer");

async function parser(query='exploit') {
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

module.exports = parser;