const STORAGE_KEY = "investmentHub:v1";
const DEFAULT_COLORS = ["#22c55e", "#38bdf8", "#f97316", "#a855f7", "#f43f5e"];

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

const elements = {
  sidebar: document.getElementById("sidebar"),
  toggleSidebar: document.getElementById("toggleSidebar"),
  closeSidebar: document.getElementById("closeSidebar"),
  portfolioList: document.getElementById("portfolioList"),
  dashboardView: document.getElementById("dashboardView"),
  portfolioView: document.getElementById("portfolioView"),
  dashboardKpis: document.getElementById("dashboardKpis"),
  summaryTable: document.querySelector("#summaryTable tbody"),
  dashboardChartMode: document.getElementById("dashboardChartMode"),
  lineChart: document.getElementById("lineChart"),
  doughnutChart: document.getElementById("doughnutChart"),
  viewTitle: document.getElementById("viewTitle"),
  viewSubtitle: document.getElementById("viewSubtitle"),
  portfolioName: document.getElementById("portfolioName"),
  portfolioKpis: document.getElementById("portfolioKpis"),
  portfolioLineChart: document.getElementById("portfolioLineChart"),
  balancesTable: document.querySelector("#balancesTable tbody"),
  balancesInfo: document.getElementById("balancesInfo"),
  balancesPrev: document.getElementById("balancesPrev"),
  balancesNext: document.getElementById("balancesNext"),
  transactionsTable: document.querySelector("#transactionsTable tbody"),
  rangeFilters: document.getElementById("rangeFilters"),
  chartMode: document.getElementById("chartMode"),
  searchInput: document.getElementById("searchInput"),
  settingsBtn: document.getElementById("settingsBtn"),
  settingsModal: document.getElementById("settingsModal"),
  closeSettingsModal: document.getElementById("closeSettingsModal"),
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
  if (!raw) return JSON.parse(JSON.stringify(demoData));
  try {
    const parsed = JSON.parse(raw);
    if (!parsed.balances) parsed.balances = [];
    parsed.portfolios = parsed.portfolios.map((portfolio, index) => ({
      ...portfolio,
      color: portfolio.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]
    }));
    return parsed;
  } catch {
    return JSON.parse(JSON.stringify(demoData));
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function formatCurrency(value) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0
  }).format(value);
}

function formatPercent(value) {
  return `${(value * 100).toFixed(2)}%`;
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
  state.transactions.forEach((tx) => {
    if (tx.type !== "aporte" && tx.type !== "retiro") return;
    const current = map.get(tx.date) || 0;
    const delta = tx.type === "aporte" ? tx.amount : -tx.amount;
    map.set(tx.date, current + delta);
  });
  return map;
}

function getPortfolioColor(portfolio, index) {
  return portfolio.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
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
      value: getValorActual(portfolio, transactions),
      color: getPortfolioColor(portfolio, index)
    };
  });
}

