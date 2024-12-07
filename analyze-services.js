const openai = require('openai');
const axios = require('axios');
const dns = require('dns').promises;

async function resolveDomainToIP(domain) {
  try {
    const address = await dns.lookup(domain);
    return address.address;
  } catch (err) {
    throw new Error(`Ошибка при разрешении домена ${domain}: ${err.message}`);
  }
}

async function analyzeWebsite(domain) {
  console.log({ domain });
  const SYSTEM_PROMPT = `
  You are a web analyst AI. Your task is to analyze the HTML content of a webpage and identify the services and technologies used on the website.

  Provide a structured JSON output containing:
  1. A list of JavaScript files loaded on the page (full URLs).
  2. A list of CSS files loaded on the page (full URLs).
  3. Key meta tag content values.
  
  Return the result as a pure JSON object with no additional text, formatting, or code block markers.
  
  Example output:
  {
    "scripts": ["https://example.com/script1.js", "https://cdn.example.com/lib.js"],
    "stylesheets": ["https://example.com/style.css", "https://cdn.example.com/theme.css"],
    "meta": ["Description: Example website", "Author: John Doe"]
  }
  
  HTML content of the webpage is provided below. Analyze it carefully.
`;

  try {
    const ip = await resolveDomainToIP(domain);
    const url = `https://${domain}`;
    console.log(`Analyzing services for: ${url} (IP: ${ip})`);

    const { data: html } = await axios.get(url);

    const client = new openai({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `HTML content:\n${html}` },
      ],
      temperature: 0.7,
      max_tokens: 5000,
    });

    const services = JSON.parse(completion.choices[0].message.content);
    return services;
  } catch (error) {
    console.error(`Ошибка при анализе ${domain}: ${error.message}`);
    return { error: `Не удалось проанализировать: ${error.message}` };
  }
}

module.exports = analyzeWebsite;