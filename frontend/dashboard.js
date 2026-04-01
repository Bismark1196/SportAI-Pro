/* ═══════════════════════════════════════════
   SportAI Dashboard — dashboard.js
═══════════════════════════════════════════ */

// ── Auth Guard ──────────────────────────────
(function(){
  const session = localStorage.getItem('sportai_session');
  if(!session && !window.location.pathname.includes('dashboard.html')) return;
  if(!session){
    window.location.href = 'login.html';
    return;
  }
  const user = JSON.parse(session);
  // Populate user info across UI
  document.addEventListener('DOMContentLoaded', () => {
    const av = user.initials || (user.name||'?').split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);
    const setTxt = (id, txt) => { const el = document.getElementById(id); if(el) el.textContent = txt; };
    document.querySelectorAll('.user-avatar').forEach(el => el.textContent = av);
    setTxt('um-avatar', av); setTxt('um-name', user.name||'User'); setTxt('um-email', user.email||'');
    setTxt('um-plan', user.plan||'PRO');
    setTxt('lb-me-av', av); setTxt('lb-me-name', (user.name||'User').split(' ')[0] + ' S.');
    setTxt('settings-name', user.name||'User'); setTxt('settings-email', user.email||'');
    setTxt('settings-plan', user.plan||'PRO');
    const planEl = document.getElementById('settings-plan');
    if(planEl) { planEl.textContent = user.plan||'PRO'; planEl.className = 'plan-badge plan-'+(user.plan||'pro').toLowerCase(); }
    const welcome = document.getElementById('dash-welcome');
    if(welcome) welcome.textContent = `Welcome back, ${(user.name||'User').split(' ')[0]}. Here's today's overview.`;
  });
})();

function doLogout(){
  localStorage.removeItem('sportai_session');
  window.location.href = 'login.html';
}

