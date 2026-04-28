const STORE_KEY = "shopping-tracker-v1";
const categories = ["Food", "Drinks", "Clothes", "Crafts", "Home", "Beauty", "Study", "Other"];
let state = loadState();
let activePriceItemId = null;

const $ = id => document.getElementById(id);
const form = $("itemForm");
const itemsEl = $("items");
const summaryEl = $("summary");
const priceDialog = $("priceDialog");

init();

function init() {
  bind();
  renderFilters();
  render();
}

function bind() {
  form.addEventListener("submit", saveItem);
  $("clearForm").addEventListener("click", clearForm);
  $("search").addEventListener("input", render);
  $("categoryFilter").addEventListener("change", render);
  $("needWantFilter").addEventListener("change", render);
  $("sortMode").addEventListener("change", render);
  $("exportData").addEventListener("click", exportData);
  $("importData").addEventListener("change", importData);
  $("addDemo").addEventListener("click", addDemo);
  $("savePrice").addEventListener("click", savePrice);
}

function loadState() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || { items: [] }; }
  catch { return { items: [] }; }
}
function saveState() { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
function id() { return crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`; }
function esc(value) { return String(value || "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;"); }
function norm(value) { return String(value || "").toLowerCase().trim(); }

function saveItem(event) {
  event.preventDefault();
  const editingId = $("editingId").value;
  const item = editingId ? state.items.find(x => x.id === editingId) : { id: id(), prices: [], purchases: [], createdAt: new Date().toISOString() };
  item.name = $("itemName").value.trim();
  item.category = $("category").value;
  item.needWant = $("needWant").value;
  item.quantity = $("quantity").value.trim();
  item.repurchaseType = $("repurchaseType").value;
  item.manualDays = Number($("manualDays").value) || null;
  item.productUrl = $("productUrl").value.trim();
  item.imageUrl = $("imageUrl").value.trim();
  item.notes = $("notes").value.trim();
  item.updatedAt = new Date().toISOString();
  if (!editingId) state.items.push(item);
  saveState();
  clearForm();
  renderFilters();
  render();
}

function clearForm() {
  form.reset();
  $("editingId").value = "";
  $("category").value = "Food";
  $("needWant").value = "Need";
  $("repurchaseType").value = "habit";
}

function editItem(itemId) {
  const item = state.items.find(x => x.id === itemId);
  if (!item) return;
  $("editingId").value = item.id;
  $("itemName").value = item.name || "";
  $("category").value = item.category || "Food";
  $("needWant").value = item.needWant || "Need";
  $("quantity").value = item.quantity || "";
  $("repurchaseType").value = item.repurchaseType || "habit";
  $("manualDays").value = item.manualDays || "";
  $("productUrl").value = item.productUrl || "";
  $("imageUrl").value = item.imageUrl || "";
  $("notes").value = item.notes || "";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderFilters() {
  const current = $("categoryFilter").value;
  const used = [...new Set([...categories, ...state.items.map(i => i.category).filter(Boolean)])];
  $("categoryFilter").innerHTML = '<option value="">All categories</option>' + used.map(c => `<option>${esc(c)}</option>`).join("");
  $("categoryFilter").value = used.includes(current) ? current : "";
}

function filteredItems() {
  const q = norm($("search").value);
  const cat = $("categoryFilter").value;
  const need = $("needWantFilter").value;
  let list = state.items.filter(item => {
    const haystack = norm([item.name, item.category, item.needWant, item.quantity, item.notes, item.productUrl, item.imageUrl, ...(item.prices || []).map(p => `${p.shop} ${p.note} ${p.url}`)].join(" "));
    return (!q || haystack.includes(q)) && (!cat || item.category === cat) && (!need || item.needWant === need);
  });
  const sort = $("sortMode").value;
  list.sort((a, b) => {
    if (sort === "need") return needRank(a) - needRank(b) || a.name.localeCompare(b.name);
    if (sort === "next") return (nextRepurchaseDate(a)?.getTime() || Infinity) - (nextRepurchaseDate(b)?.getTime() || Infinity);
    if (sort === "price") return (bestPrice(a)?.effective ?? Infinity) - (bestPrice(b)?.effective ?? Infinity);
    if (sort === "recent") return (lastPurchaseDate(b)?.getTime() || 0) - (lastPurchaseDate(a)?.getTime() || 0);
    return (a.category || "").localeCompare(b.category || "") || needRank(a) - needRank(b) || a.name.localeCompare(b.name);
  });
  return list;
}
function needRank(item) { return { Need: 0, Try: 1, Want: 2, Maybe: 3 }[item.needWant] ?? 4; }

function render() {
  const list = filteredItems();
  renderSummary(list);
  itemsEl.innerHTML = "";
  if (!list.length) {
    itemsEl.innerHTML = '<div class="panel">No items yet. Add a grocery, product, or thing you want to try.</div>';
    return;
  }
  const grouped = groupBy(list, item => item.category || "Other");
  Object.entries(grouped).forEach(([category, items]) => {
    const section = document.createElement("section");
    section.className = "category-section";
    section.innerHTML = `<div class="category-header"><h3>${esc(category)}</h3><span>${items.length} item${items.length === 1 ? "" : "s"}</span></div><div class="category-grid"></div>`;
    const grid = section.querySelector(".category-grid");
    items.forEach(item => grid.appendChild(renderItemCard(item)));
    itemsEl.appendChild(section);
  });
}

function renderSummary(list) {
  const needs = list.filter(i => i.needWant === "Need").length;
  const wants = list.filter(i => i.needWant === "Want").length;
  const tries = list.filter(i => i.needWant === "Try").length;
  const due = list.filter(i => isRepurchaseDue(i)).length;
  summaryEl.innerHTML = [
    ["Items", list.length], ["Needs", needs], ["Wants", wants], ["To try", tries], ["Repurchase due", due]
  ].map(([label, value]) => `<div class="summary-card"><strong>${value}</strong>${label}</div>`).join("");
}

function renderItemCard(item) {
  const card = document.createElement("article");
  card.className = `item-card ${norm(item.needWant)}`;
  const best = bestPrice(item);
  const next = nextRepurchaseDate(item);
  const last = lastPurchaseDate(item);
  const image = item.imageUrl ? `<img class="item-image" src="${esc(item.imageUrl)}" alt="${esc(item.name)}" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'image-placeholder',textContent:'No image'}))">` : `<div class="image-placeholder">No image</div>`;
  card.innerHTML = `
    <div class="item-top">
      ${image}
      <div>
        <h3 class="item-title">${esc(item.name)}</h3>
        <div class="badges"><span class="badge ${norm(item.needWant)}">${esc(item.needWant)}</span><span class="badge">${esc(item.category)}</span>${item.quantity ? `<span class="badge">${esc(item.quantity)}</span>` : ""}</div>
      </div>
    </div>
    <p class="price-line">Best price: ${best ? `<span class="best-price">${esc(best.currency || "£")}${money(best.effective)}</span> at ${esc(best.shop)}${best.salePrice ? ` <span class="sale">sale</span>` : ""}` : "No prices yet"}</p>
    <p class="repurchase-line">${repurchaseText(item, next, last)}</p>
    ${item.notes ? `<p class="notes">${esc(item.notes)}</p>` : ""}
    <p class="purchase-history">Bought ${item.purchases?.length || 0} time${(item.purchases?.length || 0) === 1 ? "" : "s"}${last ? ` • last ${last.toLocaleDateString()}` : ""}</p>
    <div class="card-actions">
      <button type="button" data-action="bought">Bought today</button>
      <button type="button" data-action="prices">Prices</button>
      <button type="button" data-action="edit">Edit</button>
      ${item.productUrl ? `<a href="${esc(item.productUrl)}" target="_blank" rel="noopener">Open</a>` : ""}
      <button class="danger" type="button" data-action="delete">Delete</button>
    </div>`;
  card.querySelector('[data-action="bought"]').onclick = () => markBought(item.id);
  card.querySelector('[data-action="prices"]').onclick = () => openPrices(item.id);
  card.querySelector('[data-action="edit"]').onclick = () => editItem(item.id);
  card.querySelector('[data-action="delete"]').onclick = () => deleteItem(item.id);
  return card;
}

