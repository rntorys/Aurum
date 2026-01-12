const STORAGE_KEY = "investmentHub:v1";
const DEFAULT_COLORS = ["#22c55e", "#38bdf8", "#f97316", "#a855f7", "#f43f5e"];
const DEFAULT_THEME = {
  positive: "#22c55e",
  negative: "#ef4444",
  chart: "#22c55e"
};
const DEFAULT_PRIVACY = {
  presentationMode: false
};
const DEFAULT_CURRENCY = "CLP";
const DEFAULT_USD_RATE = 900;

const demoData = {
  portfolios: [
    { id: "p1", name: "Reserva", color: "#22c55e" },
    { id: "p2", name: "Moderada", color: "#38bdf8" },
    { id: "p3", name: "Muy arriesgada", color: "#f97316" }
  ],
  transactions: [
    { id: "t1", portfolioId: "p1", date: "2025-10-05", type: "aporte", amount: 2500000, note: "Fondo emergencia" },
    { id: "t2", portfolioId: "p1", date: "2025-11-15", type: "aporte", amount: 1500000, note: "Aporte extra" },
    { id: "t3", portfolioId: "p1", date: "2025-12-05", type: "retiro", amount: 200000, note: "Gasto medico" },
    { id: "t4", portfolioId: "p2", date: "2025-10-12", type: "aporte", amount: 5000000, note: "Capital inicial" },
    { id: "t5", portfolioId: "p2", date: "2025-11-10", type: "compra", amount: 1200000, note: "Compra ETF" },
    { id: "t6", portfolioId: "p2", date: "2025-11-20", type: "venta", amount: 1500000, note: "Venta parcial" },
    { id: "t7", portfolioId: "p2", date: "2025-12-10", type: "aporte", amount: 2000000, note: "Aporte mensual" },
    { id: "t8", portfolioId: "p3", date: "2025-10-18", type: "aporte", amount: 3000000, note: "Capital inicial" },
    { id: "t9", portfolioId: "p3", date: "2025-11-07", type: "compra", amount: 900000, note: "Compra cripto" },
    { id: "t10", portfolioId: "p3", date: "2025-12-01", type: "comision", amount: 60000, note: "Comision exchange" }
  ],
  balances: [
    { id: "b1", portfolioId: "p1", date: "2025-12-10", value: 5400000 },
    { id: "b2", portfolioId: "p1", date: "2025-12-11", value: 5600000 },
    { id: "b3", portfolioId: "p1", date: "2025-12-12", value: 5800000 },
    { id: "b4", portfolioId: "p2", date: "2025-12-10", value: 12100000 },
    { id: "b5", portfolioId: "p2", date: "2025-12-11", value: 12350000 },
    { id: "b6", portfolioId: "p2", date: "2025-12-12", value: 12400000 },
    { id: "b7", portfolioId: "p3", date: "2025-12-10", value: 8600000 },
    { id: "b8", portfolioId: "p3", date: "2025-12-11", value: 8750000 },
    { id: "b9", portfolioId: "p3", date: "2025-12-12", value: 8900000 }
  ]
};

let state = loadState();
let currentPortfolioId = null;
let rangeFilter = "30d";
let chartMode = "cumulative";
let dashboardChartMode = "cumulative";
let editingPortfolioId = null;
let balancesPage = 1;
const BALANCES_PER_PAGE = 5;
let lineChart = null;
let doughnutChart = null;
let portfolioLineChart = null;
let currentView = "dashboard";
let balancesSort = { key: "date", direction: "desc" };
let transactionsSort = { key: "date", direction: "desc" };
let toastTimeout = null;
let toastUndoAction = null;

applyTheme(state.theme);
applyPresentationMode(state.presentationMode);

const elements = {
  sidebar: document.getElementById("sidebar"),
  toggleSidebar: document.getElementById("toggleSidebar"),
  closeSidebar: document.getElementById("closeSidebar"),
  dashboardNav: document.querySelector("[data-view='dashboard']"),
  portfolioList: document.getElementById("portfolioList"),
  dashboardView: document.getElementById("dashboardView"),
  portfolioView: document.getElementById("portfolioView"),
  dashboardKpis: document.getElementById("dashboardKpis"),
  summaryTable: document.querySelector("#summaryTable tbody"),
  monthlyTable: document.querySelector("#monthlyTable tbody"),
  dashboardChartMode: document.getElementById("dashboardChartMode"),
  lineChart: document.getElementById("lineChart"),
  doughnutChart: document.getElementById("doughnutChart"),
  viewTitle: document.getElementById("viewTitle"),
  viewSubtitle: document.getElementById("viewSubtitle"),
  portfolioName: document.getElementById("portfolioName"),
  portfolioKpis: document.getElementById("portfolioKpis"),
  portfolioLineChart: document.getElementById("portfolioLineChart"),
  balancesTable: document.querySelector("#balancesTable tbody"),
  balancesTableHeader: document.querySelector("#balancesTable thead"),
  balancesInfo: document.getElementById("balancesInfo"),
  balancesPrev: document.getElementById("balancesPrev"),
  balancesNext: document.getElementById("balancesNext"),
  transactionsTable: document.querySelector("#transactionsTable tbody"),
  transactionsTableHeader: document.querySelector("#transactionsTable thead"),
  rangeFilters: document.getElementById("rangeFilters"),
  chartMode: document.getElementById("chartMode"),
  searchInput: document.getElementById("searchInput"),
  typeFilter: document.getElementById("typeFilter"),
  amountMin: document.getElementById("amountMin"),
  amountMax: document.getElementById("amountMax"),
  positiveColorInput: document.getElementById("positiveColorInput"),
  negativeColorInput: document.getElementById("negativeColorInput"),
  chartColorInput: document.getElementById("chartColorInput"),
  presentationToggle: document.getElementById("presentationToggle"),
  customWidgets: document.getElementById("customWidgets"),
  addWidgetBtn: document.getElementById("addWidgetBtn"),
  widgetModal: document.getElementById("widgetModal"),
  closeWidgetModal: document.getElementById("closeWidgetModal"),
  widgetForm: document.getElementById("widgetForm"),
  widgetType: document.getElementById("widgetType"),
  cancelWidget: document.getElementById("cancelWidget"),
  toast: document.getElementById("toast"),
  toastMessage: document.getElementById("toastMessage"),
  toastUndoBtn: document.getElementById("toastUndoBtn"),
  settingsBtn: document.getElementById("settingsBtn"),
  settingsModal: document.getElementById("settingsModal"),
  closeSettingsModal: document.getElementById("closeSettingsModal"),
  doneSettingsBtn: document.getElementById("doneSettingsBtn"),
  addMovementBtn: document.getElementById("addMovementBtn"),
  addBalanceBtn: document.getElementById("addBalanceBtn"),
  movementModal: document.getElementById("movementModal"),
  movementForm: document.getElementById("movementForm"),
  closeModal: document.getElementById("closeModal"),
  cancelModal: document.getElementById("cancelModal"),
  modalTitle: document.getElementById("modalTitle"),
  transactionId: document.getElementById("transactionId"),
  dateInput: document.getElementById("dateInput"),
  typeInput: document.getElementById("typeInput"),
  amountInput: document.getElementById("amountInput"),
  noteInput: document.getElementById("noteInput"),
  newPortfolioBtn: document.getElementById("newPortfolioBtn"),
  portfolioModal: document.getElementById("portfolioModal"),
  portfolioModalTitle: document.getElementById("portfolioModalTitle"),
  portfolioForm: document.getElementById("portfolioForm"),
  portfolioNameInput: document.getElementById("portfolioNameInput"),
  portfolioCurrencyInput: document.getElementById("portfolioCurrencyInput"),
  portfolioUsdRateInput: document.getElementById("portfolioUsdRateInput"),
  portfolioUsdRateField: document.getElementById("portfolioUsdRateField"),
  portfolioColorInput: document.getElementById("portfolioColorInput"),
  portfolioSubmitBtn: document.getElementById("portfolioSubmitBtn"),
  closePortfolioModal: document.getElementById("closePortfolioModal"),
  cancelPortfolio: document.getElementById("cancelPortfolio"),
  balanceModal: document.getElementById("balanceModal"),
  balanceForm: document.getElementById("balanceForm"),
  balanceModalTitle: document.getElementById("balanceModalTitle"),
  balanceId: document.getElementById("balanceId"),
  balanceDateInput: document.getElementById("balanceDateInput"),
  balanceValueInput: document.getElementById("balanceValueInput"),
  closeBalanceModal: document.getElementById("closeBalanceModal"),
  cancelBalance: document.getElementById("cancelBalance"),
  renamePortfolioBtn: document.getElementById("renamePortfolioBtn"),
  deletePortfolioBtn: document.getElementById("deletePortfolioBtn"),
  exportBtn: document.getElementById("exportBtn"),
  importInput: document.getElementById("importInput"),
  resetBtn: document.getElementById("resetBtn")
};

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seed = JSON.parse(JSON.stringify(demoData));
    seed.customWidgets = [];
    seed.theme = { ...DEFAULT_THEME };
    seed.portfolios = seed.portfolios.map((portfolio) => ({
      ...portfolio,
      currency: DEFAULT_CURRENCY,
      usdRate: DEFAULT_USD_RATE
    }));
    return seed;
  }
  try {
    const parsed = JSON.parse(raw);
    if (!parsed.balances) parsed.balances = [];
    if (!parsed.customWidgets) parsed.customWidgets = [];
    if (!parsed.theme) parsed.theme = { ...DEFAULT_THEME };
    if (parsed.presentationMode === undefined) parsed.presentationMode = DEFAULT_PRIVACY.presentationMode;
    parsed.portfolios = parsed.portfolios.map((portfolio, index) => ({
      ...portfolio,
      color: portfolio.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
      currency: portfolio.currency || DEFAULT_CURRENCY,
      usdRate: portfolio.usdRate || DEFAULT_USD_RATE
    }));
    return parsed;
  } catch {
    const seed = JSON.parse(JSON.stringify(demoData));
    seed.customWidgets = [];
    seed.theme = { ...DEFAULT_THEME };
    seed.presentationMode = DEFAULT_PRIVACY.presentationMode;
    seed.portfolios = seed.portfolios.map((portfolio) => ({
      ...portfolio,
      currency: DEFAULT_CURRENCY,
      usdRate: DEFAULT_USD_RATE
    }));
    return seed;
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function formatMoney(value, currency) {
  const isUsd = currency === "USD";
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: isUsd ? "USD" : "CLP",
    maximumFractionDigits: isUsd ? 2 : 0
  }).format(value);
}

