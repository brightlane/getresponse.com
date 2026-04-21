// lib/getresponse-config.js
// Central config for GetResponse affiliate links and intent‑based selection

const getResponseLinks = {
  main: "https://try.getresponsetoday.com/hjijpskj458f-p1iq8v",
  northam: "https://try.getresponsetoday.com/bvaetyxexyd4",
  pricing: "https://try.getresponsetoday.com/zder3vacd7wn-xlkg1t",
  promo: "https://try.getresponsetoday.com/g78snrw20x6x-qfgqp"
};

const getResponseConfig = {
  product: "GetResponse",
  anchorText: "GetResponse",

  // Intent → link mapping
  getIntentLink: (intent, strategy = {}) => {
    // For custom domains or overrides
    const baseDomain = strategy.domain || "try.getresponsetoday.com";
    const basePath = strategy.basePath || "";

    const link = getResponseLinks[intent] || getResponseLinks.main;

    // If a custom domain is given, keep same relative path (just swap domain)
    if (strategy.domain && link.includes("try.getresponsetoday.com")) {
      return link.replace("try.getresponsetoday.com", baseDomain);
    }

    return link;
  },

  // Helper: pick the best link for conversion contexts
  getPricingLink: () => getResponseLinks.pricing,
  getPromoLink: () => getResponseLinks.promo,
  getNorthamLink: () => getResponseLinks.northam,
  getMainLink: () => getResponseLinks.main,

  // For reporting: which link type is being used
  getLinkType: (url) => {
    if (url.includes("northam")) return "northam";
    if (url.includes("promo")) return "promo";
    if (url.includes("pricing")) return "pricing";
    if (url.includes("main")) return "main";
    return "main";
  }
};

module.exports = getResponseConfig;
