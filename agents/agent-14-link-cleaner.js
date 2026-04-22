// agents/agent-14-link-cleaner.js
// Agent‑14 – Link Cleaner & SEO Sanity Checker
// Scans output/html/ for broken links, wrong affiliate domains, and invalid HTML

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom'); // npm install jsdom
const fetch = require('node-fetch'); // npm install node-fetch

const ALLOWED_AFFILIATE_DOMAINS = [
  'getresponsetoday.com',
  'getresponse.com'
];

// Optional: use a real crawler like linkinator instead of fetch for many links
// But for now, keep it simple.

/**
 * Load all HTML files from output/html
 *
 * @returns {Array<Object>} { slug, path, html }
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
      const html = fs.readFileSync(fullPath, 'utf8');
      return {
        slug,
        path: fullPath,
        html,
        filename,
      };
    });
}

/**
 * Extract all <a> tags and their hrefs from HTML
 *
 * @param {string} html
 * @returns {Array<{href, text}>}
 */
function extractLinksFromHtml(html) {
  const links = [];

  const dom = new JSDOM(html);
  const document = dom.window.document;
  const anchors = document.querySelectorAll('a');

  for (const a of anchors) {
    const href = a.getAttribute('href') || '';
    const text = a.textContent.trim();
    links.push({ href, text });
  }

  return links;
}

/**
 * Validate an affiliate URL
 *
 * @param {string} url
 * @returns {boolean}
 */
function isValidAffiliateUrl(url) {
  if (!url || typeof url !== 'string') return false;

  const parsed = new URL(url, 'https://getresponse.com');
  const hostname = parsed.hostname;

  return ALLOWED_AFFILIATE_DOMAINS.some(domain => hostname.includes(domain));
}

/**
 * Extract affiliate‑link info from page (slightly simplified)
 *
 * @param {string} html
 * @returns {{affiliateUrls: Array<string>}}
 */
function extractAffiliateInfo(html) {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const anchors = document.querySelectorAll('a[href]');

  const affiliateUrls = new Set();

  for (const a of anchors) {
    const href = a.getAttribute('href');
    if (href && href.includes('getresponsetoday.com') || href.includes('getresponse.com')) {
      affiliateUrls.add(href);
    }
  }

  return {
    affiliateUrls: Array.from(affiliateUrls),
  };
}

/**
 * Check if page has at least one strong CTA
 *
 * @param {string} html
 * @returns {boolean}
 */
function hasStrongCta(html) {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // Check if any <a> or <button> with CTA text exists
  const ctas = document.querySelectorAll(
    'a[href*="try"], a[href*="free"], a[href*="start"], a[href*="sign"], a[href*="demo"], .cta, .primary-cta'
  );

  return ctas.length > 0;
}

/**
 * Quick HTML / meta sanity check (no full‑crawler here)
 *
 * @param {string} html
 * @returns {Object} issues
 */
function checkHtmlSanity(html) {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const issues = [];

  // 1. Missing title
  const title = document.querySelector('title');
  if (!title || !title.textContent.trim()) {
    issues.push('Missing or empty title tag');
  }

  // 2. Missing meta description
  const metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc || !metaDesc.getAttribute('content')) {
    issues.push('Missing or empty meta description');
  }

  // 3. Broken or self‑closing-tag‑style issues? (basic check)
  // In real production, use proper linter; here, just a quick one.
  if (!html.includes('</head>') || !html.includes('</body>')) {
    issues.push('Suspected broken HTML structure (no </head> or </body>)');
  }

  return issues;
}

/**
 * Single-link liveness check (for small sets)
 *
 * @param {string} url
 * @returns {Promise<Object>} { url, status, ok }
 */
async function checkLinkLive(url) {
  try {
    const response = await fetch(url, { method: 'HEAD', timeout: 10000 });
    return {
      url,
      status: response.status,
      ok: response.status >= 200 && response.status < 400,
    };
  } catch (err) {
    return {
      url,
      status: 0,
      ok: false,
      error: err.message,
    };
  }
}

/**
 * Main entry – run over all pages
 *
 * @returns {Object} report
 */
async function runLinkCleaner() {
  const pages = loadPages();
  const report = {
    pages: [],
    summary: {
      totalPages: pages.length,
      pagesWithIssues: 0,
      brokenLinks: 0,
      badAffiliateLinks: 0,
      missingCtas: 0,
    },
  };

  for (const page of pages) {
    const {
      slug,
      path: filePath,
      html,
      filename,
    } = page;

    const {
      affiliateUrls,
    } = extractAffiliateInfo(html);

    const allLinks = extractLinksFromHtml(html);

    const brokenLinks = [];
    const liveLinkPromises = [];

    // 1. Check each link for liveness (optional; can be slow, disable for dev)
    // for (const lnk of allLinks.filter(l => l.href && !l.href.startsWith('#'))) {
    //   liveLinkPromises.push(
    //     checkLinkLive(lnk.href)
    //       .then(result => {
    //         if (!result.ok) {
    //           brokenLinks.push(result);
    //         }
    //       })
    //   );
    // }
    // await Promise.all(liveLinkPromises);

    // 2. Check affiliate links
    const badAffiliateLinks = affiliateUrls
      .filter(url => !isValidAffiliateUrl(url));

    // 3. Check CTA
    const missingCta = !hasStrongCta(html);

    // 4. HTML / meta sanity
    const sanityIssues = checkHtmlSanity(html);

    const issues = [];

    if (brokenLinks.length > 0) {
      issues.push(`Found ${brokenLinks.length} broken links`);
    }

    if (badAffiliateLinks.length > 0) {
      issues.push(`Found ${badAffiliateLinks.length} affiliate links on wrong domains`);
    }

    if (missingCta) {
      issues.push(`No clear CTA button / text link found`);
    }

    if (sanityIssues.length > 0) {
      issues.push(...sanityIssues);
    }

    report.pages.push({
      slug,
      filename,
      path: filePath,
      issues,
      brokenLinks,
      badAffiliateLinks,
      missingCta,
      sanityIssues,
    });

    if (issues.length > 0) {
      report.summary.pagesWithIssues += 1;
    }

    report.summary.brokenLinks += brokenLinks.length;
    report.summary.badAffiliateLinks += badAffiliateLinks.length;
    if (missingCta) {
      report.summary.missingCtas += 1;
    }
  }

  return report;
}

/**
 * Safe‑write report to disk (for Claudio to read)
 *
 * @param {Object} report
 */
function safeWriteLinkCleanerReport(report) {
  const maxRetries = 3;
  const outDir = path.join(__dirname, '..', 'output', 'link-checker');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const filepath = path.join(outDir, 'link-checker-report.json');

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      fs.writeFileSync(filepath, JSON.stringify(report, null, 2), 'utf8');
      console.log(`✅ Agent‑14: wrote link checker report ${filepath}`);
      return filepath;
    } catch (err) {
      console.error(`❌ Agent‑14: write failed (attempt ${attempt}): ${err.message}`);
      if (attempt === maxRetries) {
        throw err;
      }
      const delay = attempt * 1000;
      setTimeout(() => {}, delay).unref();
    }
  }
}

/**
 * Main entry – run once per batch
 */
async function main() {
  const report = await runLinkCleaner();
  safeWriteLinkCleanerReport(report);
  return report;
}

module.exports = {
  loadPages,
  extractLinksFromHtml,
  isValidAffiliateUrl,
  extractAffiliateInfo,
  hasStrongCta,
  checkHtmlSanity,
  runLinkCleaner,
  safeWriteLinkCleanerReport,
  main,
};