function formatCurrency(value) {
  return formatMoney(value, "CLP");
}

function formatPercent(value) {
  return `${(value * 100).toFixed(2)}%`;
}

function hexToRgb(hex) {
  const trimmed = hex.replace("#", "");
  const normalized = trimmed.length === 3
    ? trimmed.split("").map((char) => char + char).join("")
    : trimmed;
  if (normalized.length !== 6) return "34, 197, 94";
  const num = parseInt(normalized, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `${r}, ${g}, ${b}`;
}

function applyTheme(theme) {
  const active = theme || DEFAULT_THEME;
  const root = document.documentElement;
  root.style.setProperty("--positive", active.positive);
  root.style.setProperty("--negative", active.negative);
  root.style.setProperty("--chart", active.chart || active.positive);
  root.style.setProperty("--positive-rgb", hexToRgb(active.positive));
  root.style.setProperty("--negative-rgb", hexToRgb(active.negative));
  root.style.setProperty("--accent", active.positive);
}

function applyPresentationMode(enabled) {
  document.body.classList.toggle("presentation-mode", Boolean(enabled));
}

function syncThemeInputs() {
  if (!elements.positiveColorInput) return;
  elements.positiveColorInput.value = state.theme.positive;
  elements.negativeColorInput.value = state.theme.negative;
  elements.chartColorInput.value = state.theme.chart || state.theme.positive;
}

function syncPresentationToggle() {
  if (!elements.presentationToggle) return;
  elements.presentationToggle.checked = Boolean(state.presentationMode);
}

function getPortfolioTransactions(portfolioId) {
  return state.transactions.filter((tx) => tx.portfolioId === portfolioId);
}

function getBalances(portfolioId) {
  return state.balances
    .filter((balance) => balance.portfolioId === portfolioId)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

function buildNetAporteMap(portfolioId) {
  const map = new Map();
  const transactions = getPortfolioTransactions(portfolioId);
  transactions.forEach((tx) => {
    if (tx.type !== "aporte" && tx.type !== "retiro") return;
    const current = map.get(tx.date) || 0;
    const delta = tx.type === "aporte" ? tx.amount : -tx.amount;
    map.set(tx.date, current + delta);
  });
  return map;
}

function buildGlobalNetAporteMap() {
  const map = new Map();
  const portfolioMap = new Map(state.portfolios.map((item) => [item.id, item]));
  state.transactions.forEach((tx) => {
    if (tx.type !== "aporte" && tx.type !== "retiro") return;
    const portfolio = portfolioMap.get(tx.portfolioId);
    const amountClp = portfolio ? convertToClp(tx.amount, portfolio) : tx.amount;
    const current = map.get(tx.date) || 0;
    const delta = tx.type === "aporte" ? amountClp : -amountClp;
    map.set(tx.date, current + delta);
  });
  return map;
}

function getPortfolioColor(portfolio, index) {
  return portfolio.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
}

function getPortfolioCurrency(portfolio) {
  return portfolio.currency || DEFAULT_CURRENCY;
}

function getPortfolioUsdRate(portfolio) {
  return Number(portfolio.usdRate) || DEFAULT_USD_RATE;
}

function convertToClp(value, portfolio) {
  if (getPortfolioCurrency(portfolio) === "USD") {
    return value * getPortfolioUsdRate(portfolio);
  }
  return value;
}

function getLastBalanceDate(portfolioId) {
  const balances = getBalances(portfolioId);
  if (!balances.length) return "-";
  return balances[balances.length - 1].date;
}

function getAportesNetos(transactions) {
  const aportes = sumByType(transactions, "aporte");
  const retiros = sumByType(transactions, "retiro");
  return aportes - retiros;
}

function getFlujoNeto(transactions) {
  const ventas = sumByType(transactions, "venta");
  const compras = sumByType(transactions, "compra");
  const comisiones = sumByType(transactions, "comision");
  return ventas - compras - comisiones;
}

function getValorActual(portfolio, transactions) {
  const balances = getBalances(portfolio.id);
  if (balances.length) {
    return balances[balances.length - 1].value;
  }
  return getAportesNetos(transactions) + getFlujoNeto(transactions);
}

function getPnL(valorActual, aportesNetos) {
  return valorActual - aportesNetos;
}

function getPnLPercent(pnl, aportesNetos) {
  return pnl / Math.max(aportesNetos, 1);
}

function sumByType(transactions, type) {
  return transactions.filter((tx) => tx.type === type).reduce((acc, tx) => acc + tx.amount, 0);
}

function getDateRangeFilter() {
  if (rangeFilter === "all") return { from: null, to: null };
  const now = new Date();
  if (rangeFilter === "ytd") {
    return { from: new Date(now.getFullYear(), 0, 1), to: now };
  }
  const days = rangeFilter === "7d" ? 7 : 30;
  const from = new Date(now);
  from.setDate(now.getDate() - days);
  return { from, to: now };
}

function filterByRange(list, dateKey) {
  const { from, to } = getDateRangeFilter();
  return list.filter((item) => {
    const date = new Date(item[dateKey]);
    if (from && date < from) return false;
    if (to && date > to) return false;
    return true;
  });
}

function buildValueSeries() {
  const sorted = [...state.transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
  let running = 0;
  return sorted.map((tx) => {
    if (tx.type === "aporte") running += tx.amount;
    if (tx.type === "retiro") running -= tx.amount;
    if (tx.type === "compra") running -= tx.amount;
    if (tx.type === "venta") running += tx.amount;
    if (tx.type === "comision") running -= tx.amount;
    return { date: tx.date, value: running };
  });
}

function buildDistribution() {
  return state.portfolios.map((portfolio, index) => {
    const transactions = getPortfolioTransactions(portfolio.id);
    return {
      name: portfolio.name,
      value: convertToClp(getValorActual(portfolio, transactions), portfolio),
      color: getPortfolioColor(portfolio, index)
    };
  });
}

function buildGlobalBalances() {
  const dates = Array.from(new Set(state.balances.map((balance) => balance.date))).sort(
    (a, b) => new Date(a) - new Date(b)
  );
  const byPortfolio = new Map();
  const portfolioMap = new Map(state.portfolios.map((item) => [item.id, item]));
  state.balances.forEach((balance) => {
    if (!byPortfolio.has(balance.portfolioId)) {
      byPortfolio.set(balance.portfolioId, []);
    }
    const portfolio = portfolioMap.get(balance.portfolioId);
    const converted = portfolio ? convertToClp(balance.value, portfolio) : balance.value;
    byPortfolio.get(balance.portfolioId).push({ ...balance, value: converted });
  });
  byPortfolio.forEach((items) => items.sort((a, b) => new Date(a.date) - new Date(b.date)));

  const series = dates.map((date) => {
    let total = 0;
    byPortfolio.forEach((items) => {
      const last = [...items].reverse().find((item) => item.date <= date);
      if (last) total += last.value;
    });
    return { date, value: total };
  });
  return series;
}

function getDailyStats(balances, portfolioId) {
  const netMap = buildNetAporteMap(portfolioId);
  if (balances.length < 2) {
    return { dailyGain: 0, dailyPercent: 0, avgDailyPercent: 0, cumulativeGain: 0, cumulativePercent: 0 };
  }
  const last = balances[balances.length - 1];
  const prev = balances[balances.length - 2];
  const lastNet = netMap.get(last.date) || 0;
  const dailyGain = last.value - prev.value - lastNet;
  const dailyPercent = dailyGain / Math.max(prev.value, 1);

  let sumPercent = 0;
  let cumulativeGain = 0;
  for (let i = 1; i < balances.length; i += 1) {
    const diff = balances[i].value - balances[i - 1].value;
    const net = netMap.get(balances[i].date) || 0;
    const gain = diff - net;
    cumulativeGain += gain;
    sumPercent += gain / Math.max(balances[i - 1].value, 1);
  }
  const avgDailyPercent = sumPercent / Math.max(balances.length - 1, 1);
  const cumulativePercent = cumulativeGain / Math.max(balances[0].value, 1);

  return { dailyGain, dailyPercent, avgDailyPercent, cumulativeGain, cumulativePercent };
}

function buildDailyGainSeries(balances, portfolioId) {
  const netMap = buildNetAporteMap(portfolioId);
  const series = balances.map((balance, index) => {
    if (index === 0) {
      return { date: balance.date, value: 0 };
    }
    const prev = balances[index - 1];
    const aporteDia = netMap.get(balance.date) || 0;
    const gain = balance.value - prev.value - aporteDia;
    return { date: balance.date, value: gain };
  });
  return series;
}

function buildCumulativeGainSeries(balances, portfolioId) {
  const daily = buildDailyGainSeries(balances, portfolioId);
  let running = 0;
  return daily.map((item) => {
    running += item.value;
    return { date: item.date, value: running };
  });
}

function buildGlobalDailyGainSeries(balances) {
  const netMap = buildGlobalNetAporteMap();
  return balances.map((balance, index) => {
    if (index === 0) {
      return { date: balance.date, value: 0 };
    }
    const prev = balances[index - 1];
    const net = netMap.get(balance.date) || 0;
    const gain = balance.value - prev.value - net;
    return { date: balance.date, value: gain };
  });
}

function buildGlobalCumulativeGainSeries(balances) {
  const daily = buildGlobalDailyGainSeries(balances);
  let running = 0;
  return daily.map((item) => {
    running += item.value;
    return { date: item.date, value: running };
  });
}

function formatMonthLabel(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-CL", { month: "long", year: "numeric" });
}

function buildMonthlyGains() {
  const balances = buildGlobalBalances();
  if (balances.length < 2) return [];
  const netMap = buildGlobalNetAporteMap();
  const monthly = new Map();
  for (let i = 1; i < balances.length; i += 1) {
    const current = balances[i];
    const prev = balances[i - 1];
    const net = netMap.get(current.date) || 0;
    const gain = current.value - prev.value - net;
    const monthKey = current.date.slice(0, 7);
    const existing = monthly.get(monthKey) || { month: monthKey, value: 0, label: formatMonthLabel(current.date) };
    existing.value += gain;
    monthly.set(monthKey, existing);
  }
  return Array.from(monthly.values()).sort((a, b) => b.month.localeCompare(a.month));
}

const WIDGET_DEFS = {
  last30Gain: {
    title: "Ultimos 30 dias",
    build: (balances, portfolioId) => {
      if (balances.length < 2) {
        return { value: "-", note: "No hay suficientes balances.", tone: "neutral" };
      }
      const latestDate = new Date(balances[balances.length - 1].date);
      const from = new Date(latestDate);
      from.setDate(latestDate.getDate() - 30);
      const windowBalances = balances.filter((item) => new Date(item.date) >= from);
      if (windowBalances.length < 2) {
        return { value: "-", note: "No hay suficientes registros en 30 dias.", tone: "neutral" };
      }
      const dailySeries = buildDailyGainSeries(windowBalances, portfolioId);
      const sum = dailySeries.reduce((acc, item) => acc + item.value, 0);
      const note =
        windowBalances.length < 30 ? `Solo ${windowBalances.length} registros en el rango.` : null;
      const tone = sum > 0 ? "positive" : sum < 0 ? "negative" : "neutral";
      return { value: formatCurrency(sum), note, tone };
    }
  },
  avgDailyValue: {
    title: "Promedio diario numerico",
    build: (balances, portfolioId) => {
      if (balances.length < 2) {
        return { value: "-", note: "No hay suficientes balances.", tone: "neutral" };
      }
      const dailySeries = buildDailyGainSeries(balances, portfolioId);
      const sum = dailySeries.reduce((acc, item) => acc + item.value, 0);
      const avg = sum / Math.max(dailySeries.length - 1, 1);
      const tone = avg > 0 ? "positive" : avg < 0 ? "negative" : "neutral";
      return { value: formatCurrency(avg), note: null, tone };
    }
  },
  bestDay: {
    title: "Mejor dia",
    build: (balances, portfolioId) => {
      if (balances.length < 2) {
        return { value: "-", note: "No hay suficientes balances.", tone: "neutral" };
      }
      const dailySeries = buildDailyGainSeries(balances, portfolioId).slice(1);
      if (!dailySeries.length) return { value: "-", note: "No hay suficientes balances.", tone: "neutral" };
      const best = dailySeries.reduce((acc, item) => (item.value > acc.value ? item : acc), dailySeries[0]);
      const tone = best.value > 0 ? "positive" : best.value < 0 ? "negative" : "neutral";
      return { value: formatCurrency(best.value), note: `Fecha: ${best.date}`, tone };
    }
  },
  worstDay: {
    title: "Peor dia",
    build: (balances, portfolioId) => {
      if (balances.length < 2) {
        return { value: "-", note: "No hay suficientes balances.", tone: "neutral" };
      }
      const dailySeries = buildDailyGainSeries(balances, portfolioId).slice(1);
      if (!dailySeries.length) return { value: "-", note: "No hay suficientes balances.", tone: "neutral" };
      const worst = dailySeries.reduce((acc, item) => (item.value < acc.value ? item : acc), dailySeries[0]);
      const tone = worst.value > 0 ? "positive" : worst.value < 0 ? "negative" : "neutral";
      return { value: formatCurrency(worst.value), note: `Fecha: ${worst.date}`, tone };
    }
  },
  streakCurrent: {
    title: "Racha actual",
    build: (balances, portfolioId) => {
      if (balances.length < 2) {
        return { value: "-", note: "No hay suficientes balances.", tone: "neutral" };
      }
      const dailySeries = buildDailyGainSeries(balances, portfolioId).slice(1);
      if (!dailySeries.length) return { value: "-", note: "No hay suficientes balances.", tone: "neutral" };
      const last = dailySeries[dailySeries.length - 1];
      if (last.value === 0) {
        return { value: "0 dias", note: "Ultimo dia en cero.", tone: "neutral" };
      }
      const direction = last.value > 0 ? 1 : -1;
      let streak = 0;
      for (let i = dailySeries.length - 1; i >= 0; i -= 1) {
        if ((dailySeries[i].value > 0 && direction > 0) || (dailySeries[i].value < 0 && direction < 0)) {
          streak += 1;
        } else {
          break;
        }
      }
      const label = direction > 0 ? "positivo" : "negativo";
      const tone = direction > 0 ? "positive" : "negative";
      return { value: `${streak} dias`, note: `Racha actual en ${label}.`, tone };
    }
  },
  maxStreakPositive: {
    title: "Maxima racha historica",
    build: (balances, portfolioId) => {
      if (balances.length < 2) {
        return { value: "-", note: "No hay suficientes balances.", tone: "neutral" };
      }
      const dailySeries = buildDailyGainSeries(balances, portfolioId).slice(1);
      if (!dailySeries.length) return { value: "-", note: "No hay suficientes balances.", tone: "neutral" };
      let maxStreak = 0;
      let current = 0;
      dailySeries.forEach((item) => {
        if (item.value > 0) {
          current += 1;
          if (current > maxStreak) maxStreak = current;
        } else {
          current = 0;
        }
      });
      const note = maxStreak ? "Maxima racha en verde." : "Sin rachas positivas.";
      const tone = maxStreak > 0 ? "positive" : "neutral";
      return { value: `${maxStreak} dias`, note, tone };
    }
  }
};

function getAnnualizedReturnFromAvgDaily(avgDailyPercent) {
  if (avgDailyPercent === null || Number.isNaN(avgDailyPercent)) return null;
  return Math.pow(1 + avgDailyPercent, 365) - 1;
}

const KPI_TOOLTIPS = {
  "Capital neto aportado": "Suma de aportes menos retiros.",
  "Aportes netos": "Aportes menos retiros de la cartera.",
  "Valor actual": "Ultimo balance registrado o aportes + flujo neto.",
  "Ganancia / Perdida": "Valor actual menos aportes netos.",
  "Ganancias totales": "Valor actual menos aportes netos.",
  "Rent. anualizada": "Promedio diario anualizado.",
  "Ultima ganancia": "Ultimo cambio diario ajustado por aportes.",
  "Promedio diario": "Promedio de ganancias diarias (%)."
};

function createKpi(label, value, delta, tooltip) {
  const card = document.createElement("div");
  card.className = "kpi";
  const trendClass = delta >= 0 ? "positive" : "negative";
  const tip = tooltip || KPI_TOOLTIPS[label];
  card.innerHTML = `
    <span class="kpi__label">
      ${label}
      ${tip ? `<span class="kpi__info" data-tooltip="${tip}">i</span>` : ""}
    </span>
    <strong class="sensitive">${value}</strong>
    ${delta !== null ? `<div class="${trendClass} sensitive">${formatPercent(delta)}</div>` : ""}
  `;
  return card;
}

function updateSortIndicators(headerEl, sortConfig) {
  if (!headerEl) return;
  headerEl.querySelectorAll("th.sortable").forEach((th) => {
    th.classList.remove("sort-active", "asc");
  });
  const active = headerEl.querySelector(`th[data-sort="${sortConfig.key}"]`);
  if (!active) return;
  active.classList.add("sort-active");
  if (sortConfig.direction === "asc") active.classList.add("asc");
}

function getDefaultSortDirection(key) {
  return ["date", "amount", "value", "dailyGain", "dailyPercent"].includes(key) ? "desc" : "asc";
}

function showUndoToast(message, onUndo) {
  if (!elements.toast) return;
  if (toastTimeout) clearTimeout(toastTimeout);
  toastUndoAction = onUndo || null;
  elements.toastMessage.textContent = message;
  elements.toastUndoBtn.style.display = onUndo ? "inline-flex" : "none";
  elements.toast.classList.add("show");
  toastTimeout = setTimeout(() => {
    hideToast();
  }, 5000);
}

function hideToast() {
  if (!elements.toast) return;
  elements.toast.classList.remove("show");
  toastUndoAction = null;
  if (toastTimeout) {
    clearTimeout(toastTimeout);
    toastTimeout = null;
  }
}


function renderSidebar() {
  elements.portfolioList.innerHTML = "";
  if (!state.portfolios.length) {
    const empty = document.createElement("div");
    empty.className = "nav__empty";
    empty.textContent = "No hay carteras todavía";
    elements.portfolioList.appendChild(empty);
  }
  state.portfolios.forEach((portfolio, index) => {
    const btn = document.createElement("button");
    btn.className = "nav__item";
    btn.dataset.id = portfolio.id;
    btn.innerHTML = `<span class="color-dot" style="background:${getPortfolioColor(portfolio, index)}"></span>${portfolio.name}`;
    btn.addEventListener("click", () => openPortfolio(portfolio.id));
    elements.portfolioList.appendChild(btn);
  });
  setActiveNav(currentView);
}

function renderDashboard() {
  elements.dashboardKpis.innerHTML = "";
  const totals = state.portfolios.reduce(
    (acc, portfolio) => {
      const transactions = getPortfolioTransactions(portfolio.id);
      const aportesNetos = getAportesNetos(transactions);
      const valorActual = getValorActual(portfolio, transactions);
      const pnl = getPnL(valorActual, aportesNetos);
      acc.aportesNetos += convertToClp(aportesNetos, portfolio);
      acc.valorActual += convertToClp(valorActual, portfolio);
      acc.pnl += convertToClp(pnl, portfolio);
      return acc;
    },
    { aportesNetos: 0, valorActual: 0, pnl: 0 }
  );
  const pnlPercent = getPnLPercent(totals.pnl, totals.aportesNetos);

  elements.dashboardKpis.appendChild(
    createKpi("Capital neto aportado", formatCurrency(totals.aportesNetos), null)
  );
  elements.dashboardKpis.appendChild(createKpi("Valor actual", formatCurrency(totals.valorActual), null));
  elements.dashboardKpis.appendChild(createKpi("Ganancia / Perdida", formatCurrency(totals.pnl), pnlPercent));

  elements.summaryTable.innerHTML = "";
  if (!state.portfolios.length) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td class="table-empty" colspan="5">Agrega una cartera para ver el resumen.</td>`;
    elements.summaryTable.appendChild(tr);
  }
  state.portfolios.forEach((portfolio, index) => {
    const transactions = getPortfolioTransactions(portfolio.id);
    const aportesNetos = getAportesNetos(transactions);
    const valorActual = getValorActual(portfolio, transactions);
    const pnl = getPnL(valorActual, aportesNetos);
    const aportesNetosClp = convertToClp(aportesNetos, portfolio);
    const valorActualClp = convertToClp(valorActual, portfolio);
    const pnlClp = convertToClp(pnl, portfolio);
    const pnlPercentLocal = getPnLPercent(pnl, aportesNetos);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><span class="color-dot" style="background:${getPortfolioColor(portfolio, index)}"></span> ${portfolio.name}</td>
      <td class="sensitive">${formatCurrency(aportesNetosClp)}</td>
      <td class="sensitive">${formatCurrency(valorActualClp)}</td>
      <td><span class="${pnlClp >= 0 ? "positive" : "negative"} sensitive">${formatCurrency(pnlClp)} (${formatPercent(pnlPercentLocal)})</span></td>
      <td>${getLastBalanceDate(portfolio.id)}</td>
    `;
    elements.summaryTable.appendChild(tr);
  });

  renderCharts();
  renderMonthlyGains();
}

function renderCharts() {
  const balances = buildGlobalBalances();
  const series = dashboardChartMode === "cumulative"
    ? buildGlobalCumulativeGainSeries(balances)
    : dashboardChartMode === "gain"
    ? buildGlobalDailyGainSeries(balances)
    : balances;
  const labels = series.map((item) => item.date);
  const data = series.map((item) => item.value);
  const chartColor = state.theme.chart || state.theme.positive;
  const chartFill = `rgba(${hexToRgb(chartColor)}, 0.2)`;

  if (lineChart) lineChart.destroy();
  lineChart = new Chart(elements.lineChart, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: dashboardChartMode === "cumulative"
            ? "Ganancia acumulada"
            : dashboardChartMode === "gain"
            ? "Ganancia diaria"
            : "Balance total",
          data,
          borderColor: chartColor,
          backgroundColor: chartFill,
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          ticks: {
            callback: (value) => formatCurrency(value)
          }
        }
      }
    }
  });

  const distribution = buildDistribution();
  if (doughnutChart) doughnutChart.destroy();
  doughnutChart = new Chart(elements.doughnutChart, {
    type: "doughnut",
    data: {
      labels: distribution.map((item) => item.name),
      datasets: [
        {
          data: distribution.map((item) => item.value),
          backgroundColor: distribution.map((item) => item.color)
        }
      ]
    },
    options: { responsive: true, plugins: { legend: { position: "bottom" } } }
  });
}