function buildGlobalBalances() {
  const dates = Array.from(new Set(state.balances.map((balance) => balance.date))).sort(
    (a, b) => new Date(a) - new Date(b)
  );
  const byPortfolio = new Map();
  state.balances.forEach((balance) => {
    if (!byPortfolio.has(balance.portfolioId)) {
      byPortfolio.set(balance.portfolioId, []);
    }
    byPortfolio.get(balance.portfolioId).push(balance);
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

function createKpi(label, value, delta) {
  const card = document.createElement("div");
  card.className = "kpi";
  const trendClass = delta >= 0 ? "positive" : "negative";
  card.innerHTML = `
    <span>${label}</span>
    <strong>${value}</strong>
    ${delta !== null ? `<div class="${trendClass}">${formatPercent(delta)}</div>` : ""}
  `;
  return card;
}

function renderSidebar() {
  elements.portfolioList.innerHTML = "";
  state.portfolios.forEach((portfolio, index) => {
    const btn = document.createElement("button");
    btn.className = "nav__item";
    btn.innerHTML = `<span class="color-dot" style="background:${getPortfolioColor(portfolio, index)}"></span>${portfolio.name}`;
    btn.addEventListener("click", () => openPortfolio(portfolio.id));
    elements.portfolioList.appendChild(btn);
  });
  document.querySelectorAll(".nav__item").forEach((item) => item.classList.remove("active"));
}

function renderDashboard() {
  elements.dashboardKpis.innerHTML = "";
  const totals = state.portfolios.reduce(
    (acc, portfolio) => {
      const transactions = getPortfolioTransactions(portfolio.id);
      const aportesNetos = getAportesNetos(transactions);
      const valorActual = getValorActual(portfolio, transactions);
      const pnl = getPnL(valorActual, aportesNetos);
      acc.aportesNetos += aportesNetos;
      acc.valorActual += valorActual;
      acc.pnl += pnl;
      return acc;
    },
    { aportesNetos: 0, valorActual: 0, pnl: 0 }
  );
  const pnlPercent = getPnLPercent(totals.pnl, totals.aportesNetos);

  elements.dashboardKpis.appendChild(createKpi("Capital neto aportado", formatCurrency(totals.aportesNetos), null));
  elements.dashboardKpis.appendChild(createKpi("Valor actual", formatCurrency(totals.valorActual), null));
  elements.dashboardKpis.appendChild(createKpi("Ganancia / Perdida", formatCurrency(totals.pnl), pnlPercent));

  elements.summaryTable.innerHTML = "";
  state.portfolios.forEach((portfolio, index) => {
    const transactions = getPortfolioTransactions(portfolio.id);
    const aportesNetos = getAportesNetos(transactions);
    const valorActual = getValorActual(portfolio, transactions);
    const pnl = getPnL(valorActual, aportesNetos);
    const pnlPercentLocal = getPnLPercent(pnl, aportesNetos);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><span class="color-dot" style="background:${getPortfolioColor(portfolio, index)}"></span> ${portfolio.name}</td>
      <td>${formatCurrency(aportesNetos)}</td>
      <td>${formatCurrency(valorActual)}</td>
      <td><span class="${pnl >= 0 ? "positive" : "negative"}">${formatCurrency(pnl)} (${formatPercent(pnlPercentLocal)})</span></td>
      <td>${getLastBalanceDate(portfolio.id)}</td>
    `;
    elements.summaryTable.appendChild(tr);
  });

  renderCharts();
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
  const color = dashboardChartMode === "balance" ? "#38bdf8" : "#22c55e";

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
          borderColor: color,
          backgroundColor: dashboardChartMode === "balance"
            ? "rgba(56, 189, 248, 0.2)"
            : "rgba(34, 197, 94, 0.2)",
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

function renderPortfolioChart(balances, portfolioId) {
  const series = chartMode === "cumulative"
    ? buildCumulativeGainSeries(balances, portfolioId)
    : chartMode === "gain"
    ? buildDailyGainSeries(balances, portfolioId)
    : balances.map((item) => ({ date: item.date, value: item.value }));

  const labels = series.map((item) => item.date);
  const data = series.map((item) => item.value);
  const color = chartMode === "balance" ? "#38bdf8" : "#22c55e";
  const label =
    chartMode === "cumulative"
      ? "Ganancia acumulada"
      : chartMode === "gain"
      ? "Ganancia diaria"
      : "Balance total";

  if (portfolioLineChart) portfolioLineChart.destroy();
  portfolioLineChart = new Chart(elements.portfolioLineChart, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label,
          data,
          borderColor: color,
          backgroundColor: chartMode === "balance"
            ? "rgba(56, 189, 248, 0.2)"
            : "rgba(34, 197, 94, 0.2)",
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
}

function renderPortfolioBalancesTable(balances, portfolioId) {
  const netMap = buildNetAporteMap(portfolioId);
  elements.balancesTable.innerHTML = "";
  const total = balances.length;
  const totalPages = Math.max(1, Math.ceil(total / BALANCES_PER_PAGE));
  if (balancesPage > totalPages) balancesPage = totalPages;
  if (balancesPage < 1) balancesPage = 1;

  const sorted = [...balances].sort((a, b) => new Date(b.date) - new Date(a.date));
  const start = (balancesPage - 1) * BALANCES_PER_PAGE;
  const pageItems = sorted.slice(start, start + BALANCES_PER_PAGE);

  pageItems.forEach((balance) => {
    const originalIndex = balances.findIndex((item) => item.id === balance.id);
    const prev = originalIndex <= 0 ? null : balances[originalIndex - 1];
    const aporteDia = netMap.get(balance.date) || 0;
    const dailyGain = prev ? balance.value - prev.value - aporteDia : 0;
    const dailyPercent = prev ? dailyGain / Math.max(prev.value, 1) : 0;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${balance.date}</td>
      <td>${formatCurrency(balance.value)}</td>
      <td class="${dailyGain >= 0 ? "positive" : "negative"}">${prev ? formatCurrency(dailyGain) : "-"}</td>
      <td class="${dailyGain >= 0 ? "positive" : "negative"}">${prev ? formatPercent(dailyPercent) : "-"}</td>
      <td>
        <button class="btn btn--ghost" data-action="edit-balance" data-id="${balance.id}">Editar</button>
        <button class="btn btn--danger" data-action="delete-balance" data-id="${balance.id}">Eliminar</button>
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

  elements.portfolioName.textContent = portfolio.name;

  const transactions = getPortfolioTransactions(portfolio.id);
  const aportesNetos = getAportesNetos(transactions);
  const valorActual = getValorActual(portfolio, transactions);
  const pnl = getPnL(valorActual, aportesNetos);
  const pnlPercent = getPnLPercent(pnl, aportesNetos);

  const balancesAll = getBalances(portfolio.id);
  const balancesFiltered = filterByRange(balancesAll, "date");
  const stats = getDailyStats(balancesAll, portfolio.id);

  elements.portfolioKpis.innerHTML = "";
  elements.portfolioKpis.appendChild(createKpi("Aportes netos", formatCurrency(aportesNetos), null));
  elements.portfolioKpis.appendChild(createKpi("Valor actual", formatCurrency(valorActual), null));
  elements.portfolioKpis.appendChild(createKpi("P/L", formatCurrency(pnl), pnlPercent));
  elements.portfolioKpis.appendChild(
    createKpi("Ganancia diaria", formatCurrency(stats.dailyGain), balancesAll.length ? stats.dailyPercent : null)
  );
  elements.portfolioKpis.appendChild(
    createKpi("Promedio diario", formatPercent(stats.avgDailyPercent), stats.avgDailyPercent)
  );
  elements.portfolioKpis.appendChild(
    createKpi("Acumulado", formatCurrency(stats.cumulativeGain), stats.cumulativePercent)
  );

  renderPortfolioChart(balancesFiltered, portfolio.id);
  renderPortfolioBalancesTable(balancesFiltered, portfolio.id);

  const filteredTransactions = filterByRange(transactions, "date").filter((tx) => {
    const query = elements.searchInput.value.toLowerCase();
    if (!query) return true;
    return (tx.note || "").toLowerCase().includes(query);
  });

  elements.transactionsTable.innerHTML = "";
  filteredTransactions.forEach((tx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${tx.date}</td>
      <td>${tx.type}</td>
      <td>${formatCurrency(tx.amount)}</td>
      <td>${tx.note || "-"}</td>
      <td>
        <button class="btn btn--ghost" data-action="edit" data-id="${tx.id}">Editar</button>
        <button class="btn btn--danger" data-action="delete" data-id="${tx.id}">Eliminar</button>
      </td>
    `;
    elements.transactionsTable.appendChild(tr);
  });
}

function switchView(view) {
  elements.dashboardView.classList.toggle("active", view === "dashboard");
  elements.portfolioView.classList.toggle("active", view === "portfolio");
  elements.viewTitle.textContent = view === "dashboard" ? "Dashboard" : "Cartera";
  elements.viewSubtitle.textContent = view === "dashboard" ? "Resumen global" : "Detalle";
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
      state.transactions = state.transactions.filter((tx) => tx.id !== id);
      saveState();
      renderDashboard();
      renderPortfolio();
    }
  }

  if (action === "edit-balance" || action === "delete-balance") {
    const balance = state.balances.find((item) => item.id === id);
    if (action === "edit-balance" && balance) {
      openBalanceModal(balance);
    }
    if (action === "delete-balance") {
      state.balances = state.balances.filter((item) => item.id !== id);
      saveState();
      renderPortfolio();
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

function handleBalancesPagination(direction) {
  balancesPage += direction;
  renderPortfolio();
}

function handleDashboardClick(event) {
  if (!event.target.closest("[data-view='dashboard']")) return;
  switchView("dashboard");
  renderDashboard();
}

function handleNewPortfolio(event) {
  event.preventDefault();
  const name = elements.portfolioNameInput.value.trim();
  if (!name) return;
  const color = elements.portfolioColorInput.value || DEFAULT_COLORS[0];
  if (editingPortfolioId) {
    const portfolio = state.portfolios.find((item) => item.id === editingPortfolioId);
    if (portfolio) {
      portfolio.name = name;
      portfolio.color = color;
    }
  } else {
    const newPortfolio = {
      id: `p${crypto.randomUUID()}`,
      name,
      color
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
        state = parsed;
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
  state = JSON.parse(JSON.stringify(demoData));
  saveState();
  renderSidebar();
  renderDashboard();
  switchView("dashboard");
}

function init() {
  renderSidebar();
  renderDashboard();
  switchView("dashboard");
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
  elements.rangeFilters.addEventListener("click", handleRangeFilter);
  elements.chartMode.addEventListener("click", handleChartMode);
  elements.dashboardChartMode.addEventListener("click", handleDashboardChartMode);
  elements.searchInput.addEventListener("input", handleSearch);
  elements.settingsBtn.addEventListener("click", () => elements.settingsModal.classList.add("open"));
  elements.closeSettingsModal.addEventListener("click", () => elements.settingsModal.classList.remove("open"));
  elements.exportBtn.addEventListener("click", handleExport);
  elements.importInput.addEventListener("change", handleImport);
  elements.resetBtn.addEventListener("click", handleReset);
  document.querySelector("[data-view='dashboard']").addEventListener("click", handleDashboardClick);
  elements.deletePortfolioBtn.addEventListener("click", handleDeletePortfolio);
}

init();
