// agents/agent-4-writer.js
// Agent‑4 – Article Writer
// Writes SEO‑friendly, affiliate‑link‑aware pages for GetResponse

const fs = require('fs');
const path = require('path');

/**
 * Write a single page based on an outline
 *
 * @param {Object} outline
 *   - slug: URL path
 *   - title: page title
 *   - primaryKeyword: main keyword
 *   - pageType: guide, review, landing, etc.
 *   - affiliateUrl: the live GetResponse URL
 * @param {Object} strategy – Claudio‑style blueprint
 *
 * @returns {Object} article with title, body, primaryKeyword, affiliateUrl, internalLinks
 */
async function generateArticle(outline, strategy) {
  const { title, primaryKeyword, pageType, affiliateUrl, slug } = outline;

  // 1. Decide which affiliate URL to use (if not already set)
  let finalAffiliateUrl = affiliateUrl;

  if (!finalAffiliateUrl) {
    if (pageType === 'decision' || pageType === 'bonus-promo') {
      finalAffiliateUrl = strategy.product.affiliateLinks.pricing; // or promo
    } else {
      finalAffiliateUrl = strategy.product.affiliateLinks.main;
    }
  }

  // 2. Build the body (Claudio‑style problem‑solution‑benefit)
  let body = `
    <h1>${title}</h1>
    <p>Many marketers struggle with <strong>${primaryKeyword}</strong> and never get the results they want.</p>
    <p>GetResponse solves this with an all‑in‑one email marketing and automation platform that lets you build funnels, landing pages, and autoresponders in minutes.</p>
  `;

  // 3. Above‑fold CTA (always uses affiliateUrl)
  body += `
    <div class="above-fold-cta">
      <h2>Want to try GetResponse free?</h2>
      <p>Click the button below to start your free trial:</p>
      <a href="${finalAffiliateUrl}" target="_blank" rel="noopener noreferrer" class="primary-cta">
        Try GetResponse Free
      </a>
    </div>
  `;

  // 4. Mid‑content text‑link CTA
  body += `
    <p>If you're serious about ${primaryKeyword}, you should test GetResponse yourself.
    <a href="${finalAffiliateUrl}" target="_blank" rel="noopener noreferrer">Click here</a> to start your free trial.</p>
  `;

  // 5. Sectioned content (short for now, you can extend later)
  body += `
    <h2>Why Email Marketing Matters</h2>
    <p>Email marketing is still one of the highest‑ROI channels online. GetResponse makes it easy to send targeted emails, segment your audience, and automation flows.</p>

    <h2>How to Set Up Your First Funnel</h2>
    <p>If you’re new to GetResponse, start by creating a simple webinar or lead‑magnet funnel. Use the landing page builder and autoresponder tools to nurture leads automatically.</p>
  `;

  // 6. Extra CTA on decision / promo pages
  if (pageType === 'decision' || pageType === 'bonus-promo') {
    body += `
      <div class="end-cta">
        <h2>Ready to grow your list?</h2>
        <p>GetResponse makes it easy to build and monetize your audience.</p>
        <a href="${finalAffiliateUrl}" target="_blank" rel="noopener noreferrer" class="strong-cta">
          Start Growing Now
        </a>
      </div>
    `;
  }

  // 7. Internal links (Claudio‑style cross‑link strategy)
  const internalLinks = [
    {
      text: 'GetResponse Email Marketing',
      url: '/getresponse-email-marketing',
    },
    {
      text: 'GetResponse Automation Guide',
      url: '/getresponse-automation',
    },
    {
      text: 'GetResponse Pricing 2026',
      url: '/getresponse-pricing',
    },
    {
      text: 'GetResponse Alternatives',
      url: '/getresponse-alternatives',
    },
  ];

  body += `
    <h2>More GetResponse Resources</h2>
    <ul>
      ${internalLinks
        .map(
          (link) =>
            `<li><a href="${link.url}">${link.text}</a></li>`
        )
        .join('')}
    </ul>
  `;

  // 8. Footer + affiliate‑disclaimer
  body += `
    <footer class="page-footer">
      <p>Disclosure: Some links on this page are affiliate links. We earn a small commission if you sign up through them, at no extra cost to you.</p>
    </footer>
  `;

  return {
    slug,
    title,
    body,
    primaryKeyword,
    affiliateUrl: finalAffiliateUrl,
    pageType,
    internalLinks: internalLinks.map(link => link.url),
  };
}

module.exports = { generateArticle };