function renderMonthlyGains() {
  if (!elements.monthlyTable) return;
  elements.monthlyTable.innerHTML = "";
  const rows = buildMonthlyGains();
  if (!rows.length) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td class="table-empty" colspan="2">No hay suficientes datos.</td>`;
    elements.monthlyTable.appendChild(tr);
    return;
  }
  rows.forEach((row) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.label}</td>
      <td><span class="${row.value >= 0 ? "positive" : "negative"}">${formatCurrency(row.value)}</span></td>
    `;
    elements.monthlyTable.appendChild(tr);
  });
}

function renderPortfolioChart(balances, portfolioId) {
  const series = chartMode === "cumulative"
    ? buildCumulativeGainSeries(balances, portfolioId)
    : chartMode === "gain"
    ? buildDailyGainSeries(balances, portfolioId)
    : balances.map((item) => ({ date: item.date, value: item.value }));

  const labels = series.map((item) => item.date);
  const data = series.map((item) => item.value);
  const chartColor = state.theme.chart || state.theme.positive;
  const chartFill = `rgba(${hexToRgb(chartColor)}, 0.2)`;
  const label =
    chartMode === "cumulative"
      ? "Ganancia acumulada"
      : chartMode === "gain"
      ? "Ganancia diaria"
      : "Balance total";

  if (portfolioLineChart) portfolioLineChart.destroy();
  const portfolio = state.portfolios.find((item) => item.id === portfolioId);
  const currency = portfolio ? getPortfolioCurrency(portfolio) : "CLP";
  portfolioLineChart = new Chart(elements.portfolioLineChart, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label,
          data,
          borderColor: chartColor,
          backgroundColor: chartFill,
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          ticks: {
            callback: (value) => formatMoney(value, currency)
          }
        }
      }
    }
  });
}

