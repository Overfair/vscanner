const dataSource = require('./data-source');
const token = require("./src/entity/bot-token.entity");

async function getTokens() {
  const tokenRepository = dataSource.getRepository(token);
  const tokens = await tokenRepository.find({
    order: {
      created_at: 'DESC'
    }
  });
  return tokens;
}

module.exports = getTokens;
