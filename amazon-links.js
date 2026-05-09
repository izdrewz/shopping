/* Adds Amazon UK search links for the comparison items.
   These are search links built from item names, not verified individual ASIN pages. */
(function () {
  const RUN_KEY = "shopping-amazon-search-links-v1";
  const names = [
    "Canderel Granular Sweetener Refill Drum",
    "100% Natural Erythritol",
    "Dulci Light Erythritol Sweetener Gold",
    "TruffleGuys Signature Truffle Dust",
    "Blue Nile Barista Salted Caramel Sugar-Free Syrup",
    "CeraVe Moisturising Lotion",
    "Hydrocolloid Roll",
    "Whites Beaconsfield Strawberry Whitening Toothpaste",
    "BLOOMORA Microdart Pimple Patch",
    "Glengettie Black Tea Bags"
  ];
  const queries = {
    "Canderel Granular Sweetener Refill Drum": "Canderel Granular Sweetener Refill Drum 500g",
    "100% Natural Erythritol": "100% Natural Erythritol 3kg",
    "Dulci Light Erythritol Sweetener Gold": "Dulci Light Erythritol Sweetener Gold 1kg",
    "TruffleGuys Signature Truffle Dust": "TruffleGuys Signature Truffle Dust 45g",
    "Blue Nile Barista Salted Caramel Sugar-Free Syrup": "Blue Nile Barista Salted Caramel Sugar Free Syrup 1L",
    "CeraVe Moisturising Lotion": "CeraVe Moisturising Lotion 236ml",
    "Hydrocolloid Roll": "Hydrocolloid Roll 5cm x 2m",
    "Whites Beaconsfield Strawberry Whitening Toothpaste": "Whites Beaconsfield Strawberry Whitening Toothpaste",
    "BLOOMORA Microdart Pimple Patch": "BLOOMORA Microdart Pimple Patch 24",
    "Glengettie Black Tea Bags": "Glengettie Black Tea Bags 80"
  };

  function normalise(value) {
    return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  }
  function amazonUrl(query) {
    return "https://www.amazon.co.uk/s?k=" + encodeURIComponent(query);
  }
  function applyLinks() {
    if (!window.state || !Array.isArray(state.items)) return false;
    let changed = false;
    names.forEach(name => {
      const item = state.items.find(x => normalise(x.name) === normalise(name));
      if (!item) return;
      const link = amazonUrl(queries[name] || name);
      if (!item.productUrl || item.productUrl.includes("amazon.co.uk/s?k=")) {
        item.productUrl = link;
        changed = true;
      }
      (item.prices || []).forEach(price => {
        if (normalise(price.shop) === "amazon" && !price.url) {
          price.url = link;
          changed = true;
        }
      });
      if (!String(item.notes || "").includes("Amazon link is a search link")) {
        item.notes = String(item.notes || "").trim() + " Amazon link is a search link made from the product name, not a verified ASIN product page.";
        changed = true;
      }
    });
    if (changed) {
      if (typeof saveState === "function") saveState();
      if (typeof renderFilters === "function") renderFilters();
      if (typeof render === "function") render();
      localStorage.setItem(RUN_KEY, new Date().toISOString());
    }
    return changed;
  }

  window.addAmazonSearchLinks = applyLinks;
  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(applyLinks, 100);
    setTimeout(applyLinks, 500);
  });
})();