function renderPortfolioBalancesTable(balances, portfolioId, currency) {
  const netMap = buildNetAporteMap(portfolioId);
  elements.balancesTable.innerHTML = "";
  const total = balances.length;
  const totalPages = Math.max(1, Math.ceil(total / BALANCES_PER_PAGE));
  if (balancesPage > totalPages) balancesPage = totalPages;
  if (balancesPage < 1) balancesPage = 1;

  if (!total) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td class="table-empty" colspan="5">No hay balances registrados.</td>`;
    elements.balancesTable.appendChild(tr);
    elements.balancesInfo.textContent = "No hay registros";
    elements.balancesPrev.disabled = true;
    elements.balancesNext.disabled = true;
    return;
  }

  const rows = balances.map((balance, index) => {
    const prev = index <= 0 ? null : balances[index - 1];
    const aporteDia = netMap.get(balance.date) || 0;
    const dailyGain = prev ? balance.value - prev.value - aporteDia : null;
    const dailyPercent = prev ? dailyGain / Math.max(prev.value, 1) : null;
    return {
      balance,
      dateValue: new Date(balance.date).getTime(),
      value: balance.value,
      dailyGain,
      dailyPercent
    };
  });

  const sorted = [...rows].sort((a, b) => {
    const key = balancesSort.key;
    const dir = balancesSort.direction === "asc" ? 1 : -1;
    const aVal = key === "date" ? a.dateValue : a[key];
    const bVal = key === "date" ? b.dateValue : b[key];
    if (aVal === bVal) return 0;
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;
    return aVal > bVal ? dir : -dir;
  });

  updateSortIndicators(elements.balancesTableHeader, balancesSort);

  const start = (balancesPage - 1) * BALANCES_PER_PAGE;
  const pageItems = sorted.slice(start, start + BALANCES_PER_PAGE);

  pageItems.forEach((row) => {
    const { balance, dailyGain, dailyPercent } = row;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${balance.date}</td>
      <td class="sensitive">${formatMoney(balance.value, currency)}</td>
      <td><span class="badge ${dailyGain === null ? "badge--neutral" : dailyGain >= 0 ? "badge--positive" : "badge--negative"} sensitive">${dailyGain === null ? "-" : formatMoney(dailyGain, currency)}</span></td>
      <td><span class="badge ${dailyGain === null ? "badge--neutral" : dailyGain >= 0 ? "badge--positive" : "badge--negative"} sensitive">${dailyPercent === null ? "-" : formatPercent(dailyPercent)}</span></td>
      <td>
        <button class="btn btn--icon btn--ghost" data-action="edit-balance" data-id="${balance.id}" aria-label="Editar balance">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z"></path>
          </svg>
        </button>
        <button class="btn btn--icon btn--danger" data-action="delete-balance" data-id="${balance.id}" aria-label="Eliminar balance">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 3h6l1 2h4v2H4V5h4l1-2Zm-2 6h10l-.7 11H7.7L7 9Z"></path>
            <path d="M9 11h2v7H9v-7Zm4 0h2v7h-2v-7Z"></path>
          </svg>
        </button>
      </td>
    `;
    elements.balancesTable.appendChild(tr);
  });

  elements.balancesInfo.textContent = `Se estan mostrando ${pageItems.length}/${total} registros`;
  elements.balancesPrev.disabled = balancesPage <= 1;
  elements.balancesNext.disabled = balancesPage >= totalPages;
}

