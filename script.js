/* ============================================================
   BorrowBox OLTP→OLAP Visual Demo  —  script.js
   ============================================================ */

'use strict';

// ── Mock / Fallback Data ───────────────────────────────────────
const MOCK = {
  oltpSummary: {
    borrowers: 906, transactions: 28990, transaction_items: 56204,
    items: 87, item_units: 1204, borrower_types: 4,
    colleges: 12, departments: 38, courses: 142, total_records: 88638,
  },
  olapSummary: {
    fact_borrowing: 56204, dim_borrower: 906, dim_item: 87,
    dim_date: 3650, dim_category: 15, dim_status: 5,
  },
  borrowingsByMonth: [
    { year:2024, month:1,  month_name:'Jan', count:2100 },
    { year:2024, month:2,  month_name:'Feb', count:1980 },
    { year:2024, month:3,  month_name:'Mar', count:2450 },
    { year:2024, month:4,  month_name:'Apr', count:2300 },
    { year:2024, month:5,  month_name:'May', count:2600 },
    { year:2024, month:6,  month_name:'Jun', count:1750 },
    { year:2024, month:7,  month_name:'Jul', count:1400 },
    { year:2024, month:8,  month_name:'Aug', count:1600 },
    { year:2024, month:9,  month_name:'Sep', count:2800 },
    { year:2024, month:10, month_name:'Oct', count:3100 },
    { year:2024, month:11, month_name:'Nov', count:2950 },
    { year:2024, month:12, month_name:'Dec', count:1960 },
  ],
  topCategories: [
    { category_name:'Laptops',          total:12400 },
    { category_name:'Tablets',          total:8900  },
    { category_name:'iPads',            total:7200  },
    { category_name:'Cameras',          total:5100  },
    { category_name:'LCD Projectors',   total:4800  },
    { category_name:'VR Headsets',      total:3200  },
    { category_name:'Sound Systems',    total:2900  },
    { category_name:'Microphones',      total:2400  },
    { category_name:'Tripods',          total:1800  },
    { category_name:'Sports Equipment', total:1500  },
    { category_name:'Others',           total:1204  },
  ],
  borrowerTypes: [
    { borrower_type:'Student', total:38000 },
    { borrower_type:'Faculty', total:12000 },
    { borrower_type:'Staff',   total:4000  },
    { borrower_type:'Guest',   total:3204  },
  ],
  statusDistribution: [
    { status_name:'Returned On Time',  total:24841 },
    { status_name:'Overdue Returned',  total:3201  },
    { status_name:'Currently Borrowed',total:948   },
  ],
  topItems: [
    { rank:1,  item_name:'MacBook Pro 14"',         category_name:'Laptops',        total:3420 },
    { rank:2,  item_name:'iPad Pro 12.9"',          category_name:'iPads',           total:2980 },
    { rank:3,  item_name:'Dell XPS 15',             category_name:'Laptops',        total:2750 },
    { rank:4,  item_name:'Sony A7 III Camera',      category_name:'Cameras',        total:2310 },
    { rank:5,  item_name:'Samsung Galaxy Tab S9',   category_name:'Tablets',        total:2100 },
    { rank:6,  item_name:'Epson EB-X51 Projector',  category_name:'LCD Projectors', total:1980 },
    { rank:7,  item_name:'Meta Quest 3',            category_name:'VR Headsets',    total:1750 },
    { rank:8,  item_name:'Lenovo ThinkPad X1',      category_name:'Laptops',        total:1640 },
    { rank:9,  item_name:'Rode NT-USB Microphone',  category_name:'Microphones',    total:1520 },
    { rank:10, item_name:'JBL EON615 Speaker',      category_name:'Sound Systems',  total:1380 },
  ],
};

// ── Section definitions ────────────────────────────────────────
const SECTIONS = [
  { id:'overview',   label:'Overview',        icon:'🏠', color:'#3b82f6', delay:5000 },
  { id:'oltp',       label:'OLTP',            icon:'🗄️', color:'#10b981', delay:8000 },
  { id:'olap',       label:'OLAP Design',     icon:'⭐', color:'#8b5cf6', delay:8000 },
  { id:'extract',    label:'Extract',         icon:'📤', color:'#f59e0b', delay:9000 },
  { id:'transform',  label:'Transform',       icon:'🔄', color:'#f43f5e', delay:9000 },
  { id:'load',       label:'Load',            icon:'📥', color:'#06b6d4', delay:9000 },
  { id:'dashboard',  label:'OLAP Dashboard',  icon:'📊', color:'#6366f1', delay:0    },
];

// ── State ──────────────────────────────────────────────────────
const state = {
  currentIdx:  0,
  isPlaying:   true,
  autoTimer:   null,
  isLiveData:  false,
  charts:      {},
  logTimers:   [],
  initialized: {},
  liveData:    {},
};

// ── API helpers ────────────────────────────────────────────────
async function fetchJSON(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } catch (_) {
    return null;
  }
}

// ── DOM helpers ────────────────────────────────────────────────
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
function el(tag, cls, html = '') {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html) e.innerHTML = html;
  return e;
}

