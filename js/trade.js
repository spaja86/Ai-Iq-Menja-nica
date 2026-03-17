// Ai Iq Menjačnica - Market Trade (static demo)
// Requirements implemented:
// - BUY / SELL
// - Fiat selection: EUR or RSD (and we also display BOTH EUR and RSD prices)
// - Fee: 2%
// - Mode A: search + list + "Load more" (CoinGecko markets pagination) => practical "ALL"
// - Mode B: searchable dropdown-like list (same dataset; different UI)
// - FX: EUR/RSD via exchangerate.host
// - Default coin: BTC (CoinGecko id: "bitcoin")

const FEE_RATE = 0.02;
const DEFAULT_COIN_ID = "bitcoin";

const els = {
  tradeType: document.getElementById("trade-type"),
  currency: document.getElementById("currency"),
  mode: document.getElementById("mode"),
  results: document.getElementById("results"),
  tradeBtn: document.getElementById("trade-button"),
  feeLabel: document.getElementById("fee"),
};

const state = {
  page: 1,
  perPage: 50,
  coins: [],
  query: "",
  selected: null,
  priceEur: null,
  eurRsd: null,
};

function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") el.className = v;
    else if (k === "html") el.innerHTML = v;
    else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v);
  }
  for (const c of children) {
    if (c == null) continue;
    if (typeof c === "string") el.appendChild(document.createTextNode(c));
    else el.appendChild(c);
  }
  return el;
}

function formatNumber(n, max = 8) {
  return new Intl.NumberFormat("sr-RS", { maximumFractionDigits: max }).format(n);
}
function formatMoney(n, cur) {
  return new Intl.NumberFormat("sr-RS", { style: "currency", currency: cur, maximumFractionDigits: 2 }).format(n);
}

function setStatus(msg, type = "") {
  const s = document.getElementById("status");
  if (!s) return;
  s.textContent = msg || "";
  s.className = `status ${type}`.trim();
}

function ensureUI() {
  els.results.innerHTML = "";
  if (els.feeLabel) els.feeLabel.textContent = "2%";

  const status = h("div", { id: "status", class: "status" }, "");

  const top = h(
    "div",
    { class: "trade-top" },
    h(
      "div",
      { class: "field" },
      h("label", { for: "amount" }, "Amount / Iznos"),
      h("input", { id: "amount", type: "number", min: "0", step: "0.00000001", placeholder: "npr. 1000" }),
      h("small", { id: "amount-hint", class: "hint" }, "BUY: amount in fiat, SELL: amount in crypto")
    ),
    h(
      "div",
      { class: "field" },
      h("label", { for: "coin-search" }, "Search coin"),
      h("input", { id: "coin-search", type: "text", placeholder: "bitcoin, eth, sol..." }),
      h("small", { class: "hint" }, "A: list + Load more | B: dropdown list. Klikni coin.")
    ),
    h(
      "div",
      { class: "buttons" },
      h("button", { id: "load-more", type: "button" }, "Load more"),
      h("button", { id: "refresh", type: "button", class: "primary" }, "Refresh quote")
    )
  );

  const pickers = h(
    "div",
    { class: "pickers" },
    h(
      "div",
      { id: "pickerA", class: "picker" },
      h("div", { class: "picker-title" }, "Mode A — Search + Load more (SVE)"),
      h("div", { id: "coin-list-a", class: "coinList" })
    ),
    h(
      "div",
      { id: "pickerB", class: "picker", style: "display:none;" },
      h("div", { class: "picker-title" }, "Mode B — Searchable dropdown (SVE)"),
      h("div", { class: "selected" }, "Selected: ", h("strong", { id: "selected-coin" }, "—")),
      h("div", { id: "coin-list-b", class: "coinList" })
    )
  );

  const quote = h(
    "div",
    { class: "quote" },
    h("div", { class: "qrow" }, h("span", {}, "Selected coin"), h("strong", { id: "q-coin" }, "—")),
    h("div", { class: "qrow" }, h("span", {}, "Price (EUR)"), h("strong", { id: "q-price-eur" }, "—")),
    h("div", { class: "qrow" }, h("span", {}, "Price (RSD)"), h("strong", { id: "q-price-rsd" }, "—")),
    h("div", { class: "qrow" }, h("span", {}, "EUR/RSD"), h("strong", { id: "q-fx" }, "—")),
    h("div", { class: "qrow" }, h("span", {}, "Fee (2%)"), h("strong", { id: "q-fee" }, "—")),
    h("div", { class: "qrow" }, h("span", {}, "Result"), h("strong", { id: "q-result" }, "—"))
  );

  els.results.appendChild(status);
  els.results.appendChild(top);
  els.results.appendChild(pickers);
  els.results.appendChild(quote);
}