function renderPortfolio() {
  const portfolio = state.portfolios.find((p) => p.id === currentPortfolioId);
  if (!portfolio) return;
  const currency = getPortfolioCurrency(portfolio);

  elements.portfolioName.textContent = portfolio.name;

  const transactions = getPortfolioTransactions(portfolio.id);
  const aportesNetos = getAportesNetos(transactions);
  const valorActual = getValorActual(portfolio, transactions);
  const pnl = getPnL(valorActual, aportesNetos);
  const pnlPercent = getPnLPercent(pnl, aportesNetos);

  const balancesAll = getBalances(portfolio.id);
  const balancesFiltered = filterByRange(balancesAll, "date");
  const stats = getDailyStats(balancesAll, portfolio.id);
  const annualized = getAnnualizedReturnFromAvgDaily(stats.avgDailyPercent);

  elements.portfolioKpis.innerHTML = "";
  elements.portfolioKpis.appendChild(createKpi("Aportes netos", formatMoney(aportesNetos, currency), null));
  elements.portfolioKpis.appendChild(createKpi("Valor actual", formatMoney(valorActual, currency), null));
  elements.portfolioKpis.appendChild(createKpi("Ganancias totales", formatMoney(pnl, currency), pnlPercent));
  elements.portfolioKpis.appendChild(
    createKpi("Rent. anualizada", annualized === null ? "-" : formatPercent(annualized), null)
  );
  elements.portfolioKpis.appendChild(
    createKpi("Ultima ganancia", formatMoney(stats.dailyGain, currency), balancesAll.length ? stats.dailyPercent : null)
  );
  elements.portfolioKpis.appendChild(
    createKpi("Promedio diario", formatPercent(stats.avgDailyPercent), stats.avgDailyPercent)
  );

  renderPortfolioChart(balancesFiltered, portfolio.id);
  renderPortfolioBalancesTable(balancesFiltered, portfolio.id, currency);
  renderCustomWidgets(balancesAll, portfolio.id);

  const filteredTransactions = filterByRange(transactions, "date").filter((tx) => {
    const query = elements.searchInput.value.toLowerCase();
    const typeFilter = elements.typeFilter.value;
    const minRaw = elements.amountMin.value;
    const maxRaw = elements.amountMax.value;
    const min = minRaw === "" ? null : Number(minRaw);
    const max = maxRaw === "" ? null : Number(maxRaw);

    if (typeFilter !== "all" && tx.type !== typeFilter) return false;
    if (min !== null && tx.amount < min) return false;
    if (max !== null && tx.amount > max) return false;

    if (!query) return true;
    const haystack = `${tx.note || ""} ${tx.type} ${tx.date} ${tx.amount}`.toLowerCase();
    return haystack.includes(query);
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    const key = transactionsSort.key;
    const dir = transactionsSort.direction === "asc" ? 1 : -1;
    let aVal;
    let bVal;
    if (key === "date") {
      aVal = new Date(a.date).getTime();
      bVal = new Date(b.date).getTime();
    } else if (key === "note") {
      aVal = (a.note || "").toLowerCase();
      bVal = (b.note || "").toLowerCase();
    } else if (key === "type") {
      aVal = a.type;
      bVal = b.type;
    } else {
      aVal = a[key];
      bVal = b[key];
    }
    if (aVal === bVal) return 0;
    return aVal > bVal ? dir : -dir;
  });

  updateSortIndicators(elements.transactionsTableHeader, transactionsSort);

  elements.transactionsTable.innerHTML = "";
  if (!sortedTransactions.length) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td class="table-empty" colspan="5">No hay movimientos para mostrar.</td>`;
    elements.transactionsTable.appendChild(tr);
    return;
  }
  sortedTransactions.forEach((tx) => {
    const typeClass = `badge--${tx.type}`;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${tx.date}</td>
      <td><span class="badge ${typeClass}">${tx.type}</span></td>
      <td class="sensitive">${formatMoney(tx.amount, currency)}</td>
      <td>${tx.note || "-"}</td>
      <td>
        <button class="btn btn--icon btn--ghost" data-action="edit" data-id="${tx.id}" aria-label="Editar movimiento">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z"></path>
          </svg>
        </button>
        <button class="btn btn--icon btn--danger" data-action="delete" data-id="${tx.id}" aria-label="Eliminar movimiento">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 3h6l1 2h4v2H4V5h4l1-2Zm-2 6h10l-.7 11H7.7L7 9Z"></path>
            <path d="M9 11h2v7H9v-7Zm4 0h2v7h-2v-7Z"></path>
          </svg>
        </button>
      </td>
    `;
    elements.transactionsTable.appendChild(tr);
  });
}

