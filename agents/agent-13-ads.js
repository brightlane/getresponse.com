// agents/agent-13-ads.js
// Agent‑13 – Ad‑Copy Generator (Google + Meta)
// Uses Agent‑4 pages + affiliate‑links + Agent‑12 traffic‑plan

const fs = require('fs');
const path = require('path');

/**
 * Load ad‑plan from Agent‑12 traffic‑strategy
 *
 * @returns {Object} adPlan
 */
function loadAdPlan() {
  const planPath = path.join(__dirname, '..', 'output', 'traffic', 'traffic-plan.json');
  if (!fs.existsSync(planPath)) return {};
  const raw = fs.readFileSync(planPath, 'utf8');
  return JSON.parse(raw);
}

/**
 * Generate Google Ads variants for a page
 *
 * @param {Object} page – Agent‑4 output (slug, primaryKeyword, affiliateUrl)
 * @param {Object} adPlan – output from Agent‑12
 * @returns {Array<Object>} Google ad variants
 */
function generateGoogleAdsVariants(page, adPlan) {
  const { slug, title, primaryKeyword, affiliateUrl } = page;

  const maxHeadlines = 5;
  const maxDescriptions = 4;

  const headlines = [
    `Try ${title.split(' ')[0] || 'GetResponse'} Free`,
    `${primaryKeyword} Made Easy with GetResponse`,
    `Grow Your Email List with GetResponse`,
    `GetResponse Review 2026 - Try Free`,
    `GetResponse Email Marketing Platform`,
  ].slice(0, maxHeadlines);

  const descriptions = [
    `Get an all‑in‑one email marketing and automation platform. Start free.`,
    `Create funnels, landing pages, and autoresponders without code. Click to try.`,
    `Used by thousands of marketers to grow their audience and sales. Try free.`
  ].map(desc => desc.slice(0, 90));

  // Make sure ads use live affiliateUrl
  const isValidAffiliateUrl =
    typeof affiliateUrl === 'string' &&
    (affiliateUrl.includes('getresponsetoday.com') || affiliateUrl.includes('getresponse.com'));

  const finalAffiliateUrl = isValidAffiliateUrl ? affiliateUrl : 'https://getresponse.com';

  return [
    {
      id: `google-${slug.replace(/\//g, '_')}`,
      platform: 'Google Ads',
      campaign: `Claudio_${primaryKeyword.replace(/\s+/g, '_')}`,
      adGroup: slug,
      status: 'ENABLED',
      url: finalAffiliateUrl,
      finalUrls: [finalAffiliateUrl],
      trackingTemplate: `{lpurl}?utm_source=google&utm_medium=cpc&utm_campaign=Claudio_${primaryKeyword.replace(/\s+/g, '_')}`,
      mobileFinalUrl: finalAffiliateUrl,
      path1: primaryKeyword,
      path2: 'free-trial',
      headlines: headlines,
      descriptions: descriptions,
      responsiveSearchAd: true,
      pinHeadlineSlot1: 1, // 1 = first headline pinned
      pinDescriptionSlot1: 1, // 1 = first description pinned
    }
  ];
}

/**
 * Generate Meta (Facebook / Instagram) ad variants
 *
 * @param {Object} page – Agent‑4 output
 * @param {Object} adPlan – Agent‑12 plan
 * @returns {Array<Object>} Meta ad variants
 */
