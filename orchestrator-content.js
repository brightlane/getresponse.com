// orchestrator-content.js – orchestrator for your 5‑agent + blueprint stack

const fs = require('fs');
const path = require('path');
const YAML = require('yaml');

/**
 * 1. Load blueprint.full.yam (Claudio blueprint)
 */
function loadBlueprint() {
  const BLUEPRINT_PATH = path.join(__dirname, 'blueprint.full.yam');
  const raw = fs.readFileSync(BLUEPRINT_PATH, 'utf8');
  const blueprint = YAML.parse(raw);

  // Fake claudioPlan for now (you can later plug analytics / agent‑0)
  blueprint.claudioPlan = {
    id: 'agent-0-claudio',
    funnel: blueprint.funnel,
    taxonomy: blueprint.taxonomy,
    contentRules: blueprint.contentRules,
    agents: blueprint.agents,
  };

  return blueprint;
}

/**
 * 2. Agent‑4 – SEO article writer
 */
const { generateArticle } = require('./agents/agent-4-writer');

/**
 * 3. Agent‑9 – HTML generator for Agent‑4 output
 */
const { generateHtmlPage, safeWriteHtmlPage } = require('./agents/agent-9-html-generator');

/**
 * 4. Agent‑11 – Social video script generator
 */
const { generateShortVideoScript, safeWriteScript } = require('./agents/agent-11-social-video');

/**
 * 5. Agent‑12 – Traffic strategy
 */
const { decideTrafficStrategy, safeWriteTrafficPlan, loadTrafficData } = require('./agents/agent-12-traffic-strategy');

/**
 * 6. Agent‑13 – Ad‑copy generator (Google + Meta)
 */
const { runAds, safeWriteAds, loadAdPlan } = require('./agents/agent-13-ads');

/**
 * Run one page through the pipeline: 4 → 9 → 11 → others
 */
async function runOnePage(strategy, outline) {
  console.log(`🚀 Generating page for: ${outline.slug}`);

  // 1. Decide which affiliate URL to use
  let affiliateUrl;
  if (outline.pageType === 'decision' || outline.pageType === 'bonus-promo') {
    affiliateUrl = strategy.product.affiliateLinks.pricing || strategy.product.affiliateLinks.main;
  } else {
    affiliateSubscribeUrl = strategy.product.affiliateLinks.main;
  }

  // 2. Agent‑4 – writes the page
  const article = await generateArticle(
    {
      ...outline,
      affiliateUrl,
    },
    strategy
  );

  if (!article.affiliateUrl) {
    throw new Error(`❌ No affiliateUrl in output for ${outline.slug}`);
  }

  // 3. Agent‑9 – generate full HTML page
  const fullHtml = generateHtmlPage(article, strategy);
  safeWriteHtmlPage(fullHtml, outline.slug, strategy);

  // 4. Agent‑11 – short‑video script
  const script = generateShortVideoScript(article, strategy);
  safeWriteScript(script, outline.slug, strategy);

  console.log(`✅ Page + social script ready for ${outline.slug}`);
}

/**
 * Main entry
 */
async function main() {
  const strategy = loadBlueprint();

  const testPages = [
    {
      slug: '/getresponse-email-marketing-guide',
      title: 'GetResponse Email Marketing Guide',
      primaryKeyword: 'getresponse email marketing',
      pageType: 'guide',
    },
    {
      slug: '/getresponse-automation',
      title: 'GetResponse Automation & Funnels',
      primaryKeyword: 'getresponse automation',
      pageType: 'automation',
    },
    {
      slug: '/getresponse-pricing',
      title: 'GetResponse Pricing 2026',
      primaryKeyword: 'getresponse pricing',
      pageType: 'pricing',
    },
  ];

  for (const outline of testPages) {
    await runOnePage(strategy, outline);
  }

  // 5. Agent‑12 – traffic strategy
  const trafficData = loadTrafficData();
  const trafficPlan = decideTrafficStrategy(trafficData, strategy);
  safeWriteTrafficPlan(trafficPlan, strategy);

  // 6. Agent‑13 – ads
  const ads = runAds(loadAdPlan()); // agent‑13 reads from agent‑12’s output
  safeWriteAds(ads, {});

  console.log('✅ All pages, scripts, ads, and traffic plan generated.');
}

main().catch(console.error);