// ── Data ─────────────────────────────────────
const MATCHES = [
  {id:1,home:'Manchester City',away:'Arsenal',league:'Premier League',flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿',time:'LIVE 73\'',status:'live',score:'2-1',hp:58,dp:22,ap:20,h:'1.72',d:'3.50',a:'4.80',ev:'high',conf:92},
  {id:2,home:'Real Madrid',away:'Barcelona',league:'La Liga',flag:'🇪🇸',time:'LIVE 45+2\'',status:'live',score:'1-0',hp:52,dp:25,ap:23,h:'1.90',d:'3.30',a:'4.20',ev:'med',conf:81},
  {id:3,home:'Bayern Munich',away:'Dortmund',league:'Bundesliga',flag:'🇩🇪',time:'20:30',status:'upcoming',score:null,hp:62,dp:20,ap:18,h:'1.55',d:'4.00',a:'5.50',ev:'high',conf:88},
  {id:4,home:'Juventus',away:'AC Milan',league:'Serie A',flag:'🇮🇹',time:'20:45',status:'upcoming',score:null,hp:44,dp:28,ap:28,h:'2.20',d:'3.10',a:'3.20',ev:'high',conf:74},
  {id:5,home:'PSG',away:'Lyon',league:'Ligue 1',flag:'🇫🇷',time:'21:00',status:'upcoming',score:null,hp:66,dp:18,ap:16,h:'1.40',d:'4.50',a:'7.00',ev:'low',conf:83},
  {id:6,home:'Chelsea',away:'Liverpool',league:'Premier League',flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿',time:'17:30',status:'upcoming',score:null,hp:38,dp:28,ap:34,h:'2.60',d:'3.20',a:'2.80',ev:'med',conf:69},
  {id:7,home:'Atletico Madrid',away:'Sevilla',league:'La Liga',flag:'🇪🇸',time:'LIVE 61\'',status:'live',score:'0-0',hp:54,dp:29,ap:17,h:'1.85',d:'3.40',a:'4.60',ev:'med',conf:77},
  {id:8,home:'Inter Milan',away:'Napoli',league:'Serie A',flag:'🇮🇹',time:'19:45',status:'upcoming',score:null,hp:47,dp:26,ap:27,h:'2.05',d:'3.20',a:'3.60',ev:'high',conf:86},
];

const NOTIFICATIONS = [
  {icon:'⚽',color:'#ef4444',text:'GOAL! Manchester City 3-1 Arsenal (82\')',time:'2 min ago'},
  {icon:'🎯',color:'#22c55e',text:'Value bet identified: Bayern Munich Home Win at 1.55 — +EV detected',time:'8 min ago'},
  {icon:'🤖',color:'#3b82f6',text:'AI model updated: DeepMatch v3.2 recalibrated for GW30',time:'2 hrs ago'},
  {icon:'💰',color:'#f0b429',text:'Your prediction on Juventus vs AC Milan was correct! +£18.40',time:'Yesterday'},
  {icon:'📡',color:'#8b5cf6',text:'New match data loaded: 14 fixtures added for this weekend',time:'Yesterday'},
];

const HISTORY_DATA = [
  {match:'Man City vs Arsenal',sel:'Home Win',odds:1.72,stake:10,result:'won',profit:7.20,date:'Today'},
  {match:'Real Madrid vs Barcelona',sel:'Draw No Bet',odds:2.10,stake:10,result:'pending',profit:null,date:'Today'},
  {match:'Bayern vs Dortmund',sel:'Over 2.5',odds:1.65,stake:15,result:'won',profit:9.75,date:'Yesterday'},
  {match:'PSG vs Lyon',sel:'PSG Win',odds:1.40,stake:20,result:'won',profit:8.00,date:'Yesterday'},
  {match:'Chelsea vs Man Utd',sel:'Both Teams Score',odds:1.80,stake:10,result:'lost',profit:-10.00,date:'28 Mar'},
  {match:'Juventus vs Milan',sel:'Juventus Win',odds:2.20,stake:10,result:'won',profit:12.00,date:'27 Mar'},
  {match:'Liverpool vs Everton',sel:'Liverpool Win',odds:1.30,stake:25,result:'won',profit:7.50,date:'26 Mar'},
  {match:'Atletico vs Sevilla',sel:'Under 2.5',odds:1.90,stake:10,result:'lost',profit:-10.00,date:'25 Mar'},
];

const LEADERBOARD_DATA = [
  {rank:1,init:'JS',name:'John S.',bets:284,acc:'94.3%',profit:'+£3,840',roi:'+31.2%',me:true},
  {rank:2,init:'MR',name:'Maria R.',bets:319,acc:'91.8%',profit:'+£2,140',roi:'+24.1%'},
  {rank:3,init:'DK',name:'David K.',bets:201,acc:'89.4%',profit:'+£1,920',roi:'+22.8%'},
  {rank:4,init:'SA',name:'Sarah A.',bets:445,acc:'87.2%',profit:'+£1,480',roi:'+19.7%'},
  {rank:5,init:'TN',name:'Tom N.',bets:178,acc:'85.6%',profit:'+£1,120',roi:'+17.9%'},
  {rank:6,init:'PL',name:'Paul L.',bets:392,acc:'84.1%',profit:'+£980',roi:'+15.2%'},
  {rank:7,init:'CW',name:'Claire W.',bets:267,acc:'82.7%',profit:'+£760',roi:'+13.4%'},
  {rank:8,init:'RB',name:'Ryan B.',bets:155,acc:'81.0%',profit:'+£640',roi:'+12.1%'},
];

// ── State ─────────────────────────────────────
let betslip = [];
let currentPage = 'dashboard';
let dashFilter = 'all';
let predFilter = 'all';
let isSidebarOpen = false;

// ── Init ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initTicker();
  renderDashMatches();
  renderTopValueBets();
  renderPerfChart();
  renderPredictions();
  renderLive();
  renderHeatmap();
  renderMonthlyChart();
  renderLeaderboard();
  renderHistory();
  renderNotifications();
  setupFilters();
  updateBetslipBadge();

  // Auto-close user menu on outside click
  document.addEventListener('click', e => {
    const menu = document.getElementById('user-menu');
    const btn = document.getElementById('user-btn');
    if(menu && !menu.contains(e.target) && !btn.contains(e.target)) {
      menu.classList.remove('show');
    }
    const notif = document.getElementById('notif-panel');
    const nb = document.getElementById('notif-btn');
    if(notif && !notif.contains(e.target) && !nb.contains(e.target)) {
      notif.classList.remove('show');
    }
  });

  // Animate ticker values
  setTimeout(() => {
    const liveCount = MATCHES.filter(m => m.status === 'live').length;
    const valueCount = MATCHES.filter(m => m.ev === 'high').length;
    setTicker('t-total', MATCHES.length);
    setTicker('t-live', liveCount);
    setTicker('t-value', valueCount);
    setEl('dash-live', liveCount);
    setEl('dash-value', valueCount);
    document.getElementById('live-badge').textContent = liveCount;
    document.getElementById('val-badge').textContent = valueCount;
    const mob_lb = document.getElementById('mob-live-badge');
    const mob_vb = document.getElementById('mob-val-badge');
    if(mob_lb) mob_lb.textContent = liveCount;
    if(mob_vb) mob_vb.textContent = valueCount;
    document.getElementById('t-updated').textContent = 'Updated ' + new Date().toLocaleTimeString();
  }, 600);
});

