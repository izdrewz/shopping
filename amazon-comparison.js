/* Adds the user's Amazon comparison items into the local shopping tracker once per browser.
   Source: uploaded GPT-readable shopping comparison document. */
(function () {
  const IMPORT_KEY = "shopping-amazon-comparison-v1";
  const TODAY = new Date().toISOString();

  const amazonItems = [
    {
      name: "Canderel Granular Sweetener Refill Drum",
      category: "Food",
      needWant: "Need",
      quantity: "500g x 4 = 2kg",
      manualDays: 7,
      productUrl: "",
      imageUrl: "",
      notes: "Amazon baseline: £55.96 for 2kg. Run-out: about 1 drum every 6–8 days. Cheaper option under this item: Tesco Canderel Granular Sweetener Refill Pack 90g at £2.20 standard or £1.65 Clubcard. To match about 2kg, need 23 packs: approx £50.60 standard or £37.95 Clubcard. Decision: switch if smaller 90g packs are acceptable, especially with Clubcard.",
      prices: [
        price("Amazon", 55.96, null, "500g x 4 = 2kg baseline"),
        price("Tesco", 50.60, 37.95, "23 x 90g packs to match about 2kg; standard £50.60 or Clubcard £37.95", "https://www.tesco.com/groceries/en-GB/products/320684887")
      ]
    },
    {
      name: "100% Natural Erythritol",
      category: "Food",
      needWant: "Need",
      quantity: "3kg x 1 = 3kg",
      manualDays: 28,
      productUrl: "",
      imageUrl: "",
      notes: "Amazon baseline: £17.99 for 3kg. Run-out estimate: about 4 weeks, based on previous plain erythritol orders. Cheaper option under this item: Nuts in Bulk plain erythritol 3kg £14.40, 5kg £22, 10kg £39. Decision: switch if delivery does not wipe out saving; consider 5kg/10kg if storage is fine.",
      prices: [
        price("Amazon", 17.99, null, "3kg baseline"),
        price("Nuts in Bulk", 14.40, null, "Plain erythritol 3kg; also 5kg £22 and 10kg £39", "https://www.nutsinbulk.co.uk/product/erythritol-sweetener")
      ]
    },
    {
      name: "Dulci Light Erythritol Sweetener Gold",
      category: "Food",
      needWant: "Need",
      quantity: "1kg x 2 = 2kg",
      manualDays: 30,
      productUrl: "",
      imageUrl: "",
      notes: "Amazon baseline: £13.98 for 2kg, equal to £6.99/kg. Separate gold/brown-style erythritol type; keep separate from plain erythritol. No cheaper gold/brown-style option found. Similar Groovy Keto erythritol/stevia blend 1kg found at £9.99–£11.99, which is above the Dulci baseline. Decision: keep current Dulci Gold unless a gold/brown sweetener falls below £6.99/kg.",
      prices: [
        price("Amazon", 13.98, null, "2kg baseline; £6.99/kg"),
        price("Groovy Keto", 9.99, null, "Similar erythritol/stevia blend 1kg; not cheaper than Dulci per kg")
      ]
    },
    {
      name: "TruffleGuys Signature Truffle Dust",
      category: "Food",
      needWant: "Want",
      quantity: "45g x 1",
      manualDays: 30,
      productUrl: "",
      imageUrl: "",
      notes: "Amazon baseline: £13.74 for 45g. Cheaper similar option under this item: Sous Chef Marini Tartufi Truffle Seasoning Powder 55g for £5.99 plus delivery from £4.75, about £10.74 if ordered alone. Similar truffle seasoning, not exact same blend. Decision: switch only if a similar truffle seasoning powder is acceptable.",
      prices: [
        price("Amazon", 13.74, null, "45g baseline"),
        price("Sous Chef", 10.74, null, "Marini Tartufi Truffle Seasoning Powder 55g; includes approx delivery if ordered alone", "https://www.souschef.co.uk/products/truffle-powder")
      ]
    },
    {
      name: "Blue Nile Barista Salted Caramel Sugar-Free Syrup",
      category: "Drinks",
      needWant: "Try",
      quantity: "1L x 1",
      manualDays: 30,
      productUrl: "",
      imageUrl: "",
      notes: "Amazon baseline: £9.99 for 1L. Cheaper option under this item: Simply Salted Caramel Sugar Free Syrup 1L is £6.89 from Discount Coffee. Decision: switch to Simply if flavour/ingredients are acceptable.",
      prices: [
        price("Amazon", 9.99, null, "1L baseline"),
        price("Discount Coffee", 6.89, null, "Simply Salted Caramel Sugar Free Syrup 1L", "https://www.discountcoffee.co.uk/products/simply-salted-caramel-sugar-free-flavouring-syrup-1-litre")
      ]
    },
    {
      name: "CeraVe Moisturising Lotion",
      category: "Beauty",
      needWant: "Need",
      quantity: "236ml x 1",
      manualDays: 30,
      productUrl: "",
      imageUrl: "",
      notes: "Amazon baseline: £9.36 for 236ml. Cheaper by buying larger size: Superdrug CeraVe 473ml is £17.49, equal to about £8.75 per 236ml equivalent. Some promotions may improve this further. Decision: buy larger bottle when possible, especially during offers.",
      prices: [
        price("Amazon", 9.36, null, "236ml baseline"),
        price("Superdrug", 17.49, null, "473ml bottle; about £8.75 per 236ml equivalent", "https://www.superdrug.com/skin/body-care/body-lotions/cerave-moisturising-lotion-with-hyaluronic-acid-ceramides-for-normal-to-very-dry-skin-473ml-/p/774877")
      ]
    },
    {
      name: "Hydrocolloid Roll",
      category: "Beauty",
      needWant: "Need",
      quantity: "5cm x 2m x 1",
      manualDays: 30,
      productUrl: "",
      imageUrl: "",
      notes: "Amazon baseline: £8.99 for 5cm x 2m. No cheaper comparable roll found. Fruugo similar 5cm x 2m roll was £9.95 plus £5.99 shipping, which is more expensive. Decision: keep Amazon/current option.",
      prices: [
        price("Amazon", 8.99, null, "5cm x 2m baseline"),
        price("Fruugo", 15.94, null, "Similar roll £9.95 plus £5.99 shipping", "https://www.fruugo.co.uk/hydrocolloid-roll-for-wound-care-hydrocolloid-tape-roll-waterproof-flexible-bandages-with-self-adhesive-cut-to-size-5-cm-x-2-m/p-435715845")
      ]
    },
    {
      name: "Whites Beaconsfield Strawberry Whitening Toothpaste",
      category: "Beauty",
      needWant: "Need",
      quantity: "1 tube x 1",
      manualDays: 60,
      productUrl: "",
      imageUrl: "",
      notes: "Amazon baseline: £8.99 for 1 tube. Toothpaste is assumed to last 2 months. Cheaper similar option under this item: Superdrug Hismile A+ Whitening Toothpaste Strawberry listed at £7.99, with crawled source text also showing a possible member/checkout saving to £4.00. Decision: switch if Hismile strawberry whitening toothpaste is an acceptable substitute.",
      prices: [
        price("Amazon", 8.99, null, "1 tube baseline"),
        price("Superdrug", 7.99, 4.00, "Hismile A+ Whitening Toothpaste Strawberry; possible member/checkout saving seen in crawled result")
      ]
    },
    {
      name: "BLOOMORA Microdart Pimple Patch",
      category: "Beauty",
      needWant: "Need",
      quantity: "24 microdart patches x 1",
      manualDays: 21,
      productUrl: "",
      imageUrl: "",
      notes: "Amazon baseline: £6.99 for 24 true microdart patches. Patch category run-out: about every 2–3 weeks. No cheaper true microdart option found. Superdrug Me+ Microdart patches found at £8 for 6; older crawled discounts were still higher per patch than £6.99 for 24. Decision: keep current Amazon option for true microdarts. Plain hydrocolloid patches are not equivalent unless approved.",
      prices: [
        price("Amazon", 6.99, null, "24 true microdart patches baseline"),
        price("Superdrug", 8.00, null, "Me+ Microdart patches; 6 patches, higher per patch than Amazon")
      ]
    },
    {
      name: "Glengettie Black Tea Bags",
      category: "Drinks",
      needWant: "Need",
      quantity: "80 bags x 2 = 160 bags",
      manualDays: 30,
      productUrl: "",
      imageUrl: "",
      notes: "Amazon baseline: £4.50 for 160 bags. Exact Tesco Glengettie 80 bags was £2.25 but out of stock in the source, matching Amazon price. Cheaper own-brand option under this item: ASDA Everyday 80 Tea Bags comparison showed £1.24 for 80, so 160 would be £2.48 if own-brand black tea is acceptable. Decision: keep Glengettie if exact taste matters; switch to own-brand black tea if lowest price matters.",
      prices: [
        price("Amazon", 4.50, null, "160 bags baseline"),
        price("Tesco", 4.50, null, "Exact Glengettie equivalent: 2 x 80 bags at £2.25 each, source said out of stock"),
        price("ASDA", 2.48, null, "ASDA Everyday 80 Tea Bags at £1.24 each; 2 packs = 160 bags")
      ]
    }
  ];

  function price(shop, priceValue, salePrice, note, url = "") {
    return {
      id: makeId(),
      shop,
      price: priceValue,
      salePrice: salePrice ?? null,
      currency: "£",
      url,
      note,
      checkedAt: TODAY
    };
  }

  function makeId() {
    return (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function normaliseName(value) {
    return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  }

  function mergeItem(template) {
    window.state ||= { items: [] };
    state.items ||= [];
    const existing = state.items.find(item => normaliseName(item.name) === normaliseName(template.name));
    const target = existing || { id: makeId(), createdAt: TODAY, purchases: [] };
    Object.assign(target, {
      name: template.name,
      category: template.category,
      needWant: template.needWant,
      quantity: template.quantity,
      repurchaseType: "manual",
      manualDays: template.manualDays,
      productUrl: target.productUrl || template.productUrl || "",
      imageUrl: target.imageUrl || template.imageUrl || "",
      notes: template.notes,
      updatedAt: TODAY
    });
    const existingPrices = Array.isArray(target.prices) ? target.prices : [];
    const keyed = new Map(existingPrices.map(p => [`${normaliseName(p.shop)}|${p.price}|${p.salePrice ?? ""}`, p]));
    template.prices.forEach(p => {
      const key = `${normaliseName(p.shop)}|${p.price}|${p.salePrice ?? ""}`;
      if (!keyed.has(key)) keyed.set(key, p);
    });
    target.prices = [...keyed.values()];
    if (!existing) state.items.push(target);
  }

  function runImport(force = false) {
    if (!force && localStorage.getItem(IMPORT_KEY)) return false;
    amazonItems.forEach(mergeItem);
    localStorage.setItem(IMPORT_KEY, TODAY);
    if (typeof saveState === "function") saveState();
    if (typeof renderFilters === "function") renderFilters();
    if (typeof render === "function") render();
    return true;
  }

  window.addAmazonComparisonItems = () => runImport(true);

  document.addEventListener("DOMContentLoaded", () => {
    const added = runImport(false);
    const demoButton = document.getElementById("addDemo");
    if (demoButton && !document.getElementById("addAmazonComparison")) {
      const button = document.createElement("button");
      button.id = "addAmazonComparison";
      button.className = "ghost";
      button.type = "button";
      button.textContent = "Load Amazon comparison";
      button.addEventListener("click", () => {
        runImport(true);
        alert("Amazon comparison items have been added/updated.");
      });
      demoButton.insertAdjacentElement("afterend", button);
    }
    if (added) console.info("Amazon comparison items added to shopping tracker.");
  });
})();