function groupBy(list, getter) {
  return list.reduce((acc, item) => {
    const key = getter(item);
    acc[key] ||= [];
    acc[key].push(item);
    return acc;
  }, {});
}

function bestPrice(item) {
  const prices = (item.prices || []).filter(p => p.price !== null && p.price !== undefined && p.price !== "");
  if (!prices.length) return null;
  return prices.map(p => ({ ...p, effective: Number(p.salePrice || p.price) })).sort((a, b) => a.effective - b.effective)[0];
}
function money(value) { return Number(value || 0).toFixed(2); }
function lastPurchaseDate(item) {
  if (!item.purchases?.length) return null;
  return new Date(item.purchases.map(p => p.date).sort().at(-1));
}
function averageGapDays(item) {
  const dates = (item.purchases || []).map(p => new Date(p.date)).sort((a, b) => a - b);
  if (item.manualDays) return item.manualDays;
  if (dates.length < 2) return null;
  const gaps = [];
  for (let i = 1; i < dates.length; i++) gaps.push((dates[i] - dates[i - 1]) / 86400000);
  return Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
}
function nextRepurchaseDate(item) {
  if (item.repurchaseType === "none") return null;
  const last = lastPurchaseDate(item);
  const days = item.repurchaseType === "manual" ? item.manualDays : averageGapDays(item);
  if (!last || !days) return null;
  return new Date(last.getTime() + days * 86400000);
}
function isRepurchaseDue(item) {
  const next = nextRepurchaseDate(item);
  if (!next) return false;
  const today = new Date(); today.setHours(0,0,0,0);
  next.setHours(0,0,0,0);
  return next <= today;
}
function repurchaseText(item, next, last) {
  if (item.repurchaseType === "none") return "No repurchase reminder";
  const avg = averageGapDays(item);
  if (!last) return "Repurchase estimate: buy once to start tracking";
  if (!avg) return "Repurchase estimate: buy twice to estimate habit";
  if (!next) return "Repurchase estimate unavailable";
  const today = new Date(); today.setHours(0,0,0,0);
  const n = new Date(next); n.setHours(0,0,0,0);
  const days = Math.round((n - today) / 86400000);
  if (days < 0) return `Repurchase due ${Math.abs(days)} day(s) ago · every ~${avg} days`;
  if (days === 0) return `Repurchase due today · every ~${avg} days`;
  return `Repurchase in ${days} day(s) · every ~${avg} days`;
}