// ── Number animation ───────────────────────────────────────────
function animateCount(element, target, duration = 1200, prefix = '', suffix = '') {
  const start = performance.now();
  const from  = 0;
  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    const val  = Math.round(from + (target - from) * ease);
    element.textContent = prefix + val.toLocaleString() + suffix;
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ── Typewriter log system ──────────────────────────────────────
function clearLogTimers() {
  state.logTimers.forEach(t => clearTimeout(t));
  state.logTimers = [];
}

function typewriterLogs(panelEl, lines, baseDelay = 0, interval = 420) {
  clearLogTimers();
  panelEl.innerHTML = '';
  lines.forEach((line, i) => {
    const t = setTimeout(() => {
      const div = el('div', 'log-line ' + (line.cls || 'log-info'), '');
      div.textContent = line.text;
      panelEl.appendChild(div);
      requestAnimationFrame(() => div.classList.add('shown'));
      panelEl.scrollTop = panelEl.scrollHeight;
      if (line.onShow) line.onShow(i);
    }, baseDelay + i * interval);
    state.logTimers.push(t);
  });
}

// ── Data-mode badge ────────────────────────────────────────────
function setBadge(live) {
  state.isLiveData = live;
  const b = $('#data-mode-badge');
  if (live) {
    b.textContent = '● Live Data Connected';
    b.className = 'data-mode-badge live';
    b.id = 'data-mode-badge';
  } else {
    b.textContent = '○ Demo Data Mode';
    b.className = 'data-mode-badge demo';
    b.id = 'data-mode-badge';
  }
}

// ── Sidebar + progress ─────────────────────────────────────────
function updateSidebar(idx) {
  $$('.nav-item').forEach(n => n.classList.remove('active'));
  const activeNav = $(`.nav-item[data-section="${SECTIONS[idx].id}"]`);
  if (activeNav) activeNav.classList.add('active');

  const pct = ((idx) / (SECTIONS.length - 1)) * 100;
  $('#prog-bar-fill').style.width = pct + '%';
  $('#prog-bar-fill').style.background = SECTIONS[idx].color;
}

// ── Section switching ──────────────────────────────────────────
function goToSection(idx, manual = false) {
  if (manual) {
    pauseAuto();
    state.isPlaying = false;
    updatePauseBtn();
  }

  const prev = SECTIONS[state.currentIdx];
  const next = SECTIONS[idx];

  $('#sec-' + prev.id)?.classList.remove('active');
  state.currentIdx = idx;
  const secEl = $('#sec-' + next.id);
  if (secEl) secEl.classList.add('active');

  updateSidebar(idx);
  onSectionEnter(next.id);

  if (state.isPlaying && !manual) scheduleNext();
}

function scheduleNext() {
  clearTimeout(state.autoTimer);
  const delay = SECTIONS[state.currentIdx].delay;
  if (delay <= 0) return; // dashboard — stays
  state.autoTimer = setTimeout(() => {
    const nextIdx = state.currentIdx + 1;
    if (nextIdx < SECTIONS.length) goToSection(nextIdx);
  }, delay);
}

function pauseAuto() {
  clearTimeout(state.autoTimer);
  clearLogTimers();
}

function resumeAuto() {
  state.isPlaying = true;
  updatePauseBtn();
  scheduleNext();
}

function restartDemo() {
  pauseAuto();
  state.isPlaying = true;
  updatePauseBtn();
  // Reset initialized sections that use animations
  ['extract','transform','load','oltp','olap'].forEach(s => delete state.initialized[s]);
  goToSection(0);
}

function updatePauseBtn() {
  const btn = $('#btn-pause');
  btn.textContent = state.isPlaying ? '⏸ Pause' : '▶ Resume';
  btn.onclick = state.isPlaying ? () => { pauseAuto(); state.isPlaying = false; updatePauseBtn(); } : resumeAuto;
}

// ── Section enter handlers ─────────────────────────────────────
function onSectionEnter(id) {
  switch (id) {
    case 'overview':   initOverview();   break;
    case 'oltp':       initOltp();       break;
    case 'olap':       initOlap();       break;
    case 'extract':    initExtract();    break;
    case 'transform':  initTransform();  break;
    case 'load':       initLoad();       break;
    case 'dashboard':  initDashboard();  break;
  }
}

// ══════════════════════════════════════════════════════════════
//  SECTION 1 — OVERVIEW
// ══════════════════════════════════════════════════════════════
function initOverview() {}  // static, nothing to animate

// ══════════════════════════════════════════════════════════════
//  SECTION 2 — OLTP
// ══════════════════════════════════════════════════════════════
function initOltp() {
  if (state.initialized.oltp) return;
  state.initialized.oltp = true;

  const cards = $$('.erd-table-card');
  cards.forEach((c, i) => {
    setTimeout(() => c.classList.add('visible'), i * 80);
  });
}

// ══════════════════════════════════════════════════════════════
//  SECTION 3 — OLAP
// ══════════════════════════════════════════════════════════════
function initOlap() {
  if (state.initialized.olap) return;
  state.initialized.olap = true;

  // Light up fact card first
  setTimeout(() => {
    $('#fact-card')?.classList.add('lit');
  }, 200);

  // Then light up each dim card and its line
  $$('.dim-card').forEach((dc, i) => {
    setTimeout(() => {
      dc.classList.add('lit');
      const lineId = dc.dataset.line;
      if (lineId) {
        const line = document.getElementById(lineId);
        line?.classList.add('visible');
      }
    }, 600 + i * 350);
  });
}

// ══════════════════════════════════════════════════════════════
//  SECTION 4 — EXTRACT
// ══════════════════════════════════════════════════════════════
const EXTRACT_LOGS = [
  { text: '[INFO] Connecting to borrowbox_oltp...', cls: 'log-info' },
  { text: '[OK]   Connection established.', cls: 'log-ok' },
  { text: '[READ] Reading borrowers...              (906 records)', cls: 'log-read', src: 0 },
  { text: '[READ] Reading borrower_types...         (4 records)', cls: 'log-read', src: 0 },
  { text: '[READ] Reading colleges...               (12 records)', cls: 'log-read', src: 0 },
  { text: '[READ] Reading departments...            (38 records)', cls: 'log-read', src: 0 },
  { text: '[READ] Reading courses...                (142 records)', cls: 'log-read', src: 0 },
  { text: '[READ] Reading items...                  (87 items)', cls: 'log-read', src: 1 },
  { text: '[READ] Reading item_categories...        (15 records)', cls: 'log-read', src: 1 },
  { text: '[READ] Reading item_units...             (1,204 units)', cls: 'log-read', src: 1 },
  { text: '[READ] Reading borrow_transactions...    (28,990 records)', cls: 'log-read', src: 2 },
  { text: '[READ] Reading borrow_transaction_items...(56,204 records)', cls: 'log-read', src: 3 },
  { text: '[OK]   Extract complete. 88,638 total records read.', cls: 'log-ok' },
];

async function initExtract() {
  if (state.initialized.extract) return;
  state.initialized.extract = true;

  // Try live API
  const data = await fetchJSON('api/get_oltp_summary.php');
  setBadge(data?.status === 'ok');

  // Update log lines with live data if available
  const logs = EXTRACT_LOGS.map(l => ({ ...l }));
  if (data?.status === 'ok') {
    logs[2].text  = `[READ] Reading borrowers...              (${data.borrowers.toLocaleString()} records)`;
    logs[7].text  = `[READ] Reading items...                  (${data.items.toLocaleString()} items)`;
    logs[10].text = `[READ] Reading borrow_transactions...    (${data.transactions.toLocaleString()} records)`;
    logs[11].text = `[READ] Reading borrow_transaction_items...(${data.transaction_items.toLocaleString()} records)`;
    logs[12].text = `[OK]   Extract complete. ${data.total_records.toLocaleString()} total records read.`;
  }

  const srcCards = $$('.source-card');
  const addOnShow = (logs) => logs.map((l, i) => ({
    ...l,
    onShow: (idx) => {
      if (l.src !== undefined && srcCards[l.src]) {
        srcCards[l.src].classList.add('active-flow');
      }
    }
  }));

  const panel = $('#extract-log');
  if (panel) typewriterLogs(panel, addOnShow(logs), 0, 400);
}

// ══════════════════════════════════════════════════════════════
//  SECTION 5 — TRANSFORM
// ══════════════════════════════════════════════════════════════
const TRANSFORM_LOGS = [
  { text: '[TRANSFORM] Standardizing borrower names...', cls: 'log-transform' },
  { text: '[TRANSFORM] Generating date keys from timestamps...', cls: 'log-transform' },
  { text: '[TRANSFORM] Mapping item_ids to surrogate item_keys...', cls: 'log-transform' },
  { text: '[TRANSFORM] Mapping borrower_ids to borrower_keys...', cls: 'log-transform' },
  { text: '[TRANSFORM] Calculating overdue flags...', cls: 'log-transform' },
  { text: '[TRANSFORM] Applying NULL handling for missing return dates...', cls: 'log-transform' },
  { text: '[TRANSFORM] Building dimension lookup tables...', cls: 'log-transform' },
  { text: '[OK] Transform complete. 56,204 fact rows ready.', cls: 'log-ok' },
];

function initTransform() {
  if (state.initialized.transform) return;
  state.initialized.transform = true;

  const panel = $('#transform-log');
  const cards = $$('.transform-card');

  const logsWithEvents = TRANSFORM_LOGS.map((l, i) => ({
    ...l,
    onShow: () => {
      const card = cards[i];
      if (card) card.classList.add('highlighted');
    }
  }));

  if (panel) typewriterLogs(panel, logsWithEvents, 0, 500);
}

// ══════════════════════════════════════════════════════════════
//  SECTION 6 — LOAD
// ══════════════════════════════════════════════════════════════
const LOAD_TABLES = [
  { key:'dim_date',     label:'dim_date',     defaultCount:3650 },
  { key:'dim_borrower', label:'dim_borrower', defaultCount:906  },
  { key:'dim_item',     label:'dim_item',     defaultCount:87   },
  { key:'dim_category', label:'dim_category', defaultCount:15   },
  { key:'dim_status',   label:'dim_status',   defaultCount:5    },
  { key:'fact_borrowing',label:'fact_borrowing',defaultCount:56204 },
];

async function initLoad() {
  if (state.initialized.load) return;
  state.initialized.load = true;

  const data = await fetchJSON('api/get_olap_summary.php');
  setBadge(data?.status === 'ok');

  const counts = {};
  LOAD_TABLES.forEach(t => {
    counts[t.key] = (data?.status === 'ok' && data[t.key]) ? data[t.key] : t.defaultCount;
  });

  const logLines = LOAD_TABLES.map(t => ({
    text: `[LOAD] Loading ${t.label}... ${counts[t.key].toLocaleString()} rows`,
    cls:  'log-load',
    tableKey: t.key,
  }));
  logLines.push({ text: '[OK]   Load complete. borrowbox_olap is ready.', cls: 'log-ok' });

  const withEvents = logLines.map(l => ({
    ...l,
    onShow: () => {
      if (!l.tableKey) return;
      const card = $(`.load-dim-card[data-table="${l.tableKey}"]`);
      if (!card) return;
      card.classList.add('loaded');
      const counter = card.querySelector('.ldim-count');
      if (counter) animateCount(counter, counts[l.tableKey], 800);
    }
  }));

  const panel = $('#load-log');
  if (panel) typewriterLogs(panel, withEvents, 0, 550);
}

// ══════════════════════════════════════════════════════════════
//  SECTION 7 — DASHBOARD
// ══════════════════════════════════════════════════════════════
async function initDashboard() {
  if (state.initialized.dashboard) return;
  state.initialized.dashboard = true;

  // Animate KPI cards
  const kpiData = [
    { id:'kpi-total-borrowings', target:28990 },
    { id:'kpi-returned',         target:24841 },
    { id:'kpi-overdue',          target:3201  },
    { id:'kpi-borrowers',        target:906   },
  ];
  kpiData.forEach(k => {
    const el = document.getElementById(k.id);
    if (el) animateCount(el, k.target, 1400);
  });

  // Load all chart data in parallel
  const [byMonth, topCats, borTypes, statusDist, topItems] = await Promise.all([
    fetchJSON('api/get_borrowings_by_month.php'),
    fetchJSON('api/get_top_categories.php'),
    fetchJSON('api/get_borrower_types.php'),
    fetchJSON('api/get_status_distribution.php'),
    fetchJSON('api/get_top_items.php'),
  ]);

  const isLive = [byMonth, topCats, borTypes, statusDist, topItems]
    .some(d => d?.status === 'ok');
  setBadge(isLive);

  const monthData   = byMonth?.data   || MOCK.borrowingsByMonth;
  const catData     = topCats?.data   || MOCK.topCategories;
  const typeData    = borTypes?.data  || MOCK.borrowerTypes;
  const statusData  = statusDist?.data|| MOCK.statusDistribution;
  const itemsData   = topItems?.data  || MOCK.topItems;

  buildChartByMonth(monthData);
  buildChartCategories(catData);
  buildChartBorrowerTypes(typeData);
  buildChartStatus(statusData);
  buildTopItemsTable(itemsData);
}

// ── Chart: Borrowings by Month ─────────────────────────────────
function buildChartByMonth(data) {
  const ctx = document.getElementById('chart-by-month')?.getContext('2d');
  if (!ctx) return;
  if (state.charts.byMonth) { state.charts.byMonth.destroy(); }

  state.charts.byMonth = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.month_name),
      datasets: [{
        label: 'Borrowings',
        data:  data.map(d => d.count),
        backgroundColor: 'rgba(59,130,246,0.7)',
        borderColor:     '#3b82f6',
        borderWidth: 1,
        borderRadius: 4,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color:'#94a3b8', font:{size:11} }, grid: { color:'rgba(255,255,255,0.05)' } },
        y: { ticks: { color:'#94a3b8', font:{size:11} }, grid: { color:'rgba(255,255,255,0.05)' } },
      },
      onClick: (e, elements) => {
        if (!elements.length) return;
        const idx = elements[0].index;
        const d   = data[idx];
        openDrillthrough('month', `${d.year || 2024}-${String(d.month).padStart(2,'0')}`, d.month_name + ' ' + (d.year||2024));
      },
    }
  });
}

