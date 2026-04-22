// agents/agent-0-claudio.js
// Agent‑0 – Claudio, the Chief Strategist AI
// Reads blueprint + Agent‑4 output + Agent‑12 traffic‑plan and tells agents what to do next

const fs = require('fs');
const path = require('path');
const YAML = require('yaml'); // npm install yaml

/**
 * Claudio’s main strategy function
 *
 * @param {Object} data – combined state from blueprint + pages + traffic
 * @returns {Object} claudioPlan with instructions for agents 4–12
 */
function generateClaudioStrategy(data) {
  const { blueprint, pages, trafficPlan } = data;

  const hasLowTraffic = (trafficPlan?.totalImpressions || 0) < 10000;
  const hasLowCVR = (trafficPlan?.totalConversions || 0) / Math.max((trafficPlan?.ctaClicks || 1), 1) < 0.02;
  const hasHighCTR = (trafficPlan?. ctr || 0) > 0.04;

  const instructions = [];

  // If traffic is low, push SEO + guides
  if (hasLowTraffic) {
    instructions.push({
      agent: 'agent-4-writer',
      command: 'Prioritize more SEO guides and how-to articles for bottom-of-funnel keywords.',
      reason: 'We need more organic traffic from Google.',
    });
  }

  // If CTR is good but CVR low, rewrite pages with stronger CTAs
  if (hasHighCTR && hasLowCVR) {
    instructions.push({
      agent: 'agent-4-writer',
      command: 'Rewrite landing pages and decision pages with stronger CTAs and clearer benefit-driven copy.',
      reason: 'People click but don’t convert; need stronger value‑prop.',
    });
  }

  // If TikTok CPA is low, shift budget there
  if (trafficPlan?.channelMix?.TikTok < 0.4 && trafficPlan?.TikTokCPA < 2.0) {
    instructions.push({
      agent: 'agent-12-traffic-strategy',
      command: 'Increase TikTok budget share up to 40–50% and reduce Google SEO share accordingly.',
      reason: 'TikTok CPA is low; we can scale there.',
    });
  }

  // If Google SEO is working, push more long‑form content
  if (trafficPlan?.channelMix?.['Google SEO'] > 0.4 && trafficPlan?.totalConversions > 50) {
    instructions.push({
      agent: 'agent-4-writer',
      command: 'Create 10–20 more in‑depth guides and case studies targeting high‑volume, high‑intent keywords.',
      reason: 'Google SEO is converting; we should double‑down.',
    });
  }

  // If social‑video performance is poor, fix hooks and CTAs
  if (trafficPlan?.socialVideoCTR < 0.02) {
    instructions.push({
      agent: 'agent-11-social-video',
      command: 'Revise short‑video hooks to be more problem‑driven and add stronger CTAs mentioning the affiliate link.',
      reason: 'Social‑video engagement is low; need better hooks.',
    });
  }

  // Overall goal statement
  const overallGoal =
    trafficPlan?.totalConversions > 50
      ? 'Scale budget and expand content; we have a working funnel.'
      : 'Improve conversion rate and CTA strength before scaling any channel.';

  return {
    id: 'agent-0-claudio',
    role: 'Chief Strategist AI',
    overallGoal,
    instructions,
    dataSnapshot: {
      pageCount: pages.length,
      trafficPlan,
      blueprintVersion: blueprint?.version || '1.0',
    },
  };
}

/**
 * Load blueprint.full.yaml (Claudio’s source of truth)
 *
 * @returns {Object} parsed blueprint
 */
function loadBlueprint() {
  const BLUEPRINT_PATH = path.join(__dirname, '..', 'blueprint.full.yaml');
  const raw = fs.readFileSync(BLUEPRINT_PATH, 'utf8');
  const blueprint = YAML.parse(raw);
  return blueprint;
}

/**
 * Load pages (Agent‑4 output) from output directory
 *
 * @returns {Array<Object>} parsed pages
 */
function loadPages() {
  const outDir = path.join(__dirname, '..', 'output', 'html');
  if (!fs.existsSync(outDir)) return [];

  const files = fs.readdirSync(outDir);
  return files
    .filter(f => f.endsWith('.html'))
    .map(filename => ({
      slug: '/' + filename.replace(/_/g, '/').replace('.html', ''),
      filename,
      path: path.join(outDir, filename),
    }));
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
 * Safe‑write Claudio’s plan to disk as JSON
 *
 * @param {Object} claudioPlan – output from generateClaudioStrategy
 */
function safeWriteClaudioPlan(claudioPlan) {
  const maxRetries = 3;