function setTicker(id, val) { const el = document.getElementById(id); if(el) el.textContent = val; }
function setEl(id, val) { const el = document.getElementById(id); if(el) el.textContent = val; }

// ── Navigation ────────────────────────────────
function initNav() {
  document.querySelectorAll('[data-page]').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.page));
  });
}

function navigateTo(page) {
  currentPage = page;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const pageEl = document.getElementById('page-' + page);
  if(pageEl) pageEl.classList.add('active');
  document.querySelectorAll('[data-page="' + page + '"]').forEach(n => n.classList.add('active'));
  // Scroll to top
  const main = document.getElementById('main-content');
  if(main) main.scrollTop = 0;
  // Close sidebar on mobile
  if(window.innerWidth <= 900) closeSidebar();
}

function mobileNav(el, page) {
  document.querySelectorAll('.mob-nav-item').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  navigateTo(page);
}

function toggleSidebar() {
  isSidebarOpen = !isSidebarOpen;
  const sb = document.getElementById('sidebar');
  const ol = document.getElementById('sidebar-overlay');
  const hb = document.getElementById('hamburger');
  if(isSidebarOpen){ sb.classList.add('mobile-open'); ol.classList.add('show'); hb.classList.add('open'); }
  else { closeSidebar(); }
}
function closeSidebar() {
  isSidebarOpen = false;
  document.getElementById('sidebar').classList.remove('mobile-open');
  document.getElementById('sidebar-overlay').classList.remove('show');
  document.getElementById('hamburger').classList.remove('open');
}

function toggleUserMenu() {
  document.getElementById('user-menu').classList.toggle('show');
  document.getElementById('notif-panel').classList.remove('show');
}
function toggleNotif() {
  document.getElementById('notif-panel').classList.toggle('show');
  document.getElementById('user-menu').classList.remove('show');
}
function toggleBetslip() {
  document.getElementById('betslip-panel').classList.toggle('open');
}

// ── Ticker ────────────────────────────────────
function initTicker() {
  const ticker = document.querySelector('.stats-ticker');
  if(ticker) ticker.scrollLeft = 0;
}

// ── Render: Dashboard Matches ────────────────
function renderDashMatches(filter = 'all') {
  const container = document.getElementById('dash-matches');
  if(!container) return;
  const data = filter === 'all' ? MATCHES : MATCHES.filter(m => m.status === filter);
  if(!data.length){ container.innerHTML = '<div class="loading-state"><p style="color:var(--text3)">No matches for this filter.</p></div>'; return; }

  container.innerHTML = data.map(m => `
    <div class="match-row" style="grid-template-columns:1fr 180px 55px 55px 55px 65px">
      <div>
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px">
          <span style="font-size:13px">${m.flag}</span>
          <span class="match-team">${m.home} vs ${m.away}</span>
          ${m.status==='live'?`<span class="comp-badge live" style="font-size:9px;padding:1px 5px">${m.time}</span>`:''}
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <span class="match-league">${m.league}</span>
          ${m.status==='upcoming'?`<span style="font-size:10px;color:var(--text3)">${m.time}</span>`:''}
          ${m.score?`<span style="font-family:var(--f-cond);font-size:13px;font-weight:800;color:#fff">${m.score}</span>`:''}
        </div>
      </div>
      <div>
        <div class="prob-bar" style="margin-bottom:2px">
          <div class="pb-home" style="width:${m.hp}%"></div>
          <div class="pb-draw" style="width:${m.dp}%"></div>
          <div class="pb-away" style="width:${m.ap}%"></div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:9px;color:var(--text3)"><span>${m.hp}%</span><span>${m.dp}%</span><span>${m.ap}%</span></div>
      </div>
      <div class="odds-cell" onclick="addToSlip('${m.home}','Home Win','${m.h}')">${m.h}</div>
      <div class="odds-cell" onclick="addToSlip('${m.home} vs ${m.away}','Draw','${m.d}')">${m.d}</div>
      <div class="odds-cell" onclick="addToSlip('${m.away}','Away Win','${m.a}')">${m.a}</div>
      <div style="text-align:center"><span class="value-badge ${m.ev==='high'?'vb-high':m.ev==='med'?'vb-med':'vb-low'}">${m.ev==='high'?'🔥 HIGH':m.ev==='med'?'✓ MED':'— LOW'}</span></div>
    </div>`).join('');
}