// ── Chart: Top Categories ──────────────────────────────────────
function buildChartCategories(data) {
  const ctx = document.getElementById('chart-categories')?.getContext('2d');
  if (!ctx) return;
  if (state.charts.categories) { state.charts.categories.destroy(); }

  state.charts.categories = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.category_name),
      datasets: [{
        label: 'Total Borrowed',
        data:  data.map(d => d.total),
        backgroundColor: [
          '#8b5cf6','#7c3aed','#a78bfa','#6d28d9','#9f67fa',
          '#c4b5fd','#ddd6fe','#5b21b6','#4c1d95','#3b0764','#2e1065',
        ],
        borderRadius: 4,
        borderWidth: 0,
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color:'#94a3b8', font:{size:10} }, grid: { color:'rgba(255,255,255,0.05)' } },
        y: { ticks: { color:'#94a3b8', font:{size:10} }, grid: { display:false } },
      },
      onClick: (e, elements) => {
        if (!elements.length) return;
        const d = data[elements[0].index];
        openDrillthrough('category', d.category_name, d.category_name);
      },
    }
  });
}

// ── Chart: Borrower Types ──────────────────────────────────────
function buildChartBorrowerTypes(data) {
  const ctx = document.getElementById('chart-borrower-types')?.getContext('2d');
  if (!ctx) return;
  if (state.charts.borrowerTypes) { state.charts.borrowerTypes.destroy(); }

  const colors = ['#6366f1','#8b5cf6','#06b6d4','#10b981'];
  state.charts.borrowerTypes = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: data.map(d => d.borrower_type),
      datasets: [{
        data:  data.map(d => d.total),
        backgroundColor: colors,
        borderColor: '#1e293b',
        borderWidth: 3,
        hoverOffset: 6,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color:'#94a3b8', font:{size:11}, padding:12 }
        }
      },
      onClick: (e, elements) => {
        if (!elements.length) return;
        const d = data[elements[0].index];
        openDrillthrough('borrower_type', d.borrower_type, d.borrower_type);
      },
    }
  });
}

