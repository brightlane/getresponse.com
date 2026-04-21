// agents/agent-4-writer.js
const generateArticle = async (outline, strategy) => {
  return `<h1>${outline.title}</h1><p>Mock content for keyword: ${outline.primaryKeyword}.</p>`;
};

module.exports = { generateArticle };