// ── Render: Top Value Bets ────────────────────
function renderTopValueBets() {
  const container = document.getElementById('top-value-list');
  if(!container) return;
  const valueBets = MATCHES.filter(m => m.ev === 'high').slice(0, 4);
  container.innerHTML = valueBets.map(m => `
    <div style="padding:10px 14px;border-bottom:1px solid var(--border);cursor:pointer;transition:.2s" onmouseover="this.style.background='rgba(255,255,255,.03)'" onmouseout="this.style.background='transparent'">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:3px">
        <span style="font-size:12px;font-weight:600;color:var(--text1)">${m.home}</span>
        <span class="value-badge vb-high" style="font-size:9px">HIGH EV</span>
      </div>
      <div style="font-size:10px;color:var(--text3);margin-bottom:5px">${m.flag} ${m.league} · Home Win</div>
      <div style="display:flex;align-items:center;justify-content:space-between">
        <span style="font-family:var(--f-cond);font-size:22px;font-weight:800;color:var(--gold)">${m.h}</span>
        <div style="text-align:right">
          <div style="font-size:10px;color:var(--text3)">Confidence</div>
          <div style="font-family:var(--f-cond);font-size:14px;font-weight:700;color:var(--green)">${m.conf}%</div>
        </div>
      </div>
    </div>`).join('');
}

// ── Render: Predictions Page ──────────────────
function renderPredictions(filter = 'all') {
  const container = document.getElementById('pred-container');
  if(!container) return;
  const data = filter === 'all' ? MATCHES :
    filter === 'live' ? MATCHES.filter(m => m.status === 'live') :
    filter === 'value' ? MATCHES.filter(m => m.ev === 'high') :
    MATCHES.filter(m => m.status === 'upcoming');

  if(!data.length){ container.innerHTML = '<div class="loading-state"><p style="color:var(--text3)">No predictions for this filter.</p></div>'; return; }

  container.innerHTML = data.map(m => `
    <div class="pc-card">
      <div class="pc-header">
        <div>
          <span style="font-size:12px">${m.flag}</span>
          <span class="pc-league" style="margin-left:5px">${m.league}</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px">
          ${m.status==='live'?`<span class="comp-badge live">${m.time}</span>`:`<span class="comp-badge upcoming">${m.time}</span>`}
          ${m.ev==='high'?`<span class="value-badge vb-high" style="font-size:9px">HIGH EV</span>`:''}
        </div>
      </div>
      <div class="pc-body">
        <div class="vs-row" style="margin-bottom:0">
          <div class="vs-team">
            <div class="vst-name">${m.home}</div>
            ${m.score?`<div style="font-family:var(--f-cond);font-size:28px;font-weight:800;color:#fff;line-height:1.1">${m.score.split('-')[0]}</div>`:''}
          </div>
          <div style="text-align:center">
            ${m.score?`<div style="font-family:var(--f-cond);font-size:13px;color:var(--text3);margin-bottom:4px">SCORE</div><div style="font-family:var(--f-cond);font-size:24px;font-weight:800">${m.score}</div>`:`<div style="font-family:var(--f-cond);font-size:12px;font-weight:700;color:var(--text2)">VS</div>`}
          </div>
          <div class="vs-team away">
            <div class="vst-name">${m.away}</div>
            ${m.score?`<div style="font-family:var(--f-cond);font-size:28px;font-weight:800;color:#fff;line-height:1.1">${m.score.split('-')[1]}</div>`:''}
          </div>
        </div>
        <div class="pc-probs">
          <div class="pc-prob-seg ${m.hp>m.dp&&m.hp>m.ap?'seg-best':''}" onclick="addToSlip('${m.home}','Home Win','${m.h}')">
            <div class="pps-lbl">Home Win</div><div class="pps-val">${m.hp}%</div><div class="pps-odds">${m.h}</div>
          </div>
          <div class="pc-prob-seg ${m.dp>m.hp&&m.dp>m.ap?'seg-best':''}" onclick="addToSlip('${m.home} vs ${m.away}','Draw','${m.d}')">
            <div class="pps-lbl">Draw</div><div class="pps-val">${m.dp}%</div><div class="pps-odds">${m.d}</div>
          </div>
          <div class="pc-prob-seg ${m.ap>m.hp&&m.ap>m.dp?'seg-best':''}" onclick="addToSlip('${m.away}','Away Win','${m.a}')">
            <div class="pps-lbl">Away Win</div><div class="pps-val">${m.ap}%</div><div class="pps-odds">${m.a}</div>
          </div>
        </div>
        <div class="ai-insight-row">
          <span class="ai-icon">🤖</span>
          <span><strong>AI (${m.conf}% conf.):</strong> ${getInsight(m)}</span>
        </div>
      </div>
    </div>`).join('');
}

