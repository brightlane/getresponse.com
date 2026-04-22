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
    .sort((a, b) => 
