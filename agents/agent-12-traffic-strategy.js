// agents/agent-12-traffic-strategy.js
// Agent‑12 – Traffic Strategy
// Claudio‑style agent that decides: SEO vs TikTok vs Reels vs Shorts budget

/**
 * Decide traffic strategy based on current data
 *
 * @param {Object} trafficData
 *   - impressions: total impressions
 *   - clicks: total clicks
 *   - ctaClicks: clicks on affiliate CTAs
 *   - conversions: successful signups / sales
 *   - channels: { 'Google SEO': {}, 'TikTok': {}, 'Reels': {}, 'Shorts': {} }
 * @param {Object} strategy – Claudio‑style blueprint
 *
 * @returns {Object} trafficStrategy with channel mix + budget
 */
function decideTrafficStrategy(trafficData, strategy) {
  const defaultBudget = 1000; // overall budget in $
  const minBudgetPerChannel = 50;

  // If no data, default to exploratory mix
  if (!trafficData) {
    return {
      budget: defaultBudget,
      channelMix: {
        'Google SEO': 0.5,
        'TikTok': 0.2,
        'Reels': 0.15,
        'Shorts': 0.15,
      },
      explanation: 'No data yet; split budget for testing.',
    };
  }

  const totalImpressions = trafficData.impressions || 0;
  const totalConversions = trafficData.conversions || 0;
  const cpa = totalImpressions > 0 ? (defaultBudget / (totalImpressions / 1000)) : Infinity;

  // Simple rule: if conversions are low but CTR OK, shift to social
  const hasLowCVR = (totalConversions / (trafficData.ctaClicks || 1)) < 0.02;
  const hasHighCTR = (trafficData.ctr || 0) > 0.03;

  // Also read channel‑level data
  const chan = trafficData.channels || {};
  const channelCPA = {};

  Object.keys(chan).forEach(id => {
    const ch = chan[id];
    if (ch.impressions > 0) {
      channelCPA[id] = ch.cost / Math.max(ch.conversions, 1);
    } else {
      channelCPA[id] = Infinity;
    }
  });

  // Find lowest‑cost channel
  const bestChannel = Object.entries(channelCPA)
    .filter(([_, cpaVal]) => cpaVal < Infinity)
    .sort((a, b) => a[1] - b[1])[0]?.[0];

  // Claudio‑style decision table
  let mix = {};

  if (totalConversions >= 50) {
    // We have working conversions → scale best channel
    mix[bestChannel || 'Google SEO'] = 0.6;
    mix['TikTok'] = 0.2;
    mix['Reels'] = 0.1;
    mix['Shorts'] = 0.1;
  } else if (hasLowCVR && hasHighCTR) {
    // People click but don’t convert → push social traffic
    mix['Google SEO'] = 0.3;
    mix['TikTok'] = 0.4;
    mix['Reels'] = 0.2;
    mix['Shorts'] = 0.1;
  } else {
    // Default exploratory mix
    mix['Google SEO'] = 0.5;
    mix['TikTok'] = 0.2;
    mix['Reels'] = 0.15;
    mix['Shorts'] = 0.15;
  }

  // Normalize so sum === 1.0
  const total = Object.values(mix).reduce((a, b) => a + b, 0);
  Object.keys(mix).forEach(k => {
    mix[k] = Math.max(mix[k] / total, minBudgetPerChannel / defaultBudget);
  });

  return {
    budget: defaultBudget,
    channelMix: mix,
    explanation: `Claudio sees: ${totalConversions} conversions, CPA ≈ $${cpa.toFixed(2)}. 
                  Best channel: ${bestChannel || 'unknown'}; shifting budget accordingly.`,
    notes: [
      'If Google SEO CPA is high, shift to TikTok / Reels.',
      'If TikTok CPA is low, double‑down.',
    ],
  };
}

/**
 * Safe‑write traffic strategy to disk
 *
 * @param {Object} plan – output from decideTrafficStrategy
 * @param {Object} strategy – Claudio blueprint
 */
function safeWriteTrafficPlan(plan, strategy) {
  const maxRetries = 3;
  const outDir = path.join(__dirname, '..', 'output', 'traffic');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const filename = 'traffic-plan.json';
  const filepath = path.join(outDir, filename);

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      fs.writeFileSync(filepath, JSON.stringify(plan, null, 2), 'utf8');
      console.log(`✅ Agent‑12: wrote traffic strategy ${filepath}`);
      return filepath;
    } catch (err) {
      console.error(`❌ Agent‑12: write failed (attempt ${attempt}): ${err.message}`);
      if (attempt === maxRetries) {
        strategy.claudioPlan?.log?.critical?.(`Agent‑12 failed to write traffic-plan; aborting`);
        throw err;
      }
      const delay = attempt * 1000;
      require('timers').setTimeout(() => {}, delay).unref();
    }
  }
}

// Mock loadTrafficData – later you plug real GA / platform data here
function loadTrafficData() {
  // For now, fake a small experiment set
  return {
    impressions: 50000,
    clicks: 2000,
    ctaClicks: 800,
    conversions: 40,
    ctr: 0.04,
    channels: {
      'Google SEO': {
        impressions: 40000,
        clicks: 1600,
        ctaClicks: 600,
        conversions: 30,
        cost: 500,
      },
      'TikTok': {
        impressions: 10000,
        clicks: 400,
        ctaClicks: 200,
        conversions: 10,
        cost: 200,
      },
      'Reels': {
        impressions: 0,
        clicks: 0,
        ctaClicks: 0,
        conversions: 0,
        cost: 0,
      },
      'Shorts': {
        impressions: 0,
        clicks: 0,
        ctaClicks: 0,
        conversions: 0,
        cost: 0,
      },
    },
  };
}

const fs = require('fs');
const path = require('path');

module.exports = {
  decideTrafficStrategy,
  safeWriteTrafficPlan,
  loadTrafficData, // you can later replace with real data‑fetch
};
