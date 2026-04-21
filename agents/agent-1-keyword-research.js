// agents/agent-1-keyword-research.js

async function generateKeywords(strategy) {
  // In real use, this would call OpenAI / GetResponse / data source
  const keywords = [
    "ai marketing automation",
    "email marketing strategies",
    "seo content automation",
    "getresponse tutorials",
    "ai blogging system"
  ];

  return keywords.slice(0, strategy.numKeywords || 50);
}

module.exports = {
  generateKeywords
};
