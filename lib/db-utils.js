// lib/db-utils.js
// Basic mock DB utils so module import works

const getKeywords = () => {
  return [];
};

const appendKeywords = (keywords, strategy) => {
  // In real version you’d write to JSON file or DB
  console.log("Appended keywords:", keywords.length);
};

const saveArticle = (article, strategy) => {
  console.log("Saved article:", article.url);
};

const logObservation = (observation) => {
  console.log("Observation:", observation);
};

const getLatestStrategy = (strategy) => {
  return strategy;
};

const getRankedPages = () => {
  return [];
};

const getArticlesForRepair = (strategy) => {
  return [];
};

const markArticleAsRepaired = (article, strategy) => {
  console.log("Marked as repaired:", article.url);
};

module.exports = {
  getKeywords,
  appendKeywords,
  saveArticle,
  logObservation,
  getLatestStrategy,
  getRankedPages,
  getArticlesForRepair,
  markArticleAsRepaired
};
