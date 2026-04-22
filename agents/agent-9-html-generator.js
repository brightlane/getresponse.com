// agents/agent-9-html-generator.js
// Agent‑9: HTML Generator
// Takes Agent‑4 output and wraps it into a full, clean, deploy‑ready HTML page

const fs = require('fs');
const path = require('path');

/**
 * Generate a full HTML page from Agent‑4 output
 *
 * @param {Object} article
 *   - title: page title
 *   - body: inner HTML (might already contain some HTML)
 *   - primaryKeyword: main keyword
 *   - affiliateUrl: the live GetResponse URL
 *   - internalLinks: array of internal paths
 * @param {Object} strategy – Claudio‑style blueprint
 *
 * @returns {string} full HTML string
 */
function generateHtmlPage(article, strategy) {
  const { title, body, primaryKeyword, affiliateUrl } = article;

  // Sanitize affiliateUrl (Claudio‑style sanity check)
  const isValidAffiliateUrl =
    typeof affiliateUrl === 'string' &&
    (affiliateUrl.includes('getresponsetoday.com') || affiliateUrl.includes('getresponse.com'));

  if (!isValidAffiliateUrl) {
    console.warn('⚠️ Invalid affiliateUrl; using default');
  }

  const affiliateHref = isValidAffiliateUrl ? affiliateUrl : strategy.product.affiliateLinks.main;

  // Optional: get domain from blueprint
  const domain = strategy.domain || 'getresponse.com';

  const html = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!-- Claudio‑style SEO -->
    <title>${title} | ${strategy.domain}</title>
    <meta name="description" content="How to use GetResponse for ${primaryKeyword} and get better results." />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="https://${domain}${article.slug}" />
    <!-- OpenGraph / social -->
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="How to use GetResponse for ${primaryKeyword} and get better results." />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="${strategy.domain}" />
    <!-- Optional: favicon, CSS, etc. -->
    <link rel="icon" href="/favicon.ico" />
    <link rel="stylesheet" href="/styles.css" />
    <!-- GA / tracking (optional) -->
    <script>
      // Claudio: track if you want
      // window.dataLayer = window.dataLayer || [];
      // function gtag(){dataLayer.push(arguments);}
      // gtag('js', new Date());
      // gtag('config', 'UA-XXXXX-X');
    </script>
  </head>
  <body class="claudio-layout">
    <header>
      <nav class="main-nav">
        <a href="https://${domain}/getresponse-email-marketing" class="nav-link">Email Marketing</a>
        <a href="https://${domain}/getresponse-automation" class="nav-link">Automation</a>
        <a href="https://${domain}/getresponse-pricing" class="nav-link">Pricing</a>
        <a href="https://${domain}/getresponse-alternatives" class="nav-link">Alternatives</a>
      </nav>
    </header>

    <main class="main-content">
      <!-- Inject Agent‑4 body directly -->
      ${body}
    </main>

    <!-- Claudio‑style extra CTA after main content -->
    <section class="post-cta">
      <h2>Want to try GetResponse free?</h2>
      <p>Thousands of marketers use GetResponse to grow their audience and sales.</p>
      <p><a href="${affiliateHref}" target="_blank" rel="noopener noreferrer" class="primary-cta cta-affiliate">
        Try GetResponse Free
      </a></p>
    </section>

    <footer class="site-footer">
      <p>
        &copy; ${new Date().getFullYear()} ${strategy.domain}.<br />
        Note: Some links on this page are affiliate links. We earn a small commission if you sign up through them, at no extra cost to you.
      </p>
    </footer>
  </body>
</html>
`.trim();

  return html;
}

/**
 * Safe‑write HTML page to disk with error handling
 *
 * @param {string} html
 * @param {string} slug
 * @param {Object} strategy
 */
function safeWriteHtmlPage(html, slug, strategy) {
  const maxRetries = 3;
  const outDir = path.join(__dirname, '..', 'output', 'html');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const filename = slug.replace(/\//g, '_') + '.html';
  const filepath = path.join(outDir, filename);

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      fs.writeFileSync(filepath, html, 'utf8');
      console.log(`✅ Agent‑9: wrote ${filepath} (attempt ${attempt})`);
      return filepath;
    } catch (err) {
      console.error(`❌ Agent‑9: write failed (attempt ${attempt}): ${err.message}`);
      if (attempt === maxRetries) {
        strategy.claudioPlan?.log?.critical?.(`Agent‑9 failed to write ${filename}; aborting`);
        throw err;
      }
      // exponential backoff
      const delay = attempt * 1000;
      require('timers').setTimeout(() => {}, delay).unref();
    }
  }
}

module.exports = {
  generateHtmlPage,
  safeWriteHtmlPage,
};
