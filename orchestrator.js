// orchestrator.js
// Main orchestration file for the 11‑AI‑team‑brain
// Handles: keyword research → topic clusters → outline → article → social video → repair loop

const { getKeywords, appendKeywords, saveArticle, logObservation, getLatestStrategy, getRankedPages } = require('./lib/db-utils');
const { globalRulesPrompt } = require('./lib/global-rules');
const { buildFullPrompt, readRolePrompt } = require('./lib/agents-prompt-builder');
const { loadRestreamAffiliates, validateAffiliateLinks } = require('./lib/affiliates-validator');
const getResponseConfig = require('./lib/getresponse-config');

// All 11 AI agents
const { generateKeywords } = require('./agents/agent-1-keyword-research');
const { generateTopicClusters } = require('./agents/agent-2-topic-strategy');
const { buildOutlines } = require('./agents/agent-3-outline');
const { generateArticle } = require('./agents/agent-4-writer');
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

const runPipeline = async () => {
  const strategy = {
    domain: "yoursite.com",           // ← change to your real domain
    basePath: "",
    affiliate_id: "your_affiliate_id", // optional extra tracking
    dbPath: "./data/articles.json",   // or your DB path
    numKeywords: 50,                  // how many keywords per cycle
    numClusters: 10,                  // how many topic clusters
    agentTimeoutMs: 30000,            // 30s timeout per agent
    getResponse: getResponseConfig    // GetResponse config
  };

  // 1. Agent 1 – Keyword research
  const keywords = await generateKeywords(strategy);
  if (!keywords || keywords.length === 0) {
    logObservation({
      type: "no_keywords",
      agent: "agent-1-keyword-research"
    });
    return;
  }

  // 2. Save initial keywords + log
  await appendKeywords(keywords, strategy);

  // 3. Get latest strategy (from config + DB + global rules)
  const latestStrategy = await getLatestStrategy(strategy);

  // 4. Agent 2 – Topic clusters
  const clusters = await generateTopicClusters(keywords, latestStrategy);
  if (!clusters || clusters.length === 0) {
    logObservation({
      type: "no_clusters",
      agent: "agent-2-topic-strategy"
    });
    return;
  }

  // 5. Agent 3 – Build outlines per cluster
  const outlines = clusters.flatMap(cluster =>
    buildOutlines(cluster, latestStrategy)
  );

  // 6. Agent 4–8 – Generate full articles (chain: 4→5→6→7→8)
  const articles = [];
  for (const outline of outlines) {
    let body = outline.body;

    // 4. Agent 4 – Writer
    body = await generateArticle(body, strategy);

    // 5. Agent 5 – Readability
    body = await makeReadable(body, strategy);

    // 6. Agent 6 – Editor
    body = await editArticle(body, strategy);

    // 7. Agent 7 – Fact check
    body = await factCheckArticle(body, strategy);

    // 8. Agent 8 – Technical SEO
    body = await technicalSeoOptimize(body, strategy);

    // 10. Agent 10 – Policy compliance
    body = await enforcePolicy(body, strategy, globalRulesPrompt);

    // 9. Agent 9 – Log + basic monitoring
    const url = `https://${strategy.domain}/${outline.slug}`;
    const article = {
      url,
      title: outline.title,
      topic: outline.topic,
      primaryKeyword: outline.primaryKeyword,
      body,
      publishedAt: new Date().toISOString()
    };

    articles.push(article);

    // Save to DB
    await saveArticle(article, strategy);

    // Log it
    logObservation({
      page_url: url,
      type: "article_published",
      agent: "orchestrator",
      step: "end_to_end_article"
    });
  }

  // 11. Agent 11 – Social‑video scripts for each article
  const socialVideos = articles.map(article => ({
    ...article,
    videoScript: generateShortVideoScript(article, strategy)
  }));

  socialVideos.forEach(videoItem => {
    logObservation({
      page_url: videoItem.url,
      type: "social_video_script_generated",
      duration_s: videoItem.videoScript.duration_s,
      agent: "agent-11-social-video"
    });
  });

  // 12. Agent 9 – Monitor overall performance
  await monitorPerformance(articles, strategy);
};


// ========
// Run fn
// ========

const run = async () => {
  console.log("🚀 Starting 11‑AI‑team‑brain pipeline...");

  try {
    await runPipeline();
    console.log("✅ Orchestrator completed successfully.");
  } catch (error) {
    console.error("🚨 Orchestrator error:", error);
    logObservation({
      type: "orchestrator_error",
      message: error.message,
      stack: error.stack,
      agent: "orchestrator"
    });
  }
};


// Exports for repair orchestrator and CLI
module.exports = {
  runPipeline,
  run
};


// ========
// Execute if run directly (node orchestrator.js)
// ========

if (require.main === module) {
  run();
}
