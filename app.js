// ── AARYAN OS · SHARED APP LAYER ──

const APP = {
  name: 'Aaryan',
  phase: 'Phase 1 — Reset & Build',
  startDate: '2025-04-01',
};

const DB = {
  get: (key, fallback = null) => {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
  },
  set: (key, val) => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  },
  keys: {
    habits:       'aos_habits',
    habitDefs:    'aos_habit_defs',
    habitDeleted: 'aos_habit_deleted',
    habitDetail:  'aos_habit_detail',
    checkin:      'aos_checkin',
    dsa:          'aos_dsa',
    webdev:       'aos_webdev',
    projects:     'aos_projects',
    interview:    'aos_interview',
    schedule:     'aos_schedule',
    scheduleDef:  'aos_schedule_def',
    meta:         'aos_meta',
  }
};

const D = {
  today: () => new Date().toISOString().slice(0, 10),
  fmt: (iso) => { if (!iso) return '—'; return new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }); },
  fmtFull: (iso) => { if (!iso) return '—'; return new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }); },
  daysSince: (iso) => Math.max(0, Math.floor((new Date() - new Date(iso + 'T00:00:00')) / 86400000)),
  weekDates: (offset = 0) => {
    const now = new Date(); now.setHours(0,0,0,0);
    const day = now.getDay();
    const mon = new Date(now);
    mon.setDate(now.getDate() - (day === 0 ? 6 : day - 1) + offset * 7);
    return Array.from({ length: 7 }, (_, i) => { const d = new Date(mon); d.setDate(mon.getDate() + i); return d.toISOString().slice(0,10); });
  },
  isToday: (iso) => iso === D.today(),
  isFuture: (iso) => iso > D.today(),
  isPast: (iso) => iso < D.today(),
  addDays: (iso, n) => { const d = new Date(iso + 'T00:00:00'); d.setDate(d.getDate() + n); return d.toISOString().slice(0,10); },
  monthStart: (iso) => iso.slice(0,7) + '-01',
  monthLabel: (iso) => new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
  yearLabel: (iso) => new Date(iso + 'T00:00:00').getFullYear().toString(),
};

const HABITS_BUILTIN = [
  { id: 'wake',  name: '5:00 AM wake',   cat: 'body',       template: null },
  { id: 'water', name: 'Water intake',   cat: 'body',       template: 'water' },
  { id: 'eyes',  name: 'Eye drops',      cat: 'body',       template: 'eyes' },
  { id: 'dsa',   name: 'DSA block',      cat: 'skill',      template: null },
  { id: 'learn', name: 'Learning/Study', cat: 'skill',      template: 'learn' },
  { id: 'body',  name: 'Physical',       cat: 'body',       template: 'physical' },
  { id: 'nofap', name: 'No fap',         cat: 'discipline', template: null },
  { id: 'phone', name: 'Phone control',  cat: 'discipline', template: null },
];

function getHabits() { return DB.get(DB.keys.habitDefs, HABITS_BUILTIN); }
function getActiveHabits() { return getHabits().filter(h => !h.deleted); }

function initDrawer(activePage) {
  const pages = [
    { href: 'index.html',     label: 'Progress',         icon: '◈' },
    { href: 'habits.html',    label: 'Habits',            icon: '◉' },
    { href: 'checkin.html',   label: 'Nightly check-in',  icon: '◇' },
    { href: 'dsa.html',       label: 'DSA tracker',       icon: '◻' },
    { href: 'webdev.html',    label: 'Web dev log',       icon: '▣' },
    { href: 'interview.html', label: 'Interviews',        icon: '◆' },
    { href: 'schedule.html',  label: 'Schedule',          icon: '◑' },
  ];
  const dayNum = D.daysSince(APP.startDate) + 1;
  const phase = DB.get('aos_phase', APP.phase);
  document.body.insertAdjacentHTML('afterbegin', `
    <div class="drawer-overlay" id="drawerOverlay" onclick="closeDrawer()"></div>
    <div class="drawer" id="drawer">
      <div class="drawer-header">
        <div class="drawer-name">${APP.name} OS</div>
        <div class="drawer-sub">DAY ${dayNum} · ${phase}</div>
      </div>
      <nav class="drawer-nav">
        ${pages.map(p => `<a class="nav-item${p.href===activePage?' active':''}" href="${p.href}"><span class="nav-icon">${p.icon}</span><span>${p.label}</span></a>`).join('')}
      </nav>
      <div class="drawer-footer">offline-first · data stays on device</div>
    </div>
    <div id="toast"></div>
  `);
}

