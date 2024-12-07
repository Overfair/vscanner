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
  You are a web analyst AI. Your task is to analyze the HTML content of a webpage and return a structured list of services and technologies used on the website.

Provide a JSON output containing:
1. "services": A list of detected JavaScript libraries, frameworks, third-party tools, and meta information indicating the site's technologies.

Return the result as a JSON object with no additional text, formatting, or code block markers.

Example output:
{
  "services": ["React", "Next.js", "Bootstrap", "Google Analytics", "Vue.js", "jQuery", "Laravel", "Express.js", "Django", "Flask", "Ruby on Rails", "Spring", "Express", "ASP.NET", "Node.js", "Socket.IO", "WebRTC", "WebGL", "WebAssembly", "Service Workers", "WebP", "AVIF", "WebP2", "WebP3", "WebP4", "WebP5", "WebP6", "WebP7", "WebP8", "WebP9", "WebP10"]
}

HTML content of the webpage is provided below. Analyze it carefully.
`;

  try {
    const ip = await resolveDomainToIP(domain);
    const url = `http://${domain}`;
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
      response_format: { type: 'json_object' }
    });

    const services = JSON.parse(completion.choices[0].message.content);
    return services;
  } catch (error) {
    console.error(`Ошибка при анализе ${domain}: ${error.message}`);
    return { error: `Не удалось проанализировать: ${error.message}` };
  }
}

module.exports = analyzeWebsite;