function switchView(view) {
  currentView = view;
  elements.dashboardView.classList.toggle("active", view === "dashboard");
  elements.portfolioView.classList.toggle("active", view === "portfolio");
  elements.viewTitle.textContent = view === "dashboard" ? "Dashboard" : "Cartera";
  elements.viewSubtitle.textContent = view === "dashboard" ? "Resumen global" : "Detalle";
  setActiveNav(view);
}

function renderCustomWidgets(balances, portfolioId) {
  elements.customWidgets.innerHTML = "";
  if (!state.customWidgets || !state.customWidgets.length) {
    const empty = document.createElement("div");
    empty.className = "table-empty";
    empty.textContent = "No hay widgets personalizados.";
    elements.customWidgets.appendChild(empty);
    return;
  }

  state.customWidgets.forEach((widgetId) => {
    const def = WIDGET_DEFS[widgetId];
    if (!def) return;
    const result = def.build(balances, portfolioId);
    const card = document.createElement("div");
    const toneClass = result.tone ? `widget--${result.tone}` : "widget--neutral";
    card.className = `widget ${toneClass}`;
    card.innerHTML = `
      <div class="widget__header">
        <h5 class="widget__title">${def.title}</h5>
        <button class="btn btn--icon btn--ghost" data-action="remove-widget" data-id="${widgetId}" aria-label="Eliminar widget">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 7l2-2 5 5 5-5 2 2-5 5 5 5-2 2-5-5-5 5-2-2 5-5-5-5Z"></path>
          </svg>
        </button>
      </div>
      <div class="widget__value sensitive">${result.value}</div>
      ${result.note ? `<div class="widget__note">${result.note}</div>` : ""}
    `;
    elements.customWidgets.appendChild(card);
  });
}

function setActiveNav(view) {
  document.querySelectorAll(".nav__item").forEach((item) => item.classList.remove("active"));
  if (view === "dashboard") {
    elements.dashboardNav.classList.add("active");
    return;
  }
  if (view === "portfolio" && currentPortfolioId) {
    const activeBtn = elements.portfolioList.querySelector(`[data-id="${currentPortfolioId}"]`);
    if (activeBtn) activeBtn.classList.add("active");
  }
}

function openPortfolio(id) {
  currentPortfolioId = id;
  balancesPage = 1;
  switchView("portfolio");
  renderPortfolio();
}

function resetModal() {
  elements.transactionId.value = "";
  elements.movementForm.reset();
  elements.dateInput.value = new Date().toISOString().slice(0, 10);
}

function openModal(transaction = null) {
  resetModal();
  elements.modalTitle.textContent = transaction ? "Editar movimiento" : "Agregar movimiento";
  if (transaction) {
    elements.transactionId.value = transaction.id;
    elements.dateInput.value = transaction.date;
    elements.typeInput.value = transaction.type;
    elements.amountInput.value = transaction.amount;
    elements.noteInput.value = transaction.note || "";
  }
  elements.movementModal.classList.add("open");
}

function closeModal() {
  elements.movementModal.classList.remove("open");
}

function resetBalanceModal() {
  elements.balanceId.value = "";
  elements.balanceForm.reset();
  elements.balanceDateInput.value = new Date().toISOString().slice(0, 10);
}

function openBalanceModal(balance = null) {
  resetBalanceModal();
  elements.balanceModalTitle.textContent = balance ? "Editar balance diario" : "Agregar balance diario";
  if (balance) {
    elements.balanceId.value = balance.id;
    elements.balanceDateInput.value = balance.date;
    elements.balanceValueInput.value = balance.value;
  }
  elements.balanceModal.classList.add("open");
}

function closeBalanceModal() {
  elements.balanceModal.classList.remove("open");
}

function openPortfolioModal() {
  editingPortfolioId = null;
  elements.portfolioModalTitle.textContent = "Nueva cartera";
  elements.portfolioSubmitBtn.textContent = "Crear";
  elements.portfolioNameInput.value = "";
  elements.portfolioCurrencyInput.value = DEFAULT_CURRENCY;
  elements.portfolioUsdRateInput.value = DEFAULT_USD_RATE.toFixed(2);
  elements.portfolioUsdRateField.classList.toggle("show", DEFAULT_CURRENCY === "USD");
  elements.portfolioUsdRateInput.required = DEFAULT_CURRENCY === "USD";
  elements.portfolioColorInput.value = DEFAULT_COLORS[state.portfolios.length % DEFAULT_COLORS.length];
  elements.portfolioModal.classList.add("open");
}