function openDrawer()  { document.getElementById('drawer').classList.add('open'); document.getElementById('drawerOverlay').classList.add('open'); }
function closeDrawer() { document.getElementById('drawer').classList.remove('open'); document.getElementById('drawerOverlay').classList.remove('open'); }

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
    <span class="topbar-date mono">${today}</span>`;
}

function toast(msg, dur = 2200) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), dur);
}

function openModal(id)  { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

const CHART_FM = "'DM Mono', monospace";
const CHART_TOOLTIP = { backgroundColor:'#181818', borderColor:'#2a2a2a', borderWidth:1, titleColor:'#888', bodyColor:'#e8e8e8', titleFont:{family:CHART_FM,size:10}, bodyFont:{family:CHART_FM,size:12} };
const CHART_SCALE = (extra={}) => ({ grid:{color:'rgba(255,255,255,0.04)'}, ticks:{color:'#444',font:{family:CHART_FM,size:10}}, ...extra });

function sparkBar(ctx, labels, data, color='#4fc3f7') {
  return new Chart(ctx, {
    type:'bar',
    data:{ labels, datasets:[{ data, backgroundColor:color+'44', borderColor:color, borderWidth:1, borderRadius:3 }] },
    options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false},tooltip:CHART_TOOLTIP}, scales:{x:CHART_SCALE(),y:CHART_SCALE({beginAtZero:true})} }
  });
}

function sparkLine(ctx, labels, datasets) {
  return new Chart(ctx, {
    type:'line',
    data:{ labels, datasets: datasets.map(ds=>({ ...ds, tension:0.4, fill:true, backgroundColor:(ds.color||'#4fc3f7')+'15', borderColor:ds.color||'#4fc3f7', borderWidth:1.5, pointBackgroundColor:ds.color||'#4fc3f7', pointRadius:3, pointHoverRadius:5, spanGaps:true })) },
    options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{display:datasets.length>1, labels:{color:'#888',font:{family:CHART_FM,size:10},boxWidth:8}}, tooltip:CHART_TOOLTIP }, scales:{x:CHART_SCALE(),y:CHART_SCALE({beginAtZero:true})} }
  });
}

function doughnut(ctx, labels, data, colors) {
  return new Chart(ctx, {
    type:'doughnut',
    data:{ labels, datasets:[{ data, backgroundColor:colors, borderWidth:0, hoverOffset:4 }] },
    options:{ responsive:true, maintainAspectRatio:false, cutout:'70%', plugins:{ legend:{position:'bottom',labels:{color:'#888',font:{family:CHART_FM,size:10},boxWidth:8,padding:12}}, tooltip:CHART_TOOLTIP } }
  });
}

// ── SPIRAL GRAPH ──
function drawSpiral(canvas, dailyScores, opts={}) {
  const { label='Score', color='#4fc3f7', maxVal=100 } = opts;
  // NEW
  const explicit = parseInt(canvas.style.width) || 0;
  const fromParent = canvas.parentElement ? canvas.parentElement.clientWidth - 32 : 0;
  const W = Math.max(explicit, fromParent, 140);
  if (W < 10) return;
  canvas.width = Math.round(W * devicePixelRatio);
  canvas.height = Math.round(W * devicePixelRatio);
  canvas.style.width = W + 'px';
  canvas.style.height = W + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(devicePixelRatio, devicePixelRatio);
  ctx.clearRect(0,0,W,W);
  const cx=W/2, cy=W/2, maxR=W/2-16, minR=22;
  const n = dailyScores.length;
  if (n === 0) { ctx.fillStyle='#444'; ctx.font=`400 11px ${CHART_FM}`; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('no data yet', cx, cy); return; }

  const totalAngle = Math.max(n,7) * (Math.PI*2/7);

  // faint rings
  const rings = Math.ceil(totalAngle/(Math.PI*2));
  for (let t=1; t<=rings; t++) {
    const r = minR + (maxR-minR)*(t/rings);
    ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2);
    ctx.strokeStyle='rgba(255,255,255,0.035)'; ctx.lineWidth=0.5; ctx.stroke();
  }

  const getP = (i) => {
    const angle = -Math.PI/2 + (i/Math.max(n-1,1))*totalAngle;
    const r = minR + (maxR-minR)*(i/Math.max(n-1,1));
    return { x: cx+r*Math.cos(angle), y: cy+r*Math.sin(angle) };
  };

  // path line
  ctx.beginPath();
  for (let i=0; i<n; i++) { const p=getP(i); if(i===0) ctx.moveTo(p.x,p.y); else ctx.lineTo(p.x,p.y); }
  ctx.strokeStyle=color+'22'; ctx.lineWidth=1; ctx.stroke();

  // dots
  for (let i=0; i<n; i++) {
    const score=dailyScores[i];
    if (score===null||score===undefined) continue;
    const p=getP(i), pct=score/maxVal;
    ctx.beginPath(); ctx.arc(p.x,p.y,1.5+pct*3.5,0,Math.PI*2);
    ctx.fillStyle = color+Math.round((0.3+pct*0.7)*255).toString(16).padStart(2,'0');
    ctx.fill();
  }

  // today
  const lastP=getP(n-1);
  ctx.beginPath(); ctx.arc(lastP.x,lastP.y,5,0,Math.PI*2); ctx.fillStyle=color; ctx.fill();
  ctx.beginPath(); ctx.arc(lastP.x,lastP.y,9,0,Math.PI*2); ctx.strokeStyle=color+'44'; ctx.lineWidth=1.5; ctx.stroke();

  // center text
  const lastScore = [...dailyScores].reverse().find(s=>s!==null&&s!==undefined);
  ctx.fillStyle='#e8e8e8'; ctx.font=`700 ${Math.round(W*0.1)}px 'Syne',sans-serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText(lastScore!==undefined ? Math.round(lastScore)+'%' : '—', cx, cy-7);
  ctx.fillStyle='#555'; ctx.font=`400 ${Math.round(W*0.055)}px ${CHART_FM}`;
  ctx.fillText(label, cx, cy+Math.round(W*0.09));
}

