// ── AARYAN OS · SHARED APP LAYER ──

const APP = {
  name: 'Aaryan',
  phase: 'Phase 1 — Reset & Build',
  startDate: new Date().toISOString().slice(0, 10),
};

// ── STORAGE ──
const DB = {
  get: (key, fallback = null) => {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
  },
  set: (key, val) => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  },
  keys: {
    habits: 'aos_habits',
    checkin: 'aos_checkin',
    dsa: 'aos_dsa',
    webdev: 'aos_webdev',
    projects: 'aos_projects',
    interview: 'aos_interview',
    schedule: 'aos_schedule',
    meta: 'aos_meta',
  }
};

// ── DATE UTILS ──
const D = {
  today: () => new Date().toISOString().slice(0, 10),
  fmt: (iso, opts = {}) => new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', ...opts }),
  fmtFull: (iso) => new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
  daysSince: (iso) => Math.floor((new Date() - new Date(iso + 'T00:00:00')) / 86400000),
  weekDates: (offset = 0) => {
    const now = new Date(); now.setHours(0,0,0,0);
    const day = now.getDay();
    const mon = new Date(now); mon.setDate(now.getDate() - day + 1 + offset * 7);
    return Array.from({ length: 7 }, (_, i) => { const d = new Date(mon); d.setDate(mon.getDate() + i); return d.toISOString().slice(0, 10); });
  },
  isToday: (iso) => iso === D.today(),
  isFuture: (iso) => iso > D.today(),
  isPast: (iso) => iso < D.today(),
};

// ── HABITS DEFAULTS ──
const HABITS_DEFAULT = [
  { id: 'wake',  name: '5:00 AM wake',   cat: 'body' },
  { id: 'water', name: '4–5L water',     cat: 'body' },
  { id: 'eyes',  name: 'Eye drops',      cat: 'body' },
  { id: 'dsa',   name: 'DSA block',      cat: 'skill' },
  { id: 'skill', name: 'Skill block',    cat: 'skill' },
  { id: 'body',  name: 'Physical',       cat: 'body' },
  { id: 'nofap', name: 'No fap',         cat: 'discipline' },
  { id: 'phone', name: 'Phone control',  cat: 'discipline' },
];

// ── DRAWER ──
function initDrawer(activePage) {
  const pages = [
    { href: 'index.html',     label: 'Progress',       icon: '◈' },
    { href: 'habits.html',    label: 'Habits',          icon: '◉' },
    { href: 'checkin.html',   label: 'Nightly check-in',icon: '◇' },
    { href: 'dsa.html',       label: 'DSA tracker',     icon: '◻' },
    { href: 'webdev.html',    label: 'Web dev log',     icon: '◈' },
    { href: 'interview.html', label: 'Interviews',      icon: '◆' },
    { href: 'schedule.html',  label: 'Schedule',        icon: '◑' },
  ];

  const meta = DB.get(DB.keys.meta, { startDate: D.today() });
  const phase = DB.get('aos_phase', APP.phase);
  const dayNum = D.daysSince(meta.startDate) + 1;

  document.body.insertAdjacentHTML('afterbegin', `
    <div class="drawer-overlay" id="drawerOverlay" onclick="closeDrawer()"></div>
    <div class="drawer" id="drawer">
      <div class="drawer-header">
        <div class="drawer-name">${APP.name} OS</div>
        <div class="drawer-sub">DAY ${dayNum} · ${phase}</div>
      </div>
      <nav class="drawer-nav">
        ${pages.map(p => `
          <a class="nav-item${p.href === activePage ? ' active' : ''}" href="${p.href}">
            <span class="nav-icon">${p.icon}</span>
            <span>${p.label}</span>
          </a>`).join('')}
      </nav>
      <div class="drawer-footer">offline-first · data stays on device</div>
    </div>
    <div id="toast"></div>
  `);
}

function openDrawer() {
  document.getElementById('drawer').classList.add('open');
  document.getElementById('drawerOverlay').classList.add('open');
}
function closeDrawer() {
  document.getElementById('drawer').classList.remove('open');
  document.getElementById('drawerOverlay').classList.remove('open');
}

// ── TOPBAR ──
function initTopbar(title) {
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  const el = document.querySelector('.topbar');
  if (!el) return;
  el.innerHTML = `
    <button class="topbar-menu" onclick="openDrawer()">
      <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
        <line x1="0" y1="1" x2="18" y2="1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="0" y1="7" x2="18" y2="7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="0" y1="13" x2="18" y2="13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </button>
    <span class="topbar-title">${title}</span>
    <span class="topbar-date mono">${today}</span>
  `;
}

// ── TOAST ──
function toast(msg, dur = 2000) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), dur);
}

// ── MODAL ──
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

