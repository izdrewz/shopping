(() => {
  const STORE_KEY = "shopping-tracker-v1";
  const $ = id => document.getElementById(id);

  function readState() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || { items: [] }; }
    catch { return { items: [] }; }
  }

  function writeState(state) {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  }

  function id() {
    return crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function productPayload() {
    const state = readState();
    return (state.items || []).map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      needWant: item.needWant,
      quantity: item.quantity || "",
      productUrl: item.productUrl || "",
      imageUrl: item.imageUrl || "",
      existingPrices: (item.prices || []).map(price => ({
        shop: price.shop || "",
        price: price.price ?? null,
        salePrice: price.salePrice ?? null,
        currency: price.currency || "£",
        url: price.url || "",
        note: price.note || ""
      }))
    })).filter(item => item.productUrl || item.name);
  }

  function buildPrompt() {
    const products = productPayload();
    return `Please check the current product pages / shop information for the products below and return ONLY valid JSON, no markdown and no explanation.

Goal:
- Update current price, sale price if available, shop name, product URL, image URL if findable, and any useful price note.
- Compare across shops only when you can confidently identify the same or very similar product.
- Do not invent prices. If unsure, use null and explain briefly in note.
- Use GBP (£) unless the shop clearly uses another currency.
- Prefer official shop/product pages over random mirrors.
- Preserve each product id exactly.

Return this exact structure:
{
  "checkedAt": "YYYY-MM-DD",
  "updates": [
    {
      "id": "existing item id",
      "imageUrl": "direct image URL if found, otherwise empty string",
      "prices": [
        {
          "shop": "shop name",
          "price": 0.00,
          "salePrice": null,
          "currency": "£",
          "url": "product page URL",
          "note": "size, offer type, loyalty price, sale end date, or uncertainty"
        }
      ]
    }
  ]
}

Products to check:
${JSON.stringify(products, null, 2)}`;
  }

  async function copyPrompt() {
    const prompt = buildPrompt();
    try {
      await navigator.clipboard.writeText(prompt);
      alert("ChatGPT prompt copied. Open ChatGPT, paste it, then paste the JSON response back here.");
    } catch {
      downloadText("shopping-chatgpt-price-check-prompt.txt", prompt, "text/plain");
      alert("Clipboard failed, so the prompt was downloaded instead.");
    }
  }

  function downloadPrompt() {
    downloadText("shopping-chatgpt-price-check-prompt.txt", buildPrompt(), "text/plain");
  }

  function downloadText(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function parseJsonLoose(text) {
    const trimmed = String(text || "").trim();
    if (!trimmed) throw new Error("Paste JSON first.");
    try { return JSON.parse(trimmed); } catch {}
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON object found.");
    return JSON.parse(match[0]);
  }

  function applyUpdates() {
    let payload;
    try {
      payload = parseJsonLoose($("aiJsonInput").value);
    } catch (error) {
      alert(error.message || "Could not read the JSON.");
      return;
    }

    if (!Array.isArray(payload.updates)) {
      alert("JSON must contain an updates array.");
      return;
    }

    const state = readState();
    let itemCount = 0;
    let priceCount = 0;
    const checkedAt = payload.checkedAt || new Date().toISOString().slice(0, 10);

    payload.updates.forEach(update => {
      const item = (state.items || []).find(x => x.id === update.id);
      if (!item) return;
      itemCount += 1;
      if (update.imageUrl && !item.imageUrl) item.imageUrl = update.imageUrl;
      if (Array.isArray(update.prices)) {
        item.prices ||= [];
        update.prices.forEach(price => {
          if (!price || !price.shop) return;
          const numericPrice = price.price === null || price.price === undefined || price.price === "" ? null : Number(price.price);
          const numericSale = price.salePrice === null || price.salePrice === undefined || price.salePrice === "" ? null : Number(price.salePrice);
          const existing = item.prices.find(p =>
            String(p.shop || "").toLowerCase() === String(price.shop || "").toLowerCase() &&
            String(p.url || "") === String(price.url || "")
          );
          const record = {
            id: existing?.id || id(),
            shop: price.shop || "",
            price: Number.isFinite(numericPrice) ? numericPrice : null,
            salePrice: Number.isFinite(numericSale) ? numericSale : null,
            currency: price.currency || "£",
            url: price.url || item.productUrl || "",
            note: price.note ? `${price.note} · AI checked ${checkedAt}` : `AI checked ${checkedAt}`,
            checkedAt: new Date().toISOString()
          };
          if (existing) Object.assign(existing, record);
          else item.prices.push(record);
          priceCount += 1;
        });
      }
      item.updatedAt = new Date().toISOString();
    });

    writeState(state);
    alert(`Applied updates for ${itemCount} item(s) and ${priceCount} price record(s).`);
    $("aiJsonInput").value = "";
    location.reload();
  }

  function bind() {
    $("copyAiPrompt")?.addEventListener("click", copyPrompt);
    $("downloadAiPrompt")?.addEventListener("click", downloadPrompt);
    $("applyAiJson")?.addEventListener("click", applyUpdates);
    $("clearAiJson")?.addEventListener("click", () => { $("aiJsonInput").value = ""; });
  }

  bind();
})();