// ── DATA HELPERS ──
function getTodayHabitScore(dateKey) {
  const date = dateKey || D.today();
  const habits = DB.get(DB.keys.habits, {});
  const active = getActiveHabits();
  const dayData = habits[date] || {};
  const done = active.filter(h => dayData[h.id]).length;
  return { done, total: active.length, pct: active.length ? Math.round(done/active.length*100) : 0 };
}

function getDSAStats(dateKey) {
  const problems = DB.get(DB.keys.dsa, []);
  const date = dateKey || D.today();
  return {
    total: problems.length,
    done: problems.filter(p=>['done','no-help'].includes(p.status)).length,
    retry: problems.filter(p=>['retry','hint'].includes(p.status)).length,
    watched: problems.filter(p=>p.status==='watched').length,
    today: problems.filter(p=>p.date===date).length,
  };
}

function getInterviewStats() {
  const apps = DB.get(DB.keys.interview, []);
  return {
    total: apps.length,
    inProgress: apps.filter(a=>['screening','r1','r2','r3'].includes(a.status)).length,
    offer: apps.filter(a=>a.status==='offer').length,
  };
}

function getDayOverallScore(dateKey) {
  const h = getTodayHabitScore(dateKey);
  const dsa = getDSAStats(dateKey);
  const web = DB.get(DB.keys.webdev,[]).filter(l=>l.date===dateKey).length;
  return Math.round(h.pct*0.5 + Math.min(dsa.today*25,25) + (web>0?25:0));
}
