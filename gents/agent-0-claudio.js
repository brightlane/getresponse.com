// agents/agent-0-claudio.js
// Agent‑0 – Claudio, the Chief Strategist AI
// Reads blueprint.full.yam + Agent‑4 output + Agent‑12 traffic‑plan and issues instructions

const fs = require('fs');
const path = require('path');
const YAML = require('yaml');

/**
 * Load blueprint.full.yam (Claudio's blueprint)
 *
 * @returns {Object} parsed blueprint
 */
function loadBlueprint() {
  const BLUEPRINT_PATH = path.join(__dirname, '..', 'blueprint.full.yam');
  const raw = fs.readFileSync(BLUEPRINT_PATH, 'utf8');
  const blueprint = YAML.parse(raw);
  return blueprint;
}

/**
 * Load all pages (Agent‑4 + Agent‑9 output) from output/html
 *
 * @returns {Array<Object>} list of page metadata
 */
function loadPages() {
  const outDir = path.join(__dirname, '..', 'output', 'html');
  if (!fs.existsSync(outDir)) return [];

  const files = fs.readdirSync(outDir);
  return files
    .filter(f => f.endsWith('.html'))
    .map(filename => {
      const slug = '/' + filename.replace(/_/g, '/').replace('.html', '');
      const fullPath = path.join(outDir, filename);
      return {
        slug,
        filename,
        path: fullPath,
      };
    });
}

/**
 * Load traffic plan (Agent‑12 output)
 *
 * @returns {Object} parsed trafficPlan
 */
function loadTrafficPlan() {
  const planPath = path.join(__dirname, '..', 'output', 'traffic', 'traffic-plan.json');
  if (!fs.existsSync(planPath)) return {};
  const raw = fs.readFileSync(planPath, 'utf8');
  return JSON.parse(raw);
}

/**
 * Load analytics plan (Agent‑15, if you add it later)
 *
 * @returns {Object} analyticsPlan
 */
function loadAnalyticsPlan() {
  const planPath = path.join(__dirname, '..', 'output', 'analytics', 'analytics-plan.json');
  if (!fs.existsSync(planPath)) return {};
  const raw = fs.readFileSync(planPath, 'utf8');
  return JSON.parse(raw);
}

/**
 * Claudio’s main strategy function
 *
 * @param {Object} data - { blueprint, pages, trafficPlan, analyticsPlan }
 * @returns {Object} claudioPlan with instructions for agents 4–13
 */
function generateClaudioStrategy(data) {
  const { blueprint, pages, trafficPlan, analyticsPlan } = data;

  const totalImpressions = trafficPlan?.totalImpressions || 0;
  const totalConversions = analyticsPlan?.overview?.totalConversions || 0;
  const ctaClicks = analyticsPlan?.overview?.ctaClicks || 0;

  const hasLowTraffic = totalImpressions < 10000;
  const hasLowCVR = ctaClicks > 0 ? totalConversions / ctaClicks < 0.02 : true;
  const hasLowCPA = (totalConversions || 0) > 0 ? (1000 / totalConversions) < 5 : false;

  const instructions = [];

  // 1. If traffic is low, push SEO + guides
  if (hasLowTraffic) {
    instructions.push({
      agent: 'agent-4-writer',
      command: 'Generate more SEO‑focused guides and how‑to articles for bottom‑of‑funnel keywords.',
      reason: 'We need more organic traffic from Google.',
    });
  }

  // 2. If CTR is good but CVR low, rewrite CTAs
  if (!hasLowCPA && hasLowCVR) {
    instructions.push({
      agent: 'agent-4-writer',
      command: 'Rewrite landing and decision pages with stronger CTAs and clearer benefit‑driven copy.',
      reason: 'People click but don’t convert; need better value‑proposition.',
    });
  }

  // 3. If TikTok CPA is low, scale it
  const tikTokCPA = trafficPlan?.channels?.TikTok?.cpa || Infinity;
  if (tikTokCPA < 2.0) {
    instructions.push({
      agent: 'agent-12-traffic-strategy',
      command: 'Increase TikTok budget share up to 40–50% and reduce Google SEO share.',
      reason: 'TikTok CPA is low; we can safely scale there.',
    });
  }

  // 4. If Google is working, scale long‑form
  if (trafficPlan?.channelMix?.['Google SEO'] > 0.4 && totalConversions > 50) {
    instructions.push({
      agent: 'agent-4-writer',
      command: 'Create 10–20 more in‑depth guides and case studies for high‑volume, high‑intent keywords.',
      reason: 'Google SEO is converting; we should double‑down.',
    });
  }

  // 5. If social video CTR is low, fix hooks
  const socialVideoCTR = analyticsPlan?.socialVideoCTR || 0.01;
  if (socialVideoCTR < 0.02) {
    instructions.push({
      agent: 'agent-11-social-video',
      command: 'Revise short‑video hooks to be more problem‑driven and add clearer CTAs pointing to the affiliate link.',
      reason: 'Social‑video engagement is low; need better hooks.',
    });
  }

  // 6. If ads underperform, tune variants
  const topAdPerformance = analyticsPlan?.topAdPerformance || 0.01;
  const worstAdPerformance = analyticsPlan?.worstAdPerformance || 0.001;
  if (worstAdPerformance < 0.002) {
    instructions.push({
      agent: 'agent-13-ads',
      command: 'Kill underperforming ad variants and expand best‑performing headlines and CTAs.',
      reason: 'Low‑performing ads are wasting budget.',
    });
  }

  const overallGoal =
    totalConversions > 50
      ? 'Scale budget and expand content; we have a working conversion funnel.'
      : 'Improve CTA strength and page clarity before scaling any channel.';

  return {
    id: 'agent-0-claudio',
    role: 'Chief Strategist AI',
    overallGoal,
    instructions,
    dataSnapshot: {
      pageCount: pages.length,
      trafficPlan,
      analyticsPlan,
      blueprintVersion: blueprint?.version || '1.0',
    },
  };
}

/**
 * Safe‑write Claudio plan to disk
 *
 * @param {Object} claudioPlan
 */
function safeWriteClaudioPlan(claudioPlan) {
  const maxRetries = 3;
  const outDir = path.join(__dirname, '..', 'output', 'claudio');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const filepath = path.join(outDir, 'claudio-plan.json');

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      fs.writeFileSync(filepath, JSON.stringify(claudioPlan, null, 2), 'utf8');
      console.log(`✅ Agent‑0: wrote Claudio plan ${filepath}`);
      return filepath;
    } catch (err) {
      console.error(`❌ Agent‑0: write failed (attempt ${attempt}): ${err.message}`);
      if (attempt === maxRetries) {
        throw err;
      }
      const delay = attempt * 1000;
      setTimeout(() => {}, delay).unref();
    }
  }
}

/**
 * Main entry – Claudio runs after pages, traffic, and analytics exist
 *
 * @returns {Object} claudioPlan
 */
function runClaudio() {
  const blueprint = loadBlueprint();
  const pages = loadPages();
  const trafficPlan = loadTrafficPlan();
  const analyticsPlan = loadAnalyticsPlan();

  const data = { blueprint, pages, trafficPlan, analyticsPlan };
  const claudioPlan = generateClaudioStrategy(data);

  safeWriteClaudioPlan(claudioPlan);

  return claudioPlan;
}

module.exports = {
  loadBlueprint,
  loadPages,
  loadTrafficPlan,
  loadAnalyticsPlan,
  generateClaudioStrategy,
  safeWriteClaudioPlan,
  runClaudio,
};
