// agents/agent-15-analytics.js
// Agent‑15 – Analytics & Feedback Loop
// Reads GA‑style / platform data and writes an analytics‑plan.json for Claudio

const fs = require('fs');
const path = require('path');

/**
 * Load GA‑style analytics data (or your own data‑source)
 *
 * @returns {Object} analyticsData
 */
function loadAnalyticsData() {
  // For now, fake GA‑style data; you'll later plug real API or CSV
  return {
    startDate: '2026-04-01',
    endDate: '2026-04-20',
    totalImpressions: 80000,
    totalClicks: 3200,
    ctaClicks: 1200,
    totalConversions: 60,
    ctr: 0.04,
    cvr: 0.01875,
    channels: {
      'Google SEO': {
        impressions: 60000,
        clicks: 2400,
        ctaClicks: 800,
        conversions: 40,
        cost: 500,
        cpa: 12.5,
      },
      'TikTok': {
        impressions: 15000,
        clicks: 600,
        ctaClicks: 300,
        conversions: 15,
        cost: 200,
        cpa: 13.3,
      },
      'Reels': {
        impressions: 3000,
        clicks: 100,
        ctaClicks: 50,
        conversions: 3,
        cost: 50,
        cpa: 16.7,
      },
      'Shorts': {
        impressions: 2000,
        clicks: 100,
        ctaClicks: 50,
        conversions: 2,
        cost: 30,
        cpa: 15.0,
      },
    },
    pages: {
      '/getresponse-email-marketing-guide': {
        url: '/getresponse-email-marketing-guide',
        impressions: 12000,
        clicks: 480,
        ctaClicks: 160,
        conversions: 10,
      },
      '/getresponse-review': {
        url: '/getresponse-review',
        impressions: 8000,
        clicks: 320,
        ctaClicks: 120,
        conversions: 8,
      },
      '/getresponse-pricing': {
        url: '/getresponse-pricing',
        impressions: 15000,
        clicks: 600,
        ctaClicks: 400,
        conversions: 25,
      },
      '/getresponse-alternatives': {
        url: '/getresponse-alternatives',
        impressions: 5000,
        clicks: 200,
        ctaClicks: 60,
        conversions: 5,
      },
      // Any pages you auto‑generate will be added here later
    },
  };
}

/**
 * Analyze data and extract key metrics for Claudio
 *
 * @param {Object} analyticsData – output from loadAnalyticsData
 *
 * @returns {Object} analyticsInsights
 */
function analyzeAnalyticsData(analyticsData) {
  const { totalImpressions, totalConversions, totalClicks, ctaClicks, channels, pages } =
    analyticsData;

  // 1. Overall funnel health
  const cpa = totalImpressions > 0 ? totalClicks / totalImpressions : 0;
  const cvr = ctaClicks > 0 ? totalConversions / ctaClicks : 0;
  const performance = {
    cpa: cpa,
    cvr: cvr,
    // Score: 0–100, 100 = elite, 0 = broken
    healthScore: 60 + (cvr > 0.02 ? 20 : 0) + (cpa < 0.05 ? 20 : 0),
  };

  // 2. Top / worst pages
  const pageList = Object.values(pages);
  const topPages = pageList
    .filter(p => p.conversions > 3)
    .sort((a, b) => b.conversions - a.conversions);
  const worstPages = pageList
    .filter(p => p.impressions > 500 && p.conversions === 0)
    .sort((a, b) => a.impressions - b.impressions);

  // 3. Top / worst channels
  const channelList = Object.values(channels);
  const bestChannel = channelList
    .filter(ch => ch.impressions > 1000)
    .sort((a, b) => a.cpa - b.cpa)[0]?.name;

  // 4. Actionable insights (Claudio‑style)
  const insights = [];

  if (performance.healthScore < 70) {
    insights.push('Overall conversion rate is low; need stronger CTAs and clearer value‑proposition.');
  }

  if (topPages.length > 0) {
    insights.push(
      `✅ Top pages: ${topPages
        .slice(0, 3)
        .map(p => p.url)
        .join(', ')} – double‑down on these with more links and social‑video scripts.`
    );
  }

  if (worstPages.length > 0) {
    insights.push(
      `❌ Worst pages: ${worstPages
        .map(p => p.url)
        .join(', ')} – consider rewriting or merging them.`
    );
  }

  if (bestChannel) {
    insights.push(
      `💡 Best channel: ${bestChannel} – shift more budget here and scale content that feeds it.`
    );
  }

  // 5. Extra flag: social‑video CTR?
  const socialVideoCTR = 0.01; // fake placeholder; you can calc from your data
  if (socialVideoCTR < 0.02) {
    insights.push(
      '📱 Social‑video CTR is low; revise hooks and CTAs in TikTok / Reels / Shorts scripts.'
    );
  }

  return {
    overview: {
      totalImpressions,
      totalClicks,
      ctaClicks,
      totalConversions,
      cpa: cpa.toFixed(4),
      cvr: cvr.toFixed(4),
      healthScore: performance.healthScore,
    },
    bestPages: topPages,
    worstPages,
    bestChannel,
    insights,
  };
}

/**
 * Safe‑write analytics insights to disk (for Claudio to read)
 *
 * @param {Object} insights – output from analyzeAnalyticsData
 */
function safeWriteAnalyticsInsights(insights) {
  const maxRetries = 3;
  const outDir = path.join(__dirname, '..', 'output', 'analytics');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const filepath = path.join(outDir, 'analytics-plan.json');

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      fs.writeFileSync(filepath, JSON.stringify(insights, null, 2), 'utf8');
      console.log(`✅ Agent‑15: wrote analytics plan ${filepath}`);
      return filepath;
    } catch (err) {
      console.error(`❌ Agent‑15: write failed (attempt ${attempt}): ${err.message}`);
      if (attempt === maxRetries) {
        throw err;
      }
      const delay = attempt * 1000;
      require('timers').setTimeout(() => {}, delay).unref();
    }
  }
}

/**
 * Main entry point – run once per batch
 */
function runAnalytics() {
  const analyticsData = loadAnalyticsData();
  const insights = analyzeAnalyticsData(analyticsData);
  safeWriteAnalyticsInsights(insights);
  return insights;
}

module.exports = {
  loadAnalyticsData,
  analyzeAnalyticsData,
  safeWriteAnalyticsInsights,
  runAnalytics,
};