// ── Chart: Status Distribution ─────────────────────────────────
function buildChartStatus(data) {
  const ctx = document.getElementById('chart-status')?.getContext('2d');
  if (!ctx) return;
  if (state.charts.status) { state.charts.status.destroy(); }

  const colors = ['#10b981','#f59e0b','#3b82f6','#f43f5e','#8b5cf6'];
  state.charts.status = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: data.map(d => d.status_name),
      datasets: [{
        data:  data.map(d => d.total),
        backgroundColor: colors,
        borderColor: '#1e293b',
        borderWidth: 3,
        hoverOffset: 6,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color:'#94a3b8', font:{size:11}, padding:12 }
        }
      },
      onClick: (e, elements) => {
        if (!elements.length) return;
        const d = data[elements[0].index];
        openDrillthrough('status', d.status_name, d.status_name);
      },
    }
  });
}

// ── Top Items Table ────────────────────────────────────────────
function buildTopItemsTable(data) {
  const tbody = document.getElementById('top-items-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  data.forEach(row => {
    const tr = el('tr', '');
    tr.innerHTML = `
      <td class="px-3 py-2"><span class="rank-badge">${row.rank}</span></td>
      <td class="px-3 py-2 font-semibold text-slate-200">${row.item_name}</td>
      <td class="px-3 py-2 text-slate-400">${row.category_name}</td>
      <td class="px-3 py-2 text-right font-mono accent-text-indigo">${row.total.toLocaleString()}</td>
    `;
    tr.addEventListener('click', () => openDrillthrough('item', row.item_name, row.item_name));
    tbody.appendChild(tr);
  });
}

// ── Drill-through Modal ────────────────────────────────────────
async function openDrillthrough(type, value, label) {
  const modal = document.getElementById('drillthrough-modal');
  const title = document.getElementById('dt-title');
  const table = document.getElementById('dt-table-body');

  if (!modal) return;

  title.textContent = `Drill-through: ${label}`;
  table.innerHTML = `<tr><td colspan="4" class="text-center py-6 text-slate-500">Loading…</td></tr>`;
  modal.classList.add('open');

  const data = await fetchJSON(`api/get_drillthrough.php?type=${encodeURIComponent(type)}&value=${encodeURIComponent(value)}`);
  const rows = data?.data || [];

  if (!rows.length) {
    table.innerHTML = `<tr><td colspan="4" class="text-center py-6 text-slate-500">No records found.</td></tr>`;
    return;
  }

  table.innerHTML = '';
  rows.forEach(r => {
    const tr = el('tr','border-b border-white/5');
    tr.innerHTML = `
      <td class="px-3 py-2 text-slate-300">${r.borrower || '—'}</td>
      <td class="px-3 py-2 text-slate-300">${r.item || '—'}</td>
      <td class="px-3 py-2 text-slate-400 font-mono text-sm">${r.date || '—'}</td>
      <td class="px-3 py-2">
        <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${statusClass(r.status)}">${r.status || '—'}</span>
      </td>
    `;
    table.appendChild(tr);
  });
}

function statusClass(s) {
  if (!s) return 'bg-slate-700 text-slate-300';
  if (s.includes('On Time'))  return 'bg-emerald-900/60 text-emerald-300';
  if (s.includes('Overdue'))  return 'bg-amber-900/60 text-amber-300';
  if (s.includes('Borrowed')) return 'bg-blue-900/60 text-blue-300';
  return 'bg-slate-700 text-slate-300';
}

function closeDrillthrough() {
  document.getElementById('drillthrough-modal')?.classList.remove('open');
}

// ── Filter dropdowns (dashboard) ─────────────────────────────
function handleFilterChange() {
  if (!state.initialized.dashboard) return;
  // Re-fetch with year filter
  const year = document.getElementById('filter-year')?.value;
  const url  = year && year !== 'all'
    ? `api/get_borrowings_by_month.php?year=${year}`
    : 'api/get_borrowings_by_month.php';

  fetchJSON(url).then(data => {
    const monthData = data?.data || MOCK.borrowingsByMonth;
    buildChartByMonth(monthData);
  });
}

// ── Build static HTML for sections ────────────────────────────

