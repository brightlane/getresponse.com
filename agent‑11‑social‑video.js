const getResponseConfig = require('../lib/getresponse-config');

// In your script‑gen function
const affiliated_url = getResponseConfig.getIntentLink("promo");

return {
  // ...
  affiliated_url,
  link_type: getResponseConfig.getLinkType(affiliated_url)
};