// ── CHART HELPERS (Chart.js) ──
const CHART_DEFAULTS = {
  color: '#4fc3f7',
  gridColor: 'rgba(255,255,255,0.05)',
  textColor: '#555555',
  fontMono: "'DM Mono', monospace",
};

function sparkBar(ctx, labels, data, color = CHART_DEFAULTS.color) {
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{ data, backgroundColor: color + '44', borderColor: color, borderWidth: 1, borderRadius: 3 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: {
        backgroundColor: '#181818', borderColor: '#2a2a2a', borderWidth: 1,
        titleColor: '#888', bodyColor: '#e8e8e8',
        titleFont: { family: CHART_DEFAULTS.fontMono, size: 10 },
        bodyFont: { family: CHART_DEFAULTS.fontMono, size: 12 },
      }},
      scales: {
        x: { grid: { color: CHART_DEFAULTS.gridColor }, ticks: { color: CHART_DEFAULTS.textColor, font: { family: CHART_DEFAULTS.fontMono, size: 10 } } },
        y: { grid: { color: CHART_DEFAULTS.gridColor }, ticks: { color: CHART_DEFAULTS.textColor, font: { family: CHART_DEFAULTS.fontMono, size: 10 } }, beginAtZero: true }
      }
    }
  });
}

function sparkLine(ctx, labels, datasets) {
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: datasets.map(ds => ({
        ...ds,
        tension: 0.4, fill: true,
        backgroundColor: (ds.color || CHART_DEFAULTS.color) + '15',
        borderColor: ds.color || CHART_DEFAULTS.color,
        borderWidth: 1.5,
        pointBackgroundColor: ds.color || CHART_DEFAULTS.color,
        pointRadius: 3, pointHoverRadius: 5,
      }))
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: datasets.length > 1, labels: { color: '#888', font: { family: CHART_DEFAULTS.fontMono, size: 10 }, boxWidth: 8 } },
        tooltip: {
          backgroundColor: '#181818', borderColor: '#2a2a2a', borderWidth: 1,
          titleColor: '#888', bodyColor: '#e8e8e8',
          titleFont: { family: CHART_DEFAULTS.fontMono, size: 10 },
          bodyFont: { family: CHART_DEFAULTS.fontMono, size: 12 },
        }
      },
      scales: {
        x: { grid: { color: CHART_DEFAULTS.gridColor }, ticks: { color: CHART_DEFAULTS.textColor, font: { family: CHART_DEFAULTS.fontMono, size: 10 } } },
        y: { grid: { color: CHART_DEFAULTS.gridColor }, ticks: { color: CHART_DEFAULTS.textColor, font: { family: CHART_DEFAULTS.fontMono, size: 10 } }, beginAtZero: true }
      }
    }
  });
}

function doughnut(ctx, labels, data, colors) {
  return new Chart(ctx, {
    type: 'doughnut',
    data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 0, hoverOffset: 4 }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      cutout: '70%',
      plugins: {
        legend: { position: 'bottom', labels: { color: '#888', font: { family: CHART_DEFAULTS.fontMono, size: 10 }, boxWidth: 8, padding: 12 } },
        tooltip: {
          backgroundColor: '#181818', borderColor: '#2a2a2a', borderWidth: 1,
          titleColor: '#888', bodyColor: '#e8e8e8',
          titleFont: { family: CHART_DEFAULTS.fontMono, size: 10 },
          bodyFont: { family: CHART_DEFAULTS.fontMono, size: 12 },
        }
      }
    }
  });
}

// ── HABIT SCORE TODAY ──
function getTodayHabitScore() {
  const data = DB.get(DB.keys.habits, {});
  const today = D.today();
  const todayData = data[today] || {};
  const done = HABITS_DEFAULT.filter(h => todayData[h.id]).length;
  return { done, total: HABITS_DEFAULT.length, pct: Math.round(done / HABITS_DEFAULT.length * 100) };
}

// ── DSA STATS ──
function getDSAStats() {
  const problems = DB.get(DB.keys.dsa, []);
  const total = problems.length;
  const done = problems.filter(p => p.status === 'done').length;
  const retry = problems.filter(p => p.status === 'retry').length;
  const watched = problems.filter(p => p.status === 'watched').length;
  const today = problems.filter(p => p.date === D.today()).length;
  return { total, done, retry, watched, today };
}

// ── INTERVIEW STATS ──
function getInterviewStats() {
  const apps = DB.get(DB.keys.interview, []);
  return {
    total: apps.length,
    applied: apps.filter(a => a.status === 'applied').length,
    inProgress: apps.filter(a => ['screening','r1','r2','r3'].includes(a.status)).length,
    offer: apps.filter(a => a.status === 'offer').length,
    rejected: apps.filter(a => a.status === 'rejected').length,
  };
}