function buildOverviewSection() {
  const sec = document.getElementById('sec-overview');
  if (!sec) return;
  sec.innerHTML = `
    <div class="section-title accent-text-blue">BorrowBox: OLTP to OLAP Demo</div>
    <div class="section-subtitle">A visual walkthrough of how transactional data becomes analytics</div>

    <!-- Step Flow -->
    <div class="mb-8 overflow-x-auto">
      <div class="step-flow min-w-max mx-auto">
        <div class="step-pill" style="background:rgba(16,185,129,0.15);color:#6ee7b7;border:1px solid rgba(16,185,129,0.3)">
          <span class="step-icon">🗄️</span><span>OLTP</span>
        </div>
        <div class="step-arrow">→</div>
        <div class="step-pill" style="background:rgba(139,92,246,0.15);color:#c4b5fd;border:1px solid rgba(139,92,246,0.3)">
          <span class="step-icon">⭐</span><span>OLAP Design</span>
        </div>
        <div class="step-arrow">→</div>
        <div class="step-pill" style="background:rgba(245,158,11,0.15);color:#fcd34d;border:1px solid rgba(245,158,11,0.3)">
          <span class="step-icon">📤</span><span>Extract</span>
        </div>
        <div class="step-arrow">→</div>
        <div class="step-pill" style="background:rgba(244,63,94,0.15);color:#fda4af;border:1px solid rgba(244,63,94,0.3)">
          <span class="step-icon">🔄</span><span>Transform</span>
        </div>
        <div class="step-arrow">→</div>
        <div class="step-pill" style="background:rgba(6,182,212,0.15);color:#67e8f9;border:1px solid rgba(6,182,212,0.3)">
          <span class="step-icon">📥</span><span>Load</span>
        </div>
        <div class="step-arrow">→</div>
        <div class="step-pill" style="background:rgba(99,102,241,0.15);color:#a5b4fc;border:1px solid rgba(99,102,241,0.3)">
          <span class="step-icon">📊</span><span>Dashboard</span>
        </div>
      </div>
    </div>

    <!-- Start Demo button -->
    <div class="flex justify-center mb-10">
      <button id="btn-start-demo"
        class="ctrl-btn text-base px-8 py-3"
        style="background:rgba(59,130,246,0.2);color:#93c5fd;border:1px solid rgba(59,130,246,0.4);font-size:0.95rem"
        onclick="startDemo()">
        ▶&nbsp;&nbsp;Start Demo
      </button>
    </div>

    <!-- Info cards -->
    <div class="grid grid-cols-2 gap-4 max-w-3xl mx-auto" style="grid-template-columns:repeat(2,1fr)">
      <div class="info-card">
        <div class="info-icon">🗄️</div>
        <div class="info-title">OLTP — Daily Transactions</div>
        <div class="info-body">Stores every borrowing event in real-time. Optimized for fast inserts, updates, and lookups with a highly normalized schema.</div>
      </div>
      <div class="info-card">
        <div class="info-icon">⭐</div>
        <div class="info-title">OLAP — Analytics Ready</div>
        <div class="info-body">Organizes data in a star schema with fact and dimension tables. Designed for fast aggregations and multi-dimensional reporting.</div>
      </div>
      <div class="info-card">
        <div class="info-icon">🔁</div>
        <div class="info-title">ETL — Moving the Data</div>
        <div class="info-body">Extract, Transform, Load pipeline reads from OLTP, cleans and restructures it, then writes to the OLAP warehouse on a schedule.</div>
      </div>
      <div class="info-card">
        <div class="info-icon">📊</div>
        <div class="info-title">Dashboard — Decision Support</div>
        <div class="info-body">Interactive charts and KPIs surface patterns—peak borrowing periods, overdue trends, top equipment—for administrators and planners.</div>
      </div>
    </div>
  `;
}

function buildOltpSection() {
  const sec = document.getElementById('sec-oltp');
  if (!sec) return;

  const groups = [
    {
      label: 'Borrowers',
      tables: [
        { name:'borrowers',     fields:[{pk:true,name:'borrower_id'},{fk:true,name:'borrower_type_id'},{fk:true,name:'course_id'},{name:'name'},{name:'email'}] },
        { name:'borrower_types',fields:[{pk:true,name:'borrower_type_id'},{name:'type_name'}] },
        { name:'colleges',      fields:[{pk:true,name:'college_id'},{name:'college_name'}] },
        { name:'departments',   fields:[{pk:true,name:'department_id'},{fk:true,name:'college_id'},{name:'department_name'}] },
        { name:'courses',       fields:[{pk:true,name:'course_id'},{fk:true,name:'department_id'},{name:'course_name'}] },
      ]
    },
    {
      label: 'Items',
      tables: [
        { name:'items',           fields:[{pk:true,name:'item_id'},{fk:true,name:'category_id'},{fk:true,name:'brand_id'},{fk:true,name:'supplier_id'},{name:'item_name'}] },
        { name:'item_categories', fields:[{pk:true,name:'category_id'},{name:'category_name'}] },
        { name:'brands',          fields:[{pk:true,name:'brand_id'},{name:'brand_name'}] },
        { name:'suppliers',       fields:[{pk:true,name:'supplier_id'},{name:'supplier_name'}] },
        { name:'item_units',      fields:[{pk:true,name:'unit_id'},{fk:true,name:'item_id'},{fk:true,name:'condition_id'},{fk:true,name:'unit_status_id'},{name:'serial_no'}] },
        { name:'item_conditions', fields:[{pk:true,name:'condition_id'},{name:'condition_name'}] },
        { name:'unit_statuses',   fields:[{pk:true,name:'unit_status_id'},{name:'status_name'}] },
      ]
    },
    {
      label: 'Transactions',
      tables: [
        { name:'borrow_transactions',     fields:[{pk:true,name:'transaction_id'},{fk:true,name:'borrower_id'},{name:'borrow_date'},{name:'due_date'}] },
        { name:'borrow_transaction_items',fields:[{pk:true,name:'bti_id'},{fk:true,name:'transaction_id'},{fk:true,name:'unit_id'},{fk:true,name:'status_id'},{name:'return_date'}] },
        { name:'borrow_statuses',         fields:[{pk:true,name:'status_id'},{name:'status_name'}] },
      ]
    }
  ];

  const groupColors = ['rgba(16,185,129,0.15)','rgba(59,130,246,0.15)','rgba(245,158,11,0.15)'];
  const groupTextColors = ['#6ee7b7','#93c5fd','#fcd34d'];
  const groupBorderColors = ['rgba(16,185,129,0.35)','rgba(59,130,246,0.35)','rgba(245,158,11,0.35)'];

  const tableHTML = (t) => `
    <div class="erd-table-card">
      <div class="erd-header">${t.name}</div>
      ${t.fields.map(f => `
        <div class="erd-field">
          ${f.pk ? '<span class="badge-pk">PK</span>' : f.fk ? '<span class="badge-fk">FK</span>' : '<span style="width:22px;display:inline-block"></span>'}
          ${f.name}
        </div>`).join('')}
    </div>
  `;

  const groupsHTML = groups.map((g,gi) => `
    <div style="background:${groupColors[gi]};border:1px solid ${groupBorderColors[gi]};border-radius:12px;padding:14px;flex:1;min-width:0">
      <div style="font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${groupTextColors[gi]};margin-bottom:10px">
        GROUP ${gi+1}: ${g.label}
      </div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${g.tables.map(tableHTML).join('')}
      </div>
    </div>
  `).join('');

  sec.innerHTML = `
    <div class="section-title accent-text-green">OLTP Database — BorrowBox Transactional System</div>
    <div class="section-subtitle">Normalized schema optimized for daily operations and data integrity</div>

    <div style="display:flex;gap:20px;align-items:flex-start">
      <!-- ERD Groups -->
      <div style="flex:1;display:flex;gap:14px;overflow-x:auto;min-width:0">
        ${groupsHTML}
      </div>

      <!-- Explanation panel -->
      <div class="expl-panel" style="width:240px;flex-shrink:0">
        <div style="font-size:0.75rem;font-weight:700;color:#6ee7b7;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px">OLTP Characteristics</div>
        <div class="expl-item">
          <span class="expl-icon">✅</span>
          <span class="expl-text"><strong>Normalized schema</strong> — eliminates data redundancy across all tables.</span>
        </div>
        <div class="expl-item">
          <span class="expl-icon">⚡</span>
          <span class="expl-text"><strong>Optimized for operations</strong> — fast inserts, updates, and atomic transactions.</span>
        </div>
        <div class="expl-item">
          <span class="expl-icon">🔗</span>
          <span class="expl-text"><strong>Many JOINs required</strong> — analytics queries need to join 8+ tables.</span>
        </div>
        <div class="expl-item">
          <span class="expl-icon">📉</span>
          <span class="expl-text"><strong>Slow for reporting</strong> — aggregation across millions of rows is inefficient.</span>
        </div>
        <div class="divider"></div>
        <div style="font-size:0.72rem;color:#94a3b8">
          <div style="margin-bottom:6px">📋 <strong style="color:#e2e8f0">15 tables</strong> in borrowbox_oltp</div>
          <div style="margin-bottom:6px">👤 <strong style="color:#e2e8f0">906</strong> registered borrowers</div>
          <div style="margin-bottom:6px">📦 <strong style="color:#e2e8f0">87</strong> unique items</div>
          <div>📝 <strong style="color:#e2e8f0">28,990</strong> borrowing transactions</div>
        </div>
      </div>
    </div>
  `;
}

