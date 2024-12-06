const axios = require('axios');
const cheerio = require('cheerio');
const dns = require('dns').promises; // Using promises for cleaner async/await syntax

async function resolveDomainToIP(domain) {
  try {
    const address = await dns.lookup(domain);
    return address.address; // Extract the IP address
  } catch (err) {
    throw new Error(`Ошибка при разрешении домена ${domain}: ${err.message}`);
  }
}

async function analyzeWebsite(domain) {
  try {
    // Check if the domain is valid
    if (!domain || typeof domain !== 'string') {
      throw new Error('Некорректный домен. Укажите правильный домен.');
    }

    // Resolve the domain to its IP address
    const ip = await resolveDomainToIP(domain);

    // Form a URL using HTTPS (most modern sites require HTTPS)
    const url = `https://${domain}`; // Use the original domain in the URL
    console.log(`Анализ сайта через домен: ${url} (IP: ${ip})`);

    // Fetch the website's HTML
    const { data } = await axios.get(url, {
      headers: {
        Host: domain, // Ensure the Host header matches the domain
      },
    });

    // Load HTML using Cheerio
    const $ = cheerio.load(data);

    // Array to store detected services
    const services = [];

    // Find scripts and stylesheets
    $('script[src], link[rel="stylesheet"]').each((index, element) => {
      const src = $(element).attr('src') || $(element).attr('href');
      if (src) {
        services.push(src.startsWith('http') ? src : `${url}${src}`);
      }
    });

    // Find meta tags
    $('meta').each((index, element) => {
      const content = $(element).attr('content');
      if (content) {
        services.push(content);
      }
    });

    return services;
  } catch (error) {
    console.error(`Ошибка при анализе сайта ${domain}: ${error.message}`);
    return { error: `Ошибка: ${error.message}` };
  }
}

module.exports = analyzeWebsite;