function getInsight(m) {
  const insights = {
    1:'Man City dominant with 68% possession. 7 shots on target. Home Win at 1.72 represents strong value.',
    2:'El Clásico. Real Madrid home advantage is significant. Narrow win probability edge for home side.',
    3:'Bayern in top form (W6 last 7). Dortmund missing key midfielder. Home Win highly recommended.',
    4:'Tight match expected. Both teams in good form. xG models suggest close contest — value in draw.',
    5:'PSG heavy favourites. High-probability but low-value bet. Consider Over 2.5 as alternative.',
    6:'Form is even. Both teams last 5 games point to competitive match. Draw has value at 3.20.',
    7:'Atletico strong defensive record at home. Sevilla away form poor. Home Win looks underpriced.',
    8:'Inter top-4 clash. Both teams on excellent form. High expected goals — Over 2.5 recommended.',
  };
  return insights[m.id] || `${m.home} home advantage is key. Model confidence: ${m.conf}%.`;
}

// ── Render: Live Centre ───────────────────────
function renderLive() {
  const container = document.getElementById('live-container');
  if(!container) return;
  const liveMatches = MATCHES.filter(m => m.status === 'live');
  if(!liveMatches.length){ container.innerHTML = '<div class="loading-state"><p style="color:var(--text3)">No live matches at the moment. Check back soon.</p></div>'; return; }

  container.innerHTML = liveMatches.map(m => `
    <div class="live-match-card is-live">
      <div class="lm-header">
        <div style="display:flex;align-items:center;gap:8px">
          <span>${m.flag}</span>
          <span style="font-size:12px;color:var(--text2)">${m.league}</span>
          <span class="comp-badge live">${m.time}</span>
        </div>
        <div style="display:flex;gap:6px">
          <span class="value-badge ${m.ev==='high'?'vb-high':'vb-med'}">${m.ev==='high'?'HIGH EV':'MED EV'}</span>
        </div>
      </div>
      <div class="lm-score-row">
        <div class="lm-team">${m.home}</div>
        <div class="lm-score">${m.score}</div>
        <div class="lm-team away">${m.away}</div>
      </div>
      <div style="margin-top:12px">
        <div class="prob-bar" style="height:8px;margin-bottom:4px">
          <div class="pb-home" style="width:${m.hp}%"></div>
          <div class="pb-draw" style="width:${m.dp}%"></div>
          <div class="pb-away" style="width:${m.ap}%"></div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text3)">
          <span>${m.home} ${m.hp}%</span><span>Draw ${m.dp}%</span><span>${m.away} ${m.ap}%</span>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px">
        <div class="odds-cell" onclick="addToSlip('${m.home}','Home Win','${m.h}')" style="background:var(--bg3);border-radius:6px">
          <div style="font-size:9px;color:var(--text3);margin-bottom:2px">HOME</div>${m.h}
        </div>
        <div class="odds-cell" onclick="addToSlip('${m.home} vs ${m.away}','Draw','${m.d}')" style="background:var(--bg3);border-radius:6px">
          <div style="font-size:9px;color:var(--text3);margin-bottom:2px">DRAW</div>${m.d}
        </div>
        <div class="odds-cell" onclick="addToSlip('${m.away}','Away Win','${m.a}')" style="background:var(--bg3);border-radius:6px">
          <div style="font-size:9px;color:var(--text3);margin-bottom:2px">AWAY</div>${m.a}
        </div>
      </div>
      <div class="ai-insight-row" style="margin-top:12px"><span class="ai-icon">🤖</span><span>${getInsight(m)}</span></div>
    </div>`).join('');
}