function buildOlapSection() {
  const sec = document.getElementById('sec-olap');
  if (!sec) return;

  sec.innerHTML = `
    <div class="section-title accent-text-violet">OLAP Star Schema — borrowbox_olap</div>
    <div class="section-subtitle">Denormalized for fast analytical queries and multi-dimensional analysis</div>

    <div style="display:flex;gap:20px;align-items:flex-start">
      <!-- Star diagram -->
      <div style="flex:1;min-width:0">
        <div id="star-schema-container" style="position:relative;height:460px;">
          <svg id="star-svg" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1"></svg>

          <!-- Fact table (center) -->
          <div id="fact-card" style="left:50%;top:50%;transform:translate(-50%,-50%);width:190px">
            <div class="fact-title">⭐ fact_borrowing</div>
            <div class="fact-field">🔑 fact_id (PK)</div>
            <div class="fact-field">📅 date_key (FK)</div>
            <div class="fact-field">👤 borrower_key (FK)</div>
            <div class="fact-field">📦 item_key (FK)</div>
            <div class="fact-field">🏷️ category_key (FK)</div>
            <div class="fact-field">📋 status_key (FK)</div>
            <div class="fact-field">⚠️ is_overdue</div>
            <div class="fact-field">⏱️ days_borrowed</div>
          </div>

          <!-- dim_date — top -->
          <div class="dim-card" data-line="line-date" style="left:50%;top:2%;transform:translateX(-50%)">
            <div class="dim-title">📅 dim_date</div>
            <div class="dim-field">date_key (PK)</div>
            <div class="dim-field">full_date</div>
            <div class="dim-field">year, month, quarter</div>
            <div class="dim-field">day_of_week</div>
          </div>

          <!-- dim_borrower — left -->
          <div class="dim-card" data-line="line-borrower" style="left:1%;top:50%;transform:translateY(-50%)">
            <div class="dim-title">👤 dim_borrower</div>
            <div class="dim-field">borrower_key (PK)</div>
            <div class="dim-field">full_name</div>
            <div class="dim-field">borrower_type</div>
            <div class="dim-field">college, department</div>
          </div>

          <!-- dim_item — right -->
          <div class="dim-card" data-line="line-item" style="right:1%;top:50%;transform:translateY(-50%)">
            <div class="dim-title">📦 dim_item</div>
            <div class="dim-field">item_key (PK)</div>
            <div class="dim-field">item_name</div>
            <div class="dim-field">brand</div>
            <div class="dim-field">supplier</div>
          </div>

          <!-- dim_category — bottom-left -->
          <div class="dim-card" data-line="line-category" style="left:8%;bottom:2%">
            <div class="dim-title">🏷️ dim_category</div>
            <div class="dim-field">category_key (PK)</div>
            <div class="dim-field">category_name</div>
          </div>

          <!-- dim_status — bottom-right -->
          <div class="dim-card" data-line="line-status" style="right:8%;bottom:2%">
            <div class="dim-title">📋 dim_status</div>
            <div class="dim-field">status_key (PK)</div>
            <div class="dim-field">status_name</div>
          </div>
        </div>
      </div>

      <!-- Explanation -->
      <div class="expl-panel" style="width:240px;flex-shrink:0">
        <div style="font-size:0.75rem;font-weight:700;color:#c4b5fd;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px">OLAP Characteristics</div>
        <div class="expl-item">
          <span class="expl-icon">📊</span>
          <span class="expl-text"><strong>Fact table</strong> stores measurable borrowing activity with foreign keys to every dimension.</span>
        </div>
        <div class="expl-item">
          <span class="expl-icon">📐</span>
          <span class="expl-text"><strong>Dimension tables</strong> describe who, what, and when — enabling slice-and-dice queries.</span>
        </div>
        <div class="expl-item">
          <span class="expl-icon">⚡</span>
          <span class="expl-text"><strong>Star schema</strong> requires fewer JOINs than OLTP — typically just 1–2 joins per query.</span>
        </div>
        <div class="expl-item">
          <span class="expl-icon">📈</span>
          <span class="expl-text"><strong>Optimized for aggregations</strong> — GROUP BY, COUNT, SUM run dramatically faster.</span>
        </div>
        <div class="divider"></div>
        <div style="font-size:0.72rem;color:#94a3b8">
          <div style="margin-bottom:6px">⭐ <strong style="color:#e2e8f0">1 fact table</strong> + 5 dimensions</div>
          <div style="margin-bottom:6px">📝 <strong style="color:#e2e8f0">56,204</strong> fact rows</div>
          <div>🗓️ <strong style="color:#e2e8f0">3,650</strong> date dimension rows</div>
        </div>
      </div>
    </div>
  `;

  // Draw SVG connector lines after DOM settles
  requestAnimationFrame(() => drawStarLines());
}

function drawStarLines() {
  const svg    = document.getElementById('star-svg');
  const factEl = document.getElementById('fact-card');
  if (!svg || !factEl) return;

  const container = document.getElementById('star-schema-container');
  const cRect = container.getBoundingClientRect();

  function center(el) {
    const r = el.getBoundingClientRect();
    return {
      x: r.left - cRect.left + r.width / 2,
      y: r.top  - cRect.top  + r.height / 2,
    };
  }

  const fc = center(factEl);
  svg.innerHTML = '';

  const dimCards = document.querySelectorAll('.dim-card');
  dimCards.forEach(dc => {
    const lineId = dc.dataset.line;
    if (!lineId) return;
    const dc2 = center(dc);

    const line = document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('id', lineId);
    line.setAttribute('x1', dc2.x); line.setAttribute('y1', dc2.y);
    line.setAttribute('x2', fc.x);  line.setAttribute('y2', fc.y);
    line.setAttribute('class','star-line');
    svg.appendChild(line);
  });
}