function openRenamePortfolioModal() {
  if (!currentPortfolioId) {
    alert("Selecciona una cartera primero.");
    return;
  }
  const portfolio = state.portfolios.find((item) => item.id === currentPortfolioId);
  if (!portfolio) return;
  editingPortfolioId = currentPortfolioId;
  elements.portfolioModalTitle.textContent = "Editar cartera";
  elements.portfolioSubmitBtn.textContent = "Guardar";
  elements.portfolioNameInput.value = portfolio.name;
  elements.portfolioCurrencyInput.value = getPortfolioCurrency(portfolio);
  elements.portfolioUsdRateInput.value = getPortfolioUsdRate(portfolio).toFixed(2);
  const isUsd = getPortfolioCurrency(portfolio) === "USD";
  elements.portfolioUsdRateField.classList.toggle("show", isUsd);
  elements.portfolioUsdRateInput.required = isUsd;
  elements.portfolioColorInput.value = portfolio.color || DEFAULT_COLORS[0];
  elements.portfolioModal.classList.add("open");
}

function closePortfolioModal() {
  elements.portfolioModal.classList.remove("open");
  editingPortfolioId = null;
}

function handleSaveMovement(event) {
  event.preventDefault();
  const payload = {
    id: elements.transactionId.value || `t${crypto.randomUUID()}`,
    portfolioId: currentPortfolioId,
    date: elements.dateInput.value,
    type: elements.typeInput.value,
    amount: Number(elements.amountInput.value),
    note: elements.noteInput.value
  };

  if (!payload.portfolioId) return;

  const index = state.transactions.findIndex((tx) => tx.id === payload.id);
  if (index >= 0) {
    state.transactions[index] = payload;
  } else {
    state.transactions.push(payload);
  }

  saveState();
  closeModal();
  renderDashboard();
  renderPortfolio();
}

function handleSaveBalance(event) {
  event.preventDefault();
  const payload = {
    id: elements.balanceId.value || `b${crypto.randomUUID()}`,
    portfolioId: currentPortfolioId,
    date: elements.balanceDateInput.value,
    value: Number(elements.balanceValueInput.value)
  };

  if (!payload.portfolioId) return;

  const index = state.balances.findIndex((balance) => balance.id === payload.id);
  if (index >= 0) {
    state.balances[index] = payload;
  } else {
    state.balances.push(payload);
  }

  saveState();
  closeBalanceModal();
  renderPortfolio();
}

function handleTransactionAction(event) {
  const button = event.target.closest("button");
  if (!button) return;
  const id = button.dataset.id;
  const action = button.dataset.action;
  if (!id) return;

  if (action === "edit" || action === "delete") {
    const transaction = state.transactions.find((tx) => tx.id === id);
    if (action === "edit" && transaction) {
      openModal(transaction);
    }
    if (action === "delete") {
      const confirmed = confirm("Eliminar este movimiento?");
      if (!confirmed) return;
      const index = state.transactions.findIndex((tx) => tx.id === id);
      if (index < 0) return;
      const removed = state.transactions.splice(index, 1)[0];
      saveState();
      renderDashboard();
      renderPortfolio();
      showUndoToast("Movimiento eliminado.", () => {
        state.transactions.splice(index, 0, removed);
        saveState();
        renderDashboard();
        renderPortfolio();
      });
    }
  }

  if (action === "edit-balance" || action === "delete-balance") {
    const balance = state.balances.find((item) => item.id === id);
    if (action === "edit-balance" && balance) {
      openBalanceModal(balance);
    }
    if (action === "delete-balance") {
      const confirmed = confirm("Eliminar este balance?");
      if (!confirmed) return;
      const index = state.balances.findIndex((item) => item.id === id);
      if (index < 0) return;
      const removed = state.balances.splice(index, 1)[0];
      saveState();
      renderPortfolio();
      showUndoToast("Balance eliminado.", () => {
        state.balances.splice(index, 0, removed);
        saveState();
        renderPortfolio();
      });
    }
  }
}

function handleRangeFilter(event) {
  if (!event.target.dataset.range) return;
  rangeFilter = event.target.dataset.range;
  elements.rangeFilters.querySelectorAll("button").forEach((btn) => btn.classList.remove("active"));
  event.target.classList.add("active");
  balancesPage = 1;
  renderPortfolio();
}

function handleChartMode(event) {
  if (!event.target.dataset.mode) return;
  chartMode = event.target.dataset.mode;
  elements.chartMode.querySelectorAll("button").forEach((btn) => btn.classList.remove("active"));
  event.target.classList.add("active");
  renderPortfolio();
}

function handleDashboardChartMode(event) {
  if (!event.target.dataset.mode) return;
  dashboardChartMode = event.target.dataset.mode;
  elements.dashboardChartMode.querySelectorAll("button").forEach((btn) => btn.classList.remove("active"));
  event.target.classList.add("active");
  renderCharts();
}

function handleSearch() {
  renderPortfolio();
}

function handleBalancesSort(event) {
  const th = event.target.closest("th[data-sort]");
  if (!th) return;
  const key = th.dataset.sort;
  const direction =
    balancesSort.key === key ? (balancesSort.direction === "asc" ? "desc" : "asc") : getDefaultSortDirection(key);
  balancesSort = { key, direction };
  balancesPage = 1;
  renderPortfolio();
}

function handleTransactionsSort(event) {
  const th = event.target.closest("th[data-sort]");
  if (!th) return;
  const key = th.dataset.sort;
  const direction =
    transactionsSort.key === key
      ? (transactionsSort.direction === "asc" ? "desc" : "asc")
      : getDefaultSortDirection(key);
  transactionsSort = { key, direction };
  renderPortfolio();
}

function handleThemeChange() {
  state.theme = {
    positive: elements.positiveColorInput.value || DEFAULT_THEME.positive,
    negative: elements.negativeColorInput.value || DEFAULT_THEME.negative,
    chart: elements.chartColorInput.value || DEFAULT_THEME.chart
  };
  applyTheme(state.theme);
  saveState();
  renderDashboard();
  if (currentPortfolioId) renderPortfolio();
}

function handlePresentationToggle() {
  state.presentationMode = elements.presentationToggle.checked;
  applyPresentationMode(state.presentationMode);
  saveState();
}

function handleBalancesPagination(direction) {
  balancesPage += direction;
  renderPortfolio();
}

function handleDashboardClick(event) {
  if (!event.target.closest("[data-view='dashboard']")) return;
  switchView("dashboard");
  renderDashboard();
}

function openWidgetModal() {
  if (!currentPortfolioId) {
    alert("Selecciona una cartera primero.");
    return;
  }
  elements.widgetModal.classList.add("open");
}

function closeWidgetModal() {
  elements.widgetModal.classList.remove("open");
  elements.widgetForm.reset();
}

function handleAddWidget(event) {
  event.preventDefault();
  const selected = elements.widgetType.value;
  if (!WIDGET_DEFS[selected]) return;
  if (!state.customWidgets.includes(selected)) {
    state.customWidgets.push(selected);
    saveState();
  }
  closeWidgetModal();
  renderPortfolio();
}

function handleRemoveWidget(event) {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.action !== "remove-widget") return;
  const id = button.dataset.id;
  state.customWidgets = state.customWidgets.filter((item) => item !== id);
  saveState();
  renderPortfolio();
}

