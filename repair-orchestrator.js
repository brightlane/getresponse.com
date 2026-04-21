// repair-orchestrator.js
// Repair loop for the 11‑AI‑team‑brain
// Re‑runs low‑quality / broken articles through agents 5–10 (+11) to fix and re‑publish

const { getArticlesForRepair, markArticleAsRepaired, logObservation } = require('./lib/db-utils');
const { globalRulesPrompt } = require('./lib/global-rules');
const { buildFullPrompt, readRolePrompt } = require('./lib/agents-prompt-builder');
const { validateAffiliateLinks } = require('./lib/affiliates-validator');
const getResponseConfig = require('./lib/getresponse-config');

// 11 AI agents (re‑use same exports)
const { makeReadable } = require('./agents/agent-5-readability');
const { editArticle } = require('./agents/agent-6-editor');
const { factCheckArticle } = require('./agents/agent-7-fact-check');
const { technicalSeoOptimize } = require('./agents/agent-8-technical-seo');
const { monitorPerformance } = require('./agents/agent-9-monitoring');
const { enforcePolicy } = require('./agents/agent-10-policy');
const { generateShortVideoScript } = require('./agents/agent-11-social-video');


// ================
// 1. Global config
// ================

const runRepairLoop = async (strategy) => {
  strategy = {
    domain: "yoursite.com",
    basePath: "",
    affiliate_id: "your_affiliate_id",
    dbPath: "./data/articles.json",
    maxToRepair: 100,            // limit per run
    agentTimeoutMs: 30000,
    getResponse: getResponseConfig,
    ...strategy
  };

  // 1. Agent 5–9 – Fetch articles that need repair
  const repairCandidates = await getArticlesForRepair(strategy);
  if (!repairCandidates || repairCandidates.length === 0) {
    logObservation({
      type: "no_repair_candidates",
      agent: "repair-orchestrator"
    });
    return;
  }

  const toRepair = repairCandidates.slice(0, strategy.maxToRepair);

  logObservation({
    type: "repair_loop_start",
    count: toRepair.length,
    agent: "repair-orchestrator"
  });

  // 2. For each article, run repair chain
  const repairedArticles = [];
  const repairedVideos = [];

  for (const article of toRepair) {
    let body = article.body;

    try {
      // 5. Agent 5 – Readability fix
      body = await makeReadable(body, strategy);

      // 6. Agent 6 – Edit fix
      body = await editArticle(body, strategy);

      // 7. Agent 7 – Fact check fix
      body = await factCheckArticle(body, strategy);

      // 8. Agent 8 – SEO + link + video‑CTA cleanup
      body = await technicalSeoOptimize(body, strategy);

      // 10. Agent 10 – Policy / EEAT / compliance fix
      body = await enforcePolicy(body, strategy, globalRulesPrompt);

      // 9. Agent 9 – Validate & fix affiliate links
      body = validateAffiliateLinks(body, strategy);

      // Updated article
      const repairedArticle = { ...article, body, repairedAt: new Date().toISOString() };
      repairedArticles.push(repairedArticle);

      // 11. Agent 11 – Re‑generate video script (in case structure changed)
      const videoScript = generateShortVideoScript(repairedArticle, strategy);
      repairedVideos.push({
        url: repairedArticle.url,
        videoScript
      });

      // Mark as repaired in DB
      await markArticleAsRepaired(repairedArticle, strategy);

      logObservation({
        page_url: repairedArticle.url,
        type: "article_repaired",
        agent: "repair-orchestrator"
      });

    } catch (error) {
      logObservation({
        page_url: article.url,
        type: "repair_failed",
        message: error.message,
        agent: "repair-orchestrator",
        step: "agent_repair_chain"
      });
    }
  }

  // 3. Agent 9 – Log repair stats
  await monitorPerformance(repairedArticles, strategy);

  logObservation({
    type: "repair_loop_end",
    repaired: repairedArticles.length,
    with_video: repairedVideos.length,
    agent: "repair-orchestrator"
  });
};


// ========
// Run fn
// ========

const run = async (strategy) => {
  console.log("🔧 Starting repair‑orchestrator...");

  try {
    await runRepairLoop(strategy);
    console.log("✅ Repair loop completed.");
  } catch (error) {
    console.error("🚨 Repair orchestrator error:", error);
    logObservation({
      type: "repair_orchestrator_error",
      message: error.message,
      stack: error.stack,
      agent: "repair-orchestrator"
    });
  }
};


// Exports
module.exports = {
  runRepairLoop,
  run
};


// ========
// Execute if run directly (node repair-orchestrator.js)
// ========

if (require.main === module) {
  const strategy = {
    domain: "yoursite.com",
    dbPath: "./data/articles.json"
  };
  run(strategy);
}