function generateMetaAdsVariants(page, adPlan) {
  const { slug, title, primaryKeyword, affiliateUrl } = page;

  const primaryTexts = [
    `Stop losing subscribers because your emails go to spam. GetResponse fixes email marketing and automation in minutes.`,
    `Why 90% of email funnels leak money (and how to fix it). GetResponse gives you everything in one place. Click link to try free.`,
    `If you’re not using GetResponse for ${primaryKeyword}, you’re leaving money on the table. See how it works and try free.`
  ];

  const headlines = [
    `Try ${title} for Free`,
    `Grow Your Email List with GetResponse`,
    `Automate Your Funnel with GetResponse`
  ];

  const descriptions = [
    `Get an all‑in‑one email marketing and automation platform. Start your free trial today.`
  ];

  const ctaButtons = [
    'Learn More',
    'Get Offer',
    'Sign Up',
    'Try Free'
  ];

  const isValidAffiliateUrl =
    typeof affiliateUrl === 'string' &&
    (affiliateUrl.includes('getresponsetoday.com') || affiliateUrl.includes('getresponse.com'));

  const finalAffiliateUrl = isValidAffiliateUrl ? affiliateUrl : 'https://getresponse.com';

  return [
    {
      id: `meta-${slug.replace(/\//g, '_')}`,
      platform: 'Meta Ads',
      campaign: `Claudio_${primaryKeyword.replace(/\s+/g, '_')}`,
      adSet: slug,
      status: 'ACTIVE',
      objective: 'CONVERSIONS',
      optimizationGoal: 'CONVERSIONS',
      bidStrategy: 'LOWEST_COST_WITHOUT_CAP',
      budget: 50,
      bid: 1.0,
      adCreative: {
        name: `Claudio_${primaryKeyword}_Ad_1`,
        title: headlines[0],
        body: primaryTexts[0],
        description: descriptions[0],
        cta: ctaButtons[0],
        linkUrl: finalAffiliateUrl,
        imageUrl: `https://example.com/assets/${slug.replace(/\//g, '_')}.png`, // you can later auto‑generate
        videoUrl: `https://example.com/v/${slug.replace(/\//g, '_')}.mp4`,   // or leave blank for image
        messengerUrl: finalAffiliateUrl,
        instagramUrl: finalAffiliateUrl,
      },
      tracking: {
        fbclid: 1,
        fbp: 1,
        fbc: 1,
      }
    }
  ];
}

/**
 * Load all pages (Agent‑4 output) for ad‑generation
 *
 * @returns {Array<Object>}
 */
function loadPages() {
  const outDir = path.join(__dirname, '..', 'output', 'html');
  if (!fs.existsSync(outDir)) return [];

  const files = fs.readdirSync(outDir);
  return files
    .filter(f => f.endsWith('.html'))
    .map(filename => {
      const slug = '/' + filename.replace(/_/g, '/').replace('.html', '');
      const fullpath = path.join(outDir, filename);
      // In production, parse this file for affiliateUrl / metadata
      // Here, keep it minimal:
      return {
        slug,
        title: `GetResponse ${slug.split('/').slice(2).join(' ')}`,
        primaryKeyword: slug.split('/').slice(2).join(' '),
        affiliateUrl: 'https://try.getresponsetoday.com/hjijpskj458f-p1iq8v',
        path: fullpath,
      };
    });
}

/**
 * Safe‑write ads to disk (future: can plug into API instead)
 *
 * @param {Array<Object>} ads – all ad variants
 * @param {Object} adPlan – Agent‑12 plan
 */
function safeWriteAds(ads, adPlan) {
  const maxRetries = 3;
  const outDir = path.join(__dirname, '..', 'output', 'ads');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const filepath = path.join(outDir, 'ads-plan.json');

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      fs.writeFileSync(filepath, JSON.stringify(ads, null, 2), 'utf8');
      console.log(`✅ Agent‑13: wrote ad variants ${filepath}`);
      return filepath;
    } catch (err) {
      console.error(`❌ Agent‑13: write failed (attempt ${attempt}): ${err.message}`);
      if (attempt === maxRetries) {
        throw err;
      }
      const delay = attempt * 1000;
      require('timers').setTimeout(() => {}, delay).unref();
    }
  }
}

/**
 * Main entry point – run after pages and traffic‑plan exist
 */
function runAds() {
  const adPlan = loadAdPlan();
  const pages = loadPages();

  const allAds = [];

  for (const page of pages) {
    const googleAds = generateGoogleAdsVariants(page, adPlan);
    const metaAds = generateMetaAdsVariants(page, adPlan);
    allAds.push(...googleAds, ...metaAds);
  }

  safeWriteAds(allAds, adPlan);

  return allAds;
}

module.exports = {
  loadAdPlan,
  generateGoogleAdsVariants,
  generateMetaAdsVariants,
  loadPages,
  safeWriteAds,
  runAds,
};