function ui() {
  return {
    amount: document.getElementById("amount"),
    amountHint: document.getElementById("amount-hint"),
    coinSearch: document.getElementById("coin-search"),
    loadMore: document.getElementById("load-more"),
    refresh: document.getElementById("refresh"),
    pickerA: document.getElementById("pickerA"),
    pickerB: document.getElementById("pickerB"),
    coinListA: document.getElementById("coin-list-a"),
    coinListB: document.getElementById("coin-list-b"),
    selectedCoin: document.getElementById("selected-coin"),
    qCoin: document.getElementById("q-coin"),
    qPriceEur: document.getElementById("q-price-eur"),
    qPriceRsd: document.getElementById("q-price-rsd"),
    qFx: document.getElementById("q-fx"),
    qFee: document.getElementById("q-fee"),
    qResult: document.getElementById("q-result"),
  };
}

async function fetchEurRsd() {
  const res = await fetch("https://api.exchangerate.host/latest?base=EUR&symbols=RSD");
  if (!res.ok) throw new Error("FX error: cannot load EUR/RSD.");
  const data = await res.json();
  const rate = data?.rates?.RSD;
  if (typeof rate !== "number") throw new Error("FX error: invalid EUR/RSD.");
  return rate;
}

async function fetchMarketPage(page, perPage) {
  const url =
    "https://api.coingecko.com/api/v3/coins/markets" +
    `?vs_currency=eur&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=false`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Market list error (CoinGecko). Try again later.");
  return await res.json();
}

async function fetchPriceEur(coinId) {
  const url =
    "https://api.coingecko.com/api/v3/simple/price" +
    `?ids=${encodeURIComponent(coinId)}&vs_currencies=eur`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Price error (CoinGecko). Try again later.");
  const data = await res.json();
  const p = data?.[coinId]?.eur;
  if (typeof p !== "number") throw new Error("Price error: invalid response.");
  return p;
}

function matches(c, q) {
  if (!q) return true;
  q = q.trim().toLowerCase();
  return (
    (c.name || "").toLowerCase().includes(q) ||
    (c.symbol || "").toLowerCase().includes(q) ||
    (c.id || "").toLowerCase().includes(q)
  );
}

function updateModeUI(U) {
  const m = els.mode.value;
  const isB = m === "B";
  U.pickerA.style.display = isB ? "none" : "block";
  U.pickerB.style.display = isB ? "block" : "none";
}

function updateAmountHint(U) {
  const t = els.tradeType.value;
  if (t === "buy") {
    U.amountHint.textContent = "BUY: amount in fiat (EUR/RSD)";
    U.amount.placeholder = "npr. 1000 (fiat)";
  } else {
    U.amountHint.textContent = "SELL: amount in crypto";
    U.amount.placeholder = "npr. 0.05 (BTC)";
  }
}

async function refreshQuote(U) {
  if (!state.eurRsd) state.eurRsd = await fetchEurRsd();
  U.qFx.textContent = `${formatNumber(state.eurRsd, 4)} RSD / 1 EUR`;

  if (!state.selected || !state.priceEur) {
    U.qPriceEur.textContent = "—";
    U.qPriceRsd.textContent = "—";
    U.qFee.textContent = "—";
    U.qResult.textContent = "—";
    return;
  }

  const sym = state.selected.symbol.toUpperCase();
  const priceEur = state.priceEur;
  const priceRsd = priceEur * state.eurRsd;

  U.qCoin.textContent = `${state.selected.name} (${sym})`;
  U.qPriceEur.textContent = `${formatMoney(priceEur, "EUR")} / 1 ${sym}`;
  U.qPriceRsd.textContent = `${formatMoney(priceRsd, "RSD")} / 1 ${sym}`;

  const amount = Number(U.amount.value || 0);
  if (amount <= 0) {
    U.qFee.textContent = "—";
    U.qResult.textContent = "Enter amount.";
    return;
  }

  const side = els.tradeType.value;
  const fiat = els.currency.value;

  if (side === "buy") {
    let amountEur = amount;
    if (fiat === "RSD") amountEur = amount / state.eurRsd;

    const grossCrypto = amountEur / priceEur;
    const feeCrypto = grossCrypto * FEE_RATE;
    const netCrypto = grossCrypto - feeCrypto;

    U.qFee.textContent = `${formatNumber(feeCrypto, 8)} ${sym}`;
    U.qResult.textContent = `${formatNumber(netCrypto, 8)} ${sym}`;
  } else {
    const cryptoAmount = amount;
    const grossEur = cryptoAmount * priceEur;

    if (fiat === "EUR") {
      const feeEur = grossEur * FEE_RATE;
      const netEur = grossEur - feeEur;
      U.qFee.textContent = `${formatMoney(feeEur, "EUR")}`;
      U.qResult.textContent = `${formatMoney(netEur, "EUR")}`;
    } else {
      const grossRsd = grossEur * state.eurRsd;
      const feeRsd = grossRsd * FEE_RATE;
      const netRsd = grossRsd - feeRsd;
      U.qFee.textContent = `${formatMoney(feeRsd, "RSD")}`;
      U.qResult.textContent = `${formatMoney(netRsd, "RSD")}`;
    }
  }
}