function buildExtractSection() {
  const sec = document.getElementById('sec-extract');
  if (!sec) return;

  sec.innerHTML = `
    <div class="section-title accent-text-amber">Extract — Reading from borrowbox_oltp</div>
    <div class="section-subtitle">Pulling all relevant records from the transactional database into the staging area</div>

    <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:16px;align-items:start">
      <!-- Source tables -->
      <div>
        <div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#fcd34d;margin-bottom:10px">Source: borrowbox_oltp</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          <div class="source-card" data-src="0"><span>👤</span><span class="font-semibold">borrowers</span><span class="ml-auto text-xs text-slate-400">+related</span></div>
          <div class="source-card" data-src="1"><span>📦</span><span class="font-semibold">items</span><span class="ml-auto text-xs text-slate-400">+units</span></div>
          <div class="source-card" data-src="2"><span>📝</span><span class="font-semibold">borrow_transactions</span></div>
          <div class="source-card" data-src="3"><span>📋</span><span class="font-semibold">borrow_transaction_items</span></div>
        </div>

        <div class="card-sm mt-6" style="border-color:rgba(245,158,11,0.2)">
          <div style="font-size:0.68rem;font-weight:700;color:#fcd34d;text-transform:uppercase;letter-spacing:0.07em;margin-bottom:8px">Records Extracted</div>
          <div style="font-size:0.75rem;color:#94a3b8;line-height:2">
            <div>👤 Borrowers: <strong class="text-slate-200">906</strong></div>
            <div>📦 Items: <strong class="text-slate-200">87</strong></div>
            <div>🔩 Item Units: <strong class="text-slate-200">1,204</strong></div>
            <div>📝 Transactions: <strong class="text-slate-200">28,990</strong></div>
            <div>📋 Trans. Items: <strong class="text-slate-200">56,204</strong></div>
            <div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:6px;margin-top:4px">
              📊 Total: <strong class="text-amber-300">88,638 records</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- Flow animation center -->
      <div class="flow-arrow-wrap" style="padding-top:60px">
        <div style="font-size:0.68rem;color:#94a3b8;text-align:center;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.06em">Pipeline</div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
          ${Array.from({length:6},(_,i) => `
            <div class="flow-particle" style="background:#f59e0b;animation-delay:${i*0.22}s;opacity:0;
              animation:flow-move 1.4s linear infinite ${i*0.22}s"></div>
          `).join('')}
        </div>
        <div style="writing-mode:vertical-lr;text-orientation:mixed;transform:rotate(180deg);
          font-size:0.65rem;color:rgba(245,158,11,0.5);letter-spacing:0.1em;margin-top:10px">
          EXTRACT →
        </div>
      </div>

      <!-- Log panel -->
      <div>
        <div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#fcd34d;margin-bottom:10px">Extract Log</div>
        <div class="terminal-panel" id="extract-log" style="border-color:rgba(245,158,11,0.25);height:360px"></div>
      </div>
    </div>
  `;
}

function buildTransformSection() {
  const sec = document.getElementById('sec-transform');
  if (!sec) return;

  const transforms = [
    {
      title: 'DateTime → Date Key',
      before: '"2024-03-15 14:30:00"',
      after:  '20240315',
      desc:   'Timestamps normalized to integer YYYYMMDD keys for fast date-dimension joins.'
    },
    {
      title: 'first_name + last_name → full_name',
      before: '"Juan"  +  "dela Cruz"',
      after:  '"Juan dela Cruz"',
      desc:   'Name fields concatenated into a single denormalized column in dim_borrower.'
    },
    {
      title: 'due_date vs return_date → overdue_flag',
      before: 'due=2024-03-10, returned=2024-03-15',
      after:  'is_overdue = 1',
      desc:   'Business rule applied: return_date > due_date marks the record as overdue.'
    },
    {
      title: 'item_id → surrogate item_key',
      before: 'item_id = 42',
      after:  'item_key = 1042',
      desc:   'Surrogate keys generated to decouple the warehouse from OLTP primary keys.'
    },
  ];

  const cardsHTML = transforms.map(t => `
    <div class="transform-card">
      <div style="padding:10px 12px;font-size:0.77rem;font-weight:700;color:#cbd5e1;border-bottom:1px solid rgba(255,255,255,0.06)">
        ${t.title}
      </div>
      <div class="tf-label tf-before">Before</div>
      <div class="tf-value" style="background:rgba(255,255,255,0.03);color:#94a3b8;padding:10px 12px;font-family:monospace;font-size:0.78rem">${t.before}</div>
      <div class="tf-arrow-center">↓</div>
      <div class="tf-label tf-after">After</div>
      <div class="tf-value" style="background:rgba(244,63,94,0.08);color:#fda4af;padding:10px 12px;font-family:monospace;font-size:0.78rem">${t.after}</div>
      <div style="padding:8px 12px;font-size:0.7rem;color:#64748b;border-top:1px solid rgba(255,255,255,0.04)">${t.desc}</div>
    </div>
  `).join('');

  sec.innerHTML = `
    <div class="section-title accent-text-rose">Transform — Standardizing &amp; Restructuring Data</div>
    <div class="section-subtitle">Applying business rules, generating surrogate keys, and cleaning data before loading</div>

    <div style="display:grid;grid-template-columns:1fr 280px;gap:20px;align-items:start">
      <!-- Transform cards grid -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
        ${cardsHTML}
      </div>

      <!-- Log panel -->
      <div>
        <div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#fda4af;margin-bottom:10px">Transform Log</div>
        <div class="terminal-panel" id="transform-log" style="border-color:rgba(244,63,94,0.25);height:380px"></div>
      </div>
    </div>
  `;
}

function buildLoadSection() {
  const sec = document.getElementById('sec-load');
  if (!sec) return;

  const dims = [
    { key:'dim_date',      label:'dim_date',      icon:'📅', sub:'Date dimension' },
    { key:'dim_borrower',  label:'dim_borrower',  icon:'👤', sub:'Borrower dimension' },
    { key:'dim_item',      label:'dim_item',       icon:'📦', sub:'Item dimension' },
    { key:'dim_category',  label:'dim_category',  icon:'🏷️', sub:'Category dimension' },
    { key:'dim_status',    label:'dim_status',    icon:'📋', sub:'Status dimension' },
    { key:'fact_borrowing',label:'fact_borrowing',icon:'⭐', sub:'Fact table' },
  ];

  const dimCards = dims.map(d => `
    <div class="load-dim-card" data-table="${d.key}">
      <div class="ldim-title">${d.icon} ${d.label}</div>
      <div class="ldim-count text-slate-600" id="cnt-${d.key}">—</div>
      <div class="ldim-sub">${d.sub}</div>
    </div>
  `).join('');

  sec.innerHTML = `
    <div class="section-title accent-text-cyan">Load — Writing to borrowbox_olap</div>
    <div class="section-subtitle">Inserting transformed records into the star schema warehouse tables</div>

    <div style="display:grid;grid-template-columns:1fr 300px;gap:20px;align-items:start">
      <!-- Dimension + fact cards -->
      <div>
        <div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#67e8f9;margin-bottom:12px">Target: borrowbox_olap</div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">
          ${dimCards}
        </div>

        <div class="card mt-6" style="border-color:rgba(6,182,212,0.2)">
          <div style="font-size:0.75rem;font-weight:700;color:#67e8f9;margin-bottom:10px">Load Summary</div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;font-size:0.78rem;color:#94a3b8">
            <div>🗓️ Date rows: <strong class="text-slate-200">3,650</strong></div>
            <div>👤 Borrower rows: <strong class="text-slate-200">906</strong></div>
            <div>📦 Item rows: <strong class="text-slate-200">87</strong></div>
            <div>🏷️ Category rows: <strong class="text-slate-200">15</strong></div>
            <div>📋 Status rows: <strong class="text-slate-200">5</strong></div>
            <div>⭐ Fact rows: <strong class="text-cyan-300">56,204</strong></div>
          </div>
        </div>
      </div>

      <!-- Log panel -->
      <div>
        <div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#67e8f9;margin-bottom:10px">Load Log</div>
        <div class="terminal-panel" id="load-log" style="border-color:rgba(6,182,212,0.25);height:380px"></div>
      </div>
    </div>
  `;
}

