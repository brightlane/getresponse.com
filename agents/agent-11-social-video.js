// agents/agent-11-social-video.js
// Agent‑11 – Social Video Script Generator (TikTok / Reels / Shorts)

/**
 * Generates a short‑video script for a page
 *
 * @param {Object} article
 *   - slug
 *   - title
 *   - primaryKeyword
 *   - affiliateUrl
 * @param {Object} strategy – Claudio‑style blueprint
 *
 * @returns {Object} script with hook, solution, CTA, and affiliate link
 */
function generateShortVideoScript(article, strategy) {
  const { title, primaryKeyword, affiliateUrl, slug } = article;

  // Claudio‑style sanity‑check on affiliateUrl
  const isValidAffiliateUrl =
    typeof affiliateUrl === 'string' &&
    (affiliateUrl.includes('getresponsetoday.com') || affiliateUrl.includes('getresponse.com'));

  const affiliateHref = isValidAffiliateUrl ? affiliateUrl : strategy.product.affiliateLinks.main;

  // 1. Hook – first 1–2 seconds (stop the scroll)
  const hooks = [
    `Stop losing subscribers because your emails go to spam.`,
    `You’re making this one email marketing mistake and losing sales.`,
    `Why 90% of email funnels leak money (and how to fix it).`,
    `If you’re not using GetResponse for ${primaryKeyword}, you’re leaving money on the table.`,
  ];

  const hook = hooks[Math.floor(Math.random() * hooks.length)];

  // 2. Solution – quick fix / what GetResponse does
  const solution = `
    GetResponse fixes this with an all‑in‑one email marketing and automation platform.
    You can set up landing pages, funnels, and autoresponders in minutes.
  `.trim();

  // 3. CTA – direct people to click the link
  const cta = `
    Click the link below to try GetResponse free and fix your ${primaryKeyword} funnel.
  `.trim();

  // 4. Hashtags (optional, platform‑specific)
  const hashtags = [
    '#emailmarketing',
    '#getresponse',
    '#makemoneyonline',
    '#onlinebusiness',
  ];

  return {
    id: `script-${slug.replace(/\//g, '_')}`,
    platform: ['TikTok', 'Reels', 'Shorts'],
    wordCountEstimate: 40, // keep under 60 words for 15–30s video
    hook,
    solution,
    cta,
    affiliateLink: affiliateHref,
    hashtags,
    // Optional: for tools that auto‑generate video (e.g., CapCut, VEED, etc.)
    voiceover: `${hook} ${solution} ${cta} Link in description.`,
    // Optional: on‑screen text prompts
    onScreenText: [
      hook,
      `GetResponse fixes ${primaryKeyword}`,
      `Click link to try free`,
    ],
  };
}

/**
 * Safe‑write script to disk as JSON
 *
 * @param {Object} script – output from generateShortVideoScript
 * @param {string} slug – page slug
 * @param {Object} strategy
 */
function safeWriteScript(script, slug, strategy) {
  const maxRetries = 3;
  const outDir = path.join(__dirname, '..', 'output', 'scripts');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const filename = slug.replace(/\//g, '_') + '.script.json';
  const filepath = path.join(outDir, filename);

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      fs.writeFileSync(filepath, JSON.stringify(script, null, 2), 'utf8');
      console.log(`✅ Agent‑11: wrote short‑video script ${filepath}`);
      return filepath;
    } catch (err) {
      console.error(`❌ Agent‑11: write failed (attempt ${attempt}): ${err.message}`);
      if (attempt === maxRetries) {
        strategy.claudioPlan?.log?.critical?.(`Agent‑11 failed to write ${filename}; aborting`);
        throw err;
      }
      const delay = attempt * 1000;
      require('timers').setTimeout(() => {}, delay).unref();
    }
  }
}

const fs = require('fs');
const path = require('path');

module.exports = {
  generateShortVideoScript,
  safeWriteScript,
};