function renderCoins(targetEl, coins, U) {
  targetEl.innerHTML = "";
  if (!coins.length) {
    targetEl.appendChild(h("div", { class: "coinItem muted" }, "No results."));
    return;
  }

  for (const c of coins) {
    const row = h(
      "div",
      {
        class: "coinItem",
        onclick: async () => {
          state.selected = { id: c.id, symbol: c.symbol, name: c.name };
          if (U.selectedCoin) U.selectedCoin.textContent = `${c.name} (${c.symbol.toUpperCase()})`;

          setStatus("Loading price...", "");
          try {
            state.priceEur = await fetchPriceEur(c.id);
            await refreshQuote(U);
            setStatus("Ready.", "ok");
          } catch (e) {
            setStatus(e?.message || "Error.", "err");
          }
        },
      },
      h(
        "div",
        { class: "coinLeft" },
        h(
          "div",
          { class: "coinTop" },
          h("strong", {}, (c.symbol || "").toUpperCase()),
          h("span", {}, c.name || "")
        ),
        h("small", {}, c.id || "")
      ),
      h("div", { class: "coinRight" }, typeof c.current_price === "number" ? formatMoney(c.current_price, "EUR") : "")
    );

    targetEl.appendChild(row);
  }
}

async function loadMore(U) {
  setStatus("Loading market list...", "");
  const pageData = await fetchMarketPage(state.page, state.perPage);
  state.coins = state.coins.concat(pageData);
  state.page += 1;

  const filtered = state.coins.filter((c) => matches(c, state.query));
  renderCoins(U.coinListA, filtered, U);
  renderCoins(U.coinListB, filtered, U);

  setStatus(`Loaded ${state.coins.length} coins.`, "ok");
}

function onSearchChanged(U) {
  state.query = U.coinSearch.value || "";
  const filtered = state.coins.filter((c) => matches(c, state.query));
  renderCoins(U.coinListA, filtered, U);
  renderCoins(U.coinListB, filtered, U);
}

async function selectDefaultBTC(U) {
  if (!state.coins.length) await loadMore(U);

  const btc = state.coins.find((c) => c.id === DEFAULT_COIN_ID) || null;
  state.selected = btc
    ? { id: btc.id, symbol: btc.symbol, name: btc.name }
    : { id: DEFAULT_COIN_ID, symbol: "btc", name: "Bitcoin" };

  if (U.selectedCoin) U.selectedCoin.textContent = "Bitcoin (BTC)";
  setStatus("Loading BTC price...", "");
  state.priceEur = await fetchPriceEur(DEFAULT_COIN_ID);
  await refreshQuote(U);
  setStatus("Ready (BTC).", "ok");
}

(async function init() {
  ensureUI();
  const U = ui();

  updateModeUI(U);
  updateAmountHint(U);

  els.mode.addEventListener("change", () => updateModeUI(U));
  els.tradeType.addEventListener("change", () => {
    updateAmountHint(U);
    refreshQuote(U).catch(() => {});
  });
  els.currency.addEventListener("change", () => refreshQuote(U).catch(() => {}));

  U.amount.addEventListener("input", () => refreshQuote(U).catch(() => {}));
  U.coinSearch.addEventListener("input", () => onSearchChanged(U));

  U.loadMore.addEventListener("click", () => loadMore(U).catch((e) => setStatus(e?.message || "Error", "err")));
  U.refresh.addEventListener("click", () => refreshQuote(U).catch((e) => setStatus(e?.message || "Error", "err")));

  els.tradeBtn.addEventListener("click", () => {
    if (!state.selected) return setStatus("Select coin first.", "err");
    const amount = Number(U.amount.value || 0);
    if (amount <= 0) return setStatus("Enter amount > 0.", "err");
    setStatus("Trade submitted (demo).", "ok");
  });

  try {
    state.eurRsd = await fetchEurRsd();
    await selectDefaultBTC(U);
  } catch (e) {
    setStatus(e?.message || "Init error.", "err");
  }
})();