function markBought(itemId) {
  const item = state.items.find(x => x.id === itemId);
  if (!item) return;
  const best = bestPrice(item);
  item.purchases ||= [];
  item.purchases.push({ date: new Date().toISOString(), price: best?.effective ?? null, shop: best?.shop || "", quantity: item.quantity || "" });
  item.updatedAt = new Date().toISOString();
  saveState();
  render();
}
function deleteItem(itemId) {
  if (!confirm("Delete this item?")) return;
  state.items = state.items.filter(x => x.id !== itemId);
  saveState();
  renderFilters();
  render();
}

function openPrices(itemId) {
  const item = state.items.find(x => x.id === itemId);
  if (!item) return;
  activePriceItemId = itemId;
  $("priceItemId").value = itemId;
  $("priceDialogTitle").textContent = `Prices: ${item.name}`;
  renderPrices(item);
  priceDialog.showModal();
}
function renderPrices(item) {
  const prices = [...(item.prices || [])].sort((a, b) => Number(a.salePrice || a.price) - Number(b.salePrice || b.price));
  $("pricesList").innerHTML = prices.length ? prices.map(p => `
    <div class="price-row">
      <div class="price-row-head"><strong>${esc(p.shop)}</strong><span>${esc(p.currency || "£")}${money(p.price)}${p.salePrice ? ` → <span class="sale">${esc(p.currency || "£")}${money(p.salePrice)}</span>` : ""}</span></div>
      ${p.url ? `<a href="${esc(p.url)}" target="_blank" rel="noopener">Open product</a>` : ""}
      ${p.note ? `<span class="muted">${esc(p.note)}</span>` : ""}
      <button class="danger" type="button" onclick="removePrice('${item.id}','${p.id}')">Remove</button>
    </div>`).join("") : '<p class="muted">No shop prices saved yet.</p>';
}
function savePrice() {
  const item = state.items.find(x => x.id === activePriceItemId);
  if (!item) return;
  const price = Number($("shopPrice").value);
  if (!$("shopName").value.trim() || Number.isNaN(price)) return alert("Add a shop and price.");
  item.prices ||= [];
  item.prices.push({ id: id(), shop: $("shopName").value.trim(), price, salePrice: $("salePrice").value ? Number($("salePrice").value) : null, currency: $("currency").value || "£", url: $("shopUrl").value.trim(), note: $("priceNote").value.trim(), checkedAt: new Date().toISOString() });
  item.updatedAt = new Date().toISOString();
  saveState();
  ["shopName", "shopPrice", "salePrice", "shopUrl", "priceNote"].forEach(x => $(x).value = "");
  $("currency").value = "£";
  renderPrices(item);
  render();
}
window.removePrice = function(itemId, priceId) {
  const item = state.items.find(x => x.id === itemId);
  if (!item) return;
  item.prices = (item.prices || []).filter(p => p.id !== priceId);
  saveState();
  renderPrices(item);
  render();
};

function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `shopping-tracker-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
function importData(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result));
      if (!Array.isArray(data.items)) throw new Error("Invalid file");
      if (!confirm("Import this backup? It will replace shopping data in this browser.")) return;
      state = data;
      saveState();
      renderFilters();
      render();
    } catch {
      alert("Could not import that file.");
    } finally {
      event.target.value = "";
    }
  };
  reader.readAsText(file);
}

function addDemo() {
  if (state.items.length && !confirm("Add example items to your current list?")) return;
  state.items.push(
    { id: id(), name: "Oat milk", category: "Drinks", needWant: "Need", quantity: "1 carton", repurchaseType: "habit", manualDays: null, productUrl: "", imageUrl: "", notes: "Regular grocery", prices: [{ id: id(), shop: "Example shop", price: 1.8, salePrice: 1.4, currency: "£", url: "", note: "Example sale", checkedAt: new Date().toISOString() }], purchases: [{ date: new Date(Date.now() - 14*86400000).toISOString() }, { date: new Date(Date.now() - 7*86400000).toISOString() }], createdAt: new Date().toISOString() },
    { id: id(), name: "Chunky yarn", category: "Crafts", needWant: "Want", quantity: "2 balls", repurchaseType: "none", manualDays: null, productUrl: "", imageUrl: "", notes: "For crochet ideas", prices: [], purchases: [], createdAt: new Date().toISOString() },
    { id: id(), name: "Black jeans", category: "Clothes", needWant: "Maybe", quantity: "1 pair", repurchaseType: "none", manualDays: null, productUrl: "", imageUrl: "", notes: "Check fit and reviews before buying", prices: [], purchases: [], createdAt: new Date().toISOString() }
  );
  saveState();
  renderFilters();
  render();
}
