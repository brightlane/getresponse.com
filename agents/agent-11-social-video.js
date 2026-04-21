// agents/agent-11-social-video.js
// Conversion‑focused short‑video script for TikTok / Reels / YouTube Shorts

const selectRandomLine = (lines) => {
  return lines[Math.floor(Math.random() * lines.length)];
};

const generateShortVideoScript = (article, strategy) => {
  const primaryKeyword = article.primaryKeyword || "more traffic";
  const topic = article.topic || "online business";
  const title = article.title || "How to get more traffic that converts in 2026";

  // --- 1. Hook (0–3 seconds) — Problem + pain ---
  const hookOptions = [
    `Have you ever tried to drive traffic and failed?`,
    `You’re tired of traffic that doesn’t convert, right?`,
    `Most people waste time on traffic that never turns into sales.`,
    `If you’re serious about growing online, this is for you.`,
    `Stop guessing at what works and start seeing real results.`
  ];

  // --- 2. Value beat (3–20 seconds) — Proof + solution ---
  const valueOptions = [
    `One simple change doubled our traffic AND conversions in under a month.`,
    `We stopped wasting time on traffic that doesn’t convert and focused on what actually sells.`,
    `The right system works whether you’re a beginner or advanced.`,
    `This works for any niche, any brand, any product. The principle is the same.`,
    `You’ll get more leads, more sales, and more revenue in 30 days.`
  ];

  // --- 3. CTA (last 5–10 seconds) — Clear, trackable action ---
  const ctaOptions = [
    `Click the link in the description to see how it works.`,
    `Start free and test it risk‑free today.`,
    `Try it now and see real results in less than a week.`,
    `Follow along and you’ll see your traffic and sales start to grow.`,
    `Go to the link and start building your system now.`
  ];

  const hook = selectRandomLine(hookOptions);
  const value = selectRandomLine(valueOptions);
  const cta = selectRandomLine(ctaOptions);

  // --- 4. Caption + hashtags (CTA‑focused) ---
  const caption = `Drive more traffic that converts online with one simple system. Watch this video and click the link in the description to learn more.`;

  const hashtags = [
    '#trafficgrowth',
    '#digitalmarketing',
    '#onlinemarketing',
    '#seo',
    '#affiliatemarketing',
    '#onlinesales',
    '#growthhacking',
    '#marketingtips',
    '#onlinebusiness',
    '#passiveincome'
  ];

  // --- 5. Trackable URL (you plug in your own base URL + affiliate param) ---
  const baseDomain = strategy.domain || "yoursite.com";
  const urlAppend = strategy.affiliate_id
    ? `?a=${strategy.affiliate_id}&source=social-short`
    : `?source=social-short`;

  const affiliated_url = `${baseDomain}${urlAppend}`;

  return {
    primaryKeyword,
    topic,
    title,

    // Video script (conversion‑focused)
    hook,
    value,
    cta,

    duration_s: 25, // 25 seconds (ideal for Shorts/Reels/TikTok)
    platform: "tiktok_reels_shorts",

    // Caption & hashtags
    caption,
    hashtags,

    // Tracking URL (for conversions)
    affiliated_url,

    // Human‑readable script
    script: `${hook}\n\n${value}\n\n${cta}`
  };
};

module.exports = { generateShortVideoScript };
