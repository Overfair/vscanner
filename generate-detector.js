const openai = require('openai')
const dataSource = require('./data-source');
const vulnerability = require("./src/entity/vulnerability.entity");

require("dotenv").config();

const SYSTEM_PROMPT = `
You are a whitehat programmer. Write a Node.js function called “detect”. The function will check if a given IP address or domain is vulnerable to a specified exploit. You will be provided with an exploit code in various languages (Python, Bash, C, etc.), which describes the exploit. Your task is to carefully inspect this script and write code to detect if the given IP address or domain is vulnerable to this exploit.

The function should:

1. Be named “detect”.
2. Take an IP address or domain as input.
3. Return a true/false value indicating if the target is vulnerable.
4. Use the libraries: Puppeteer, Cheerio, Axios.
5. You do not need to write the actual exploit, just check if the target is vulnerable.
6. DO NOT answer until you have received the exploit.
7. Return ONLY Node.js code as the output.

Example Exploit:
## https://sploitus.com/exploit?id=44F3C703-F221-5461-9B2A-AB14C3A722EF
# CVE-2024-10924: Wordpress Really Simple Security authentication bypass flaw in Docker
The Really Simple Security plugins (Free, Pro, and Pro Multisite) for WordPress, versions 9.0.0 to 9.1.1.1, are affected by an authentication bypass vulnerability.
This issue arises due to improper error handling in the check_login_and_get_user function used in two-factor REST API actions.
Unauthenticated attackers can potentially log in as any existing user, including administrators, if the "Two-Factor Authentication" feature is enabled (disabled by default).

Vulnerable docker:
bash
git clone git@github.com:Trackflaw/CVE-2024-10924-Wordpress-Docker.git
cd CVE-2024-10924-Wordpress-Docker
docker compose up --build

Example Output:
const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

async function detect(url) {
    try {
        // Remove trailing slash if present
        url = url.replace(/\/$/, '');

        // Check if WordPress is running by checking wp-json endpoint
        const wpCheck = await axios.get(\${url}/wp-json);
        if (!wpCheck.ok) {
            return false; // Not a WordPress site
        }

        // Check if Really Simple Security plugin is installed by checking its REST API endpoint
        const rssCheck = await axios.get(\${url}/wp-json/really-simple-security/v1/version);
        if (!rssCheck.ok) {
            return false; // Plugin not installed
        }

        // Get plugin version
        const versionData = await rssCheck.json();
        const version = versionData?.version;
        
        if (!version) {
            return false;
        }

        // Check if version is in the vulnerable range (9.0.0 to 9.1.1.1)
        const isVulnerableVersion = version.match(/^9\.(0\.|1\.[0-1](\.[0-1])?)/) !== null;
        
        if (!isVulnerableVersion) {
            return false;
        }

        // Check if 2FA is enabled by attempting to access the 2FA endpoint
        const twoFACheck = await fetch(\${url}/wp-json/really-simple-security/v1/two-factor/verify);
        const is2FAEnabled = twoFACheck.status !== 404;

        return is2FAEnabled;

    } catch (error) {
        console.error('Error during vulnerability check:', error);
        return false;
    }
}

module.exports = detect;

RESPOND ONLY in Following json Format {
"detect": "",
"forContentType": "json", // "json" | "html" | "text" etc...
"technologiesUsed": ["Wordpress", "React" ...]
}`

async function generateDetector(exploitText) {
  console.log({exploitText})
  const client = new openai({ apiKey: process.env.OPENAI_API_KEY })
    const completion = await client.chat.completions.create({
        model: "gpt-4o",
        messages: [{
            role: "system",
            content: SYSTEM_PROMPT
        }, {
            role: "user", 
            content: exploitText
        }],
        temperature: 0.7,
        max_tokens: 5000,
        response_format: { type: "json_object" }
    });

    return JSON.parse(completion.choices[0].message.content);
}

async function generateDetectorFor(id) {
    const v = await dataSource.getRepository(vulnerability).findOneByOrFail({ id });

    const detectorData = await generateDetector(v.description);
    
    await dataSource.getRepository(vulnerability).save({
        id: v.id,
        detectionScript: detectorData.detect,
        contentType: detectorData.forContentType,
        technologies: detectorData.technologiesUsed,
    });

    return detectorData;
}

module.exports = generateDetectorFor