// ── Render: Charts ────────────────────────────
const PERF = [88,91,85,93,96,94,97];
const MONTHLY = [89,91,90,93,92,94,94.2];

function renderPerfChart() {
  const el = document.getElementById('perf-chart');
  if(!el) return;
  const max = Math.max(...PERF);
  el.innerHTML = PERF.map((v, i) => {
    const h = (v / (max + 5)) * 100;
    return `<div class="mbc-bar" style="height:${h}%;background:${v>=95?'var(--gold)':'var(--blue)' }" data-val="${v}%"></div>`;
  }).join('');
}

function renderMonthlyChart() {
  const el = document.getElementById('monthly-chart');
  if(!el) return;
  const max = Math.max(...MONTHLY);
  el.innerHTML = MONTHLY.map((v, i) => {
    const h = (v / (max + 3)) * 100;
    return `<div class="mbc-bar" style="height:${h}%;background:linear-gradient(180deg,var(--gold),var(--blue))" data-val="${v}%"></div>`;
  }).join('');
}

// ── Render: Heatmap ───────────────────────────
function renderHeatmap() {
  const el = document.getElementById('heatmap');
  if(!el) return;
  const levels = [0,1,2,3,4,5];
  let html = '';
  for(let row = 0; row < 7; row++){
    for(let col = 0; col < 7; col++){
      const lvl = levels[Math.floor(Math.random() * levels.length)];
      html += `<div class="hm-cell hm-${lvl}" title="${70+lvl*5}% accuracy"></div>`;
    }
  }
  el.innerHTML = html;
}

// ── Render: Leaderboard ───────────────────────
function renderLeaderboard() {
  const el = document.getElementById('lb-rows');
  if(!el) return;
  const session = JSON.parse(localStorage.getItem('sportai_session') || '{}');
  el.innerHTML = LEADERBOARD_DATA.map(r => `
    <div class="lb-row" style="${r.me?'background:rgba(240,180,41,.04);border-left:2px solid var(--gold)':''}">
      <span class="lb-rank" style="color:${r.rank<=3?'var(--gold)':'var(--text3)'}">${r.rank}</span>
      <div class="lb-user">
        <div class="lb-av" style="background:${r.me?'var(--gold)':'var(--bg-card2)'};color:${r.me?'#000':'var(--text2)'}">${r.me?(session.initials||r.init):r.init}</div>
        <span style="font-size:13px;font-weight:600">${r.me?(session.name||r.name).split(' ').map((n,i)=>i===0?n:n[0]+'.').join(' '):r.name}</span>
        ${r.me?'<span style="font-size:9px;background:rgba(240,180,41,.15);color:var(--gold);padding:1px 5px;border-radius:3px;font-weight:700">YOU</span>':''}
      </div>
      <span style="font-family:var(--f-cond);font-weight:700">${r.bets}</span>
      <span style="color:var(--green);font-weight:600">${r.acc}</span>
      <span style="color:var(--green);font-family:var(--f-cond);font-weight:800">${r.profit}</span>
      <span style="color:var(--gold);font-family:var(--f-cond);font-weight:700">${r.roi}</span>
    </div>`).join('');
}

// ── Render: History ───────────────────────────
function renderHistory() {
  const el = document.getElementById('history-rows');
  if(!el) return;
  el.innerHTML = HISTORY_DATA.map(h => `
    <div class="hist-row">
      <div class="hist-result ${h.result==='won'?'hr-won':h.result==='lost'?'hr-lost':'hr-pending'}">${h.result==='won'?'W':h.result==='lost'?'L':'?'}</div>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:600">${h.match}</div>
        <div style="font-size:11px;color:var(--text3)">${h.sel} · Odds ${h.odds} · Stake £${h.stake}</div>
      </div>
      <div style="text-align:right">
        <div style="font-family:var(--f-cond);font-size:15px;font-weight:800;color:${h.result==='won'?'var(--green)':h.result==='lost'?'var(--red)':'var(--gold)'}">
          ${h.result==='won'?'+£'+h.profit.toFixed(2):h.result==='lost'?'-£'+Math.abs(h.profit).toFixed(2):'Pending'}
        </div>
        <div style="font-size:10px;color:var(--text3)">${h.date}</div>
      </div>
    </div>`).join('');
}

