const openai = require('openai');
const axios = require('axios');
const dns = require('dns').promises;

async function analyzeWebsite(domain) {
  console.log({ domain });
  const SYSTEM_PROMPT = `
  You are a web analyst AI. Your task is to analyze the HTML content of a webpage and return a structured list of services and technologies used on the website.

Provide a JSON output containing:
1. "services": A list of detected JavaScript libraries, frameworks, third-party tools, and meta information indicating the site's technologies.

Return the result as a JSON object with no additional text, formatting, or code block markers.

Example output:
{
  "services": ["React", "Next.js", "Bootstrap", "Google Analytics", "Vue.js", "jQuery", "Laravel", "Express.js", "Django", "Flask", "Ruby on Rails", "Spring", "Express", "ASP.NET", "Node.js", "Socket.IO", "WebRTC", "WebGL", "WebAssembly", "GPON", "Dlink", "TP-Link", "Netgear", "Linksys", "Xiaomi", "Huawei", "Zyxel", "DrayTek", "Sagemcom", "Sagem", "ZyXEL", "Sagem", "ZyXEL", "Sagem", "ZyXEL", "Sagem", "ZyXEL", "Sagem", "ZyXEL"]
}

HTML content of the webpage is provided below. Analyze it carefully.
`;
  const url = domain.startsWith('http') ? domain : `http://${domain}`;
  try {
    const { data: html } = await axios.get(url);
    console.log(html);

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
    console.error(`Ошибка при анализе ${url}: ${error.message}`);
    return { error: `Не удалось проанализировать: ${error.message}` };
  }
}

module.exports = analyzeWebsite;