function buildDashboardSection() {
  const sec = document.getElementById('sec-dashboard');
  if (!sec) return;

  sec.innerHTML = `
    <div class="section-title accent-text-indigo">OLAP Dashboard — BorrowBox Analytics</div>
    <div class="section-subtitle">Live insights powered by borrowbox_olap star schema queries</div>

    <!-- KPI Cards -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px">
      <div class="kpi-card" style="border-color:rgba(59,130,246,0.25)">
        <div class="kpi-label" style="color:#60a5fa">Total Borrowings</div>
        <div class="kpi-value accent-text-blue" id="kpi-total-borrowings">0</div>
        <div class="kpi-sub">All-time records</div>
      </div>
      <div class="kpi-card" style="border-color:rgba(16,185,129,0.25)">
        <div class="kpi-label" style="color:#34d399">Total Returned</div>
        <div class="kpi-value accent-text-green" id="kpi-returned">0</div>
        <div class="kpi-sub">On time + late</div>
      </div>
      <div class="kpi-card" style="border-color:rgba(245,158,11,0.25)">
        <div class="kpi-label" style="color:#fbbf24">Total Overdue</div>
        <div class="kpi-value accent-text-amber" id="kpi-overdue">0</div>
        <div class="kpi-sub">Returned late</div>
      </div>
      <div class="kpi-card" style="border-color:rgba(139,92,246,0.25)">
        <div class="kpi-label" style="color:#a78bfa">Total Borrowers</div>
        <div class="kpi-value accent-text-violet" id="kpi-borrowers">0</div>
        <div class="kpi-sub">Registered users</div>
      </div>
    </div>

    <!-- Filters row -->
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:18px;flex-wrap:wrap">
      <span style="font-size:0.72rem;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.08em">Filters:</span>
      <select class="filter-select" id="filter-year" onchange="handleFilterChange()">
        <option value="all">All Years</option>
        <option value="2024" selected>2024</option>
        <option value="2023">2023</option>
        <option value="2022">2022</option>
      </select>
      <select class="filter-select" id="filter-category">
        <option value="all">All Categories</option>
        <option>Laptops</option><option>Tablets</option><option>iPads</option>
        <option>Cameras</option><option>LCD Projectors</option>
      </select>
      <select class="filter-select" id="filter-type">
        <option value="all">All Borrower Types</option>
        <option>Student</option><option>Faculty</option><option>Staff</option><option>Guest</option>
      </select>
      <div style="margin-left:auto;font-size:0.7rem;color:#64748b">Click any chart element or table row to drill through</div>
    </div>

    <!-- Charts 2x2 -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">
      <div class="chart-card" style="height:240px">
        <div class="chart-title accent-text-blue">Borrowings by Month</div>
        <div style="flex:1;min-height:0"><canvas id="chart-by-month"></canvas></div>
      </div>
      <div class="chart-card" style="height:240px">
        <div class="chart-title accent-text-violet">Most Borrowed Categories</div>
        <div style="flex:1;min-height:0"><canvas id="chart-categories"></canvas></div>
      </div>
      <div class="chart-card" style="height:240px">
        <div class="chart-title accent-text-indigo">Borrowings by Type</div>
        <div style="flex:1;min-height:0"><canvas id="chart-borrower-types"></canvas></div>
      </div>
      <div class="chart-card" style="height:240px">
        <div class="chart-title accent-text-green">Status Distribution</div>
        <div style="flex:1;min-height:0"><canvas id="chart-status"></canvas></div>
      </div>
    </div>

    <!-- Top Items Table -->
    <div class="card" style="margin-bottom:16px">
      <div class="chart-title accent-text-indigo mb-3">Top Borrowed Items</div>
      <div style="overflow-x:auto">
        <table class="analytics-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Item Name</th>
              <th>Category</th>
              <th class="text-right">Total Borrowed</th>
            </tr>
          </thead>
          <tbody id="top-items-tbody">
            <tr><td colspan="4" class="text-center py-4 text-slate-500">Loading…</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ── Global startDemo called from Overview button ────────────────
window.startDemo = function () {
  state.isPlaying = true;
  updatePauseBtn();
  goToSection(1);
};

window.handleFilterChange = handleFilterChange;

// ── Keyboard navigation ─────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    const next = Math.min(state.currentIdx + 1, SECTIONS.length - 1);
    goToSection(next, true);
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    const prev = Math.max(state.currentIdx - 1, 0);
    goToSection(prev, true);
  } else if (e.key === ' ') {
    e.preventDefault();
    if (state.isPlaying) { pauseAuto(); state.isPlaying = false; updatePauseBtn(); }
    else { resumeAuto(); }
  } else if (e.key === 'Escape') {
    closeDrillthrough();
  }
});

window.closeDrillthrough = closeDrillthrough;

// ── Init ───────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Build all sections
  buildOverviewSection();
  buildOltpSection();
  buildOlapSection();
  buildExtractSection();
  buildTransformSection();
  buildLoadSection();
  buildDashboardSection();

  // Wire sidebar nav
  $$('.nav-item').forEach(navEl => {
    navEl.addEventListener('click', () => {
      const sectionId = navEl.dataset.section;
      const idx = SECTIONS.findIndex(s => s.id === sectionId);
      if (idx >= 0) goToSection(idx, true);
    });
  });

  // Wire control buttons
  $('#btn-restart').addEventListener('click', restartDemo);
  updatePauseBtn();

  // Activate first section
  updateSidebar(0);
  document.getElementById('sec-overview')?.classList.add('active');
  onSectionEnter('overview');

  // Start auto-pilot after 3s intro
  state.autoTimer = setTimeout(() => {
    if (state.isPlaying) scheduleNext();
  }, 3000);
});