// ── Render: Notifications ─────────────────────
function renderNotifications() {
  const el = document.getElementById('notif-list');
  if(!el) return;
  el.innerHTML = NOTIFICATIONS.map(n => `
    <div class="notif-item">
      <div class="notif-dot-type" style="background:${n.color}"></div>
      <div style="flex:1">
        <div style="font-size:12px;color:var(--text1);line-height:1.5">${n.text}</div>
        <div class="notif-time">${n.time}</div>
      </div>
    </div>`).join('');
}

// ── Betslip ───────────────────────────────────
function addToSlip(match, selection, odds) {
  const exists = betslip.findIndex(b => b.match === match && b.sel === selection);
  if(exists > -1){ betslip.splice(exists, 1); showToast('Selection removed'); }
  else {
    betslip.push({ match, sel: selection, odds: parseFloat(odds) });
    showToast(`Added: ${match} — ${selection} @ ${odds}`);
  }
  renderBetslip();
  updateBetslipBadge();
  document.getElementById('betslip-panel').classList.add('open');
}

function renderBetslip() {
  const items = document.getElementById('betslip-items');
  const footer = document.getElementById('betslip-footer');
  const count = document.getElementById('bp-count');
  if(!items) return;
  count.textContent = betslip.length;
  if(!betslip.length){
    items.innerHTML = '<div class="bp-empty"><div class="bp-empty-icon">🎫</div><p>No selections yet.<br>Click any odds to add.</p></div>';
    if(footer) footer.style.display = 'none';
    return;
  }
  items.innerHTML = betslip.map((b, i) => `
    <div class="bp-slip-item">
      <div class="bp-item-match">${b.match}</div>
      <div style="display:flex;align-items:center;justify-content:space-between">
        <span class="bp-item-sel">${b.sel}</span>
        <span class="bp-item-odds">${b.odds.toFixed(2)}</span>
      </div>
      <button class="bp-remove" onclick="removeFromSlip(${i})">✕</button>
    </div>`).join('');
  if(footer) footer.style.display = 'block';
  updateBetslip();
}

function removeFromSlip(idx) { betslip.splice(idx, 1); renderBetslip(); updateBetslipBadge(); }
function updateBetslipBadge() {
  const badge = document.getElementById('bs-count-badge');
  if(badge){ badge.style.display = betslip.length ? 'block' : 'none'; badge.textContent = betslip.length; }
}

function updateBetslip() {
  if(!betslip.length) return;
  const stake = parseFloat(document.getElementById('bp-stake')?.value || 10);
  const totalOdds = betslip.reduce((acc, b) => acc * b.odds, 1);
  const ret = stake * totalOdds;
  const profit = ret - stake;
  setEl('bp-total-odds', totalOdds.toFixed(2));
  setEl('bp-return', '£' + ret.toFixed(2));
  const pEl = document.getElementById('bp-profit');
  if(pEl){ pEl.textContent = '£' + profit.toFixed(2); pEl.style.color = profit >= 0 ? 'var(--green)' : 'var(--red)'; }
}

function placeBet() {
  showToast('🎉 Bet placed successfully! Good luck!');
  betslip = [];
  renderBetslip();
  updateBetslipBadge();
  setTimeout(() => document.getElementById('betslip-panel').classList.remove('open'), 800);
}

// ── Filters ───────────────────────────────────
function setupFilters() {
  // Dashboard filters
  document.querySelectorAll('[data-df]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-df]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderDashMatches(btn.dataset.df);
    });
  });
  // Predictions filters
  document.querySelectorAll('[data-pf]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-pf]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderPredictions(btn.dataset.pf);
    });
  });
}

// ── Toast ─────────────────────────────────────
function showToast(msg, duration = 2500) {
  const t = document.getElementById('toast');
  if(!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), duration);
}

// ── Global Search ─────────────────────────────
const searchInput = document.getElementById('global-search');
if(searchInput){
  searchInput.addEventListener('input', e => {
    const q = e.target.value.toLowerCase().trim();
    if(!q) return;
    const found = MATCHES.find(m => m.home.toLowerCase().includes(q) || m.away.toLowerCase().includes(q) || m.league.toLowerCase().includes(q));
    if(found){ navigateTo('predictions'); showToast(`Showing results for "${e.target.value}"`); }
  });
}

// ── Responsive: Handle resize ─────────────────
window.addEventListener('resize', () => {
  if(window.innerWidth > 900) closeSidebar();
});