function handleNewPortfolio(event) {
  event.preventDefault();
  const name = elements.portfolioNameInput.value.trim();
  if (!name) return;
  const color = elements.portfolioColorInput.value || DEFAULT_COLORS[0];
  const currency = elements.portfolioCurrencyInput.value || DEFAULT_CURRENCY;
  const usdRateRaw = Number(elements.portfolioUsdRateInput.value);
  const usdRate = Number.isFinite(usdRateRaw) && usdRateRaw > 0 ? usdRateRaw : DEFAULT_USD_RATE;
  if (editingPortfolioId) {
    const portfolio = state.portfolios.find((item) => item.id === editingPortfolioId);
    if (portfolio) {
      portfolio.name = name;
      portfolio.color = color;
      portfolio.currency = currency;
      portfolio.usdRate = usdRate;
    }
  } else {
    const newPortfolio = {
      id: `p${crypto.randomUUID()}`,
      name,
      color,
      currency,
      usdRate
    };
    state.portfolios.push(newPortfolio);
  }
  saveState();
  closePortfolioModal();
  editingPortfolioId = null;
  renderSidebar();
  renderDashboard();
  if (currentPortfolioId) renderPortfolio();
}

function handleDeletePortfolio() {
  if (!currentPortfolioId) {
    alert("Selecciona una cartera primero.");
    return;
  }
  const portfolio = state.portfolios.find((item) => item.id === currentPortfolioId);
  if (!portfolio) return;
  const confirmed = confirm(`Eliminar cartera \"${portfolio.name}\" y sus registros?`);
  if (!confirmed) return;
  state.portfolios = state.portfolios.filter((item) => item.id !== currentPortfolioId);
  state.transactions = state.transactions.filter((tx) => tx.portfolioId !== currentPortfolioId);
  state.balances = state.balances.filter((balance) => balance.portfolioId !== currentPortfolioId);
  currentPortfolioId = null;
  saveState();
  renderSidebar();
  renderDashboard();
  switchView("dashboard");
}

function handleExport() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "aurum-data.json";
  link.click();
  URL.revokeObjectURL(url);
}

function handleImport(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (parsed.portfolios && parsed.transactions) {
        if (!parsed.balances) parsed.balances = [];
        if (!parsed.customWidgets) parsed.customWidgets = [];
        if (!parsed.theme) parsed.theme = { ...DEFAULT_THEME };
        if (parsed.presentationMode === undefined) parsed.presentationMode = DEFAULT_PRIVACY.presentationMode;
        parsed.portfolios = parsed.portfolios.map((portfolio, index) => ({
          ...portfolio,
          color: portfolio.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
          currency: portfolio.currency || DEFAULT_CURRENCY,
          usdRate: portfolio.usdRate || DEFAULT_USD_RATE
        }));
        state = parsed;
        applyTheme(state.theme);
        syncThemeInputs();
        applyPresentationMode(state.presentationMode);
        syncPresentationToggle();
        saveState();
        renderSidebar();
        renderDashboard();
        if (currentPortfolioId) renderPortfolio();
      }
    } catch {
      alert("JSON invalido");
    }
  };
  reader.readAsText(file);
}

function handleReset() {
  const confirmed = confirm("Seguro que quieres resetear los datos?");
  if (!confirmed) return;
  const prevState = JSON.parse(JSON.stringify(state));
  state = JSON.parse(JSON.stringify(demoData));
  state.customWidgets = [];
  state.theme = { ...DEFAULT_THEME };
  state.presentationMode = DEFAULT_PRIVACY.presentationMode;
  applyTheme(state.theme);
  syncThemeInputs();
  applyPresentationMode(state.presentationMode);
  syncPresentationToggle();
  saveState();
  renderSidebar();
  renderDashboard();
  switchView("dashboard");
  showUndoToast("Datos reseteados.", () => {
    state = JSON.parse(JSON.stringify(prevState));
    applyTheme(state.theme || DEFAULT_THEME);
    applyPresentationMode(state.presentationMode);
    syncThemeInputs();
    syncPresentationToggle();
    saveState();
    renderSidebar();
    renderDashboard();
    if (currentPortfolioId && !state.portfolios.find((p) => p.id === currentPortfolioId)) {
      currentPortfolioId = null;
      switchView("dashboard");
    } else if (currentPortfolioId) {
      renderPortfolio();
    }
  });
}

function init() {
  renderSidebar();
  renderDashboard();
  switchView("dashboard");
  syncThemeInputs();
  syncPresentationToggle();
  elements.portfolioCurrencyInput.addEventListener("change", () => {
    const isUsd = elements.portfolioCurrencyInput.value === "USD";
    elements.portfolioUsdRateField.classList.toggle("show", isUsd);
    elements.portfolioUsdRateInput.required = isUsd;
  });
  elements.toggleSidebar.addEventListener("click", () => {
    elements.sidebar.classList.toggle("show");
  });
  elements.closeSidebar.addEventListener("click", () => {
    elements.sidebar.classList.remove("show");
  });
  elements.newPortfolioBtn.addEventListener("click", openPortfolioModal);
  elements.renamePortfolioBtn.addEventListener("click", openRenamePortfolioModal);
  elements.closePortfolioModal.addEventListener("click", closePortfolioModal);
  elements.cancelPortfolio.addEventListener("click", closePortfolioModal);
  elements.portfolioForm.addEventListener("submit", handleNewPortfolio);
  elements.addMovementBtn.addEventListener("click", () => openModal());
  elements.addBalanceBtn.addEventListener("click", () => openBalanceModal());
  elements.closeModal.addEventListener("click", closeModal);
  elements.cancelModal.addEventListener("click", closeModal);
  elements.movementForm.addEventListener("submit", handleSaveMovement);
  elements.balanceForm.addEventListener("submit", handleSaveBalance);
  elements.closeBalanceModal.addEventListener("click", closeBalanceModal);
  elements.cancelBalance.addEventListener("click", closeBalanceModal);
  elements.transactionsTable.addEventListener("click", handleTransactionAction);
  elements.balancesTable.addEventListener("click", handleTransactionAction);
  elements.balancesPrev.addEventListener("click", () => handleBalancesPagination(-1));
  elements.balancesNext.addEventListener("click", () => handleBalancesPagination(1));
  elements.balancesTableHeader.addEventListener("click", handleBalancesSort);
  elements.transactionsTableHeader.addEventListener("click", handleTransactionsSort);
  elements.rangeFilters.addEventListener("click", handleRangeFilter);
  elements.chartMode.addEventListener("click", handleChartMode);
  elements.dashboardChartMode.addEventListener("click", handleDashboardChartMode);
  elements.searchInput.addEventListener("input", handleSearch);
  elements.typeFilter.addEventListener("change", handleSearch);
  elements.amountMin.addEventListener("input", handleSearch);
  elements.amountMax.addEventListener("input", handleSearch);
  elements.positiveColorInput.addEventListener("input", handleThemeChange);
  elements.negativeColorInput.addEventListener("input", handleThemeChange);
  elements.chartColorInput.addEventListener("input", handleThemeChange);
  elements.presentationToggle.addEventListener("change", handlePresentationToggle);
  elements.doneSettingsBtn.addEventListener("click", () => elements.settingsModal.classList.remove("open"));
  elements.addWidgetBtn.addEventListener("click", openWidgetModal);
  elements.closeWidgetModal.addEventListener("click", closeWidgetModal);
  elements.cancelWidget.addEventListener("click", closeWidgetModal);
  elements.widgetForm.addEventListener("submit", handleAddWidget);
  elements.customWidgets.addEventListener("click", handleRemoveWidget);
  elements.settingsBtn.addEventListener("click", () => elements.settingsModal.classList.add("open"));
  elements.closeSettingsModal.addEventListener("click", () => elements.settingsModal.classList.remove("open"));
  elements.toastUndoBtn.addEventListener("click", () => {
    if (toastUndoAction) toastUndoAction();
    hideToast();
  });
  elements.exportBtn.addEventListener("click", handleExport);
  elements.importInput.addEventListener("change", handleImport);
  elements.resetBtn.addEventListener("click", handleReset);
  elements.dashboardNav.addEventListener("click", handleDashboardClick);
  elements.deletePortfolioBtn.addEventListener("click", handleDeletePortfolio);
}

init();
