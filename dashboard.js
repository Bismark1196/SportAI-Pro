/* ============================================================
   SPORTAI — DASHBOARD.JS  v2.0
   Matches index.html element IDs exactly.
   Self-contained — no backend required.
   ============================================================ */
"use strict";

// ── AUTH GUARD ───────────────────────────────────────────────
(function () {
  try {
    const s = JSON.parse(localStorage.getItem("sportai_session") || "{}");
    if (!s.loggedIn) { window.location.href = "auth.html"; }
  } catch (e) { window.location.href = "auth.html"; }
})();

// ── LOAD USER INTO UI ────────────────────────────────────────
(function () {
  try {
    const s = JSON.parse(localStorage.getItem("sportai_session") || "{}");
    const u = JSON.parse(localStorage.getItem("sportai_user")    || "{}");
    const name     = s.name  || u.name  || "User";
    const email    = s.email || u.email || "";
    const plan     = u.plan  || "Pro";
    const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "JS";

    const avatarEl = document.getElementById("user-btn");
    if (avatarEl) avatarEl.textContent = initials;
    _set("ud-name",       name);
    _set("ud-email",      email);
    _set("settings-name", name);
    _set("settings-email",email);
    const planEl = document.getElementById("settings-plan");
    if (planEl) planEl.textContent = plan.toUpperCase();
    const greetEl = document.getElementById("dash-greeting");
    if (greetEl) greetEl.textContent = "Welcome back, " + name.split(" ")[0] + ". Here's today's overview.";
  } catch (e) { /* silent */ }
})();

// ── TINY HELPER ──────────────────────────────────────────────
function _set(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

// ── MATCH DATA ───────────────────────────────────────────────
const MATCHES = [
  { id:1, home:"Manchester City", away:"Arsenal",       league:"Premier League", flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿", kickoff:"LIVE 73\u2032", status:"live",     score:"2\u20131", homeProb:58, drawProb:22, awayProb:20, homeOdds:1.72, drawOdds:3.50, awayOdds:4.80, homeForm:["W","W","D","W","W"], awayForm:["W","L","W","W","D"], confidence:91, isValue:true,  valueTarget:"home", ai:"Man City dominate with 68% possession and 7 shots on target. Home Win value at 1.72 — EV +8.4%." },
  { id:2, home:"Real Madrid",     away:"Barcelona",     league:"La Liga",        flag:"🇪🇸",         kickoff:"LIVE 34\u2032", status:"live",     score:"0\u20131", homeProb:29, drawProb:24, awayProb:47, homeOdds:2.10, drawOdds:3.20, awayOdds:3.60, homeForm:["W","W","W","D","L"], awayForm:["W","W","D","W","W"], confidence:78, isValue:true,  valueTarget:"away", ai:"Barcelona lead and hold superior form. Away win EV positive at 3.60 — EV +6.1%." },
  { id:3, home:"Bayern Munich",   away:"Dortmund",      league:"Bundesliga",     flag:"🇩🇪",         kickoff:"19:30",        status:"upcoming", score:null,       homeProb:62, drawProb:20, awayProb:18, homeOdds:1.65, drawOdds:3.80, awayOdds:4.50, homeForm:["W","W","W","D","W"], awayForm:["W","D","L","W","W"], confidence:88, isValue:true,  valueTarget:"home", ai:"Bayern 9-game home winning run. Dortmund missing 3 key players. Home Win EV +5.2%." },
  { id:4, home:"Liverpool",       away:"Chelsea",       league:"Premier League", flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿", kickoff:"20:00",        status:"upcoming", score:null,       homeProb:50, drawProb:26, awayProb:24, homeOdds:2.00, drawOdds:3.40, awayOdds:3.60, homeForm:["W","W","D","W","L"], awayForm:["D","W","W","L","W"], confidence:72, isValue:false, valueTarget:null,   ai:"Balanced fixture. Liverpool Anfield advantage gives them a narrow edge." },
  { id:5, home:"PSG",             away:"Lyon",          league:"Ligue 1",        flag:"🇫🇷",         kickoff:"21:00",        status:"upcoming", score:null,       homeProb:71, drawProb:16, awayProb:13, homeOdds:1.40, drawOdds:4.50, awayOdds:7.00, homeForm:["W","W","W","D","W"], awayForm:["D","W","L","D","W"], confidence:84, isValue:false, valueTarget:null,   ai:"PSG heavily favoured. Low odds reduce value — probability high but edge thin." },
  { id:6, home:"Juventus",        away:"Inter Milan",   league:"Serie A",        flag:"🇮🇹",         kickoff:"19:45",        status:"upcoming", score:null,       homeProb:38, drawProb:30, awayProb:32, homeOdds:2.60, drawOdds:3.10, awayOdds:2.80, homeForm:["D","W","W","D","W"], awayForm:["W","L","W","W","D"], confidence:69, isValue:true,  valueTarget:"draw", ai:"Derby d'Italia very close. Draw at 3.10 offers strong expected value — EV +9.3%." },
  { id:7, home:"Ajax",            away:"PSV",           league:"Eredivisie",     flag:"🇳🇱",         kickoff:"16:30",        status:"upcoming", score:null,       homeProb:55, drawProb:24, awayProb:21, homeOdds:1.85, drawOdds:3.50, awayOdds:4.00, homeForm:["W","W","W","D","W"], awayForm:["W","W","D","L","W"], confidence:76, isValue:true,  valueTarget:"home", ai:"Ajax home form outstanding (W8 D1 L1). Home Win at 1.85 carries edge — EV +4.7%." },
  { id:8, home:"Atletico Madrid", away:"Sevilla",       league:"La Liga",        flag:"🇪🇸",         kickoff:"22:00",        status:"upcoming", score:null,       homeProb:52, drawProb:25, awayProb:23, homeOdds:1.90, drawOdds:3.60, awayOdds:4.40, homeForm:["W","W","W","D","W"], awayForm:["D","W","L","D","W"], confidence:73, isValue:false, valueTarget:null,   ai:"Atletico strong home record (W4 D1 L0 last 5). Marginal home edge." },
];

const NOTIFICATIONS_DATA = [
  { icon:"⚽", title:"GOAL! Man City 2\u20131 Arsenal",   body:"Haaland 73\u2032 \u2014 AI predicted Home Win (58%). Probs updated.", time:"2 min ago" },
  { icon:"💎", title:"High Value Bet Found",              body:"Bayern Munich Home vs Dortmund @ 1.65 \u2014 EV +5.2%.",             time:"8 min ago" },
  { icon:"🔔", title:"Match Starting Soon",               body:"Juventus vs Inter Milan kicks off in 30 minutes.",                    time:"22 min ago" },
  { icon:"✅", title:"Prediction Correct",                body:"Real Madrid Win (1.85) confirmed \u2014 +\u00a38.50 profit.",         time:"2h ago" },
  { icon:"📊", title:"Weekly Report Ready",               body:"Your performance report for this week is available.",                 time:"5h ago" },
  { icon:"🤖", title:"AI Model Updated",                  body:"DeepMatch v3.2 deployed with improved draw detection.",               time:"1d ago" },
];

const HISTORY_DATA = [
  { match:"Man City vs Arsenal",      pred:"Home Win",  odds:1.65, stake:10, result:"won",     profit: 6.50, date:"2 Apr 2026" },
  { match:"Real Madrid vs Barcelona", pred:"Draw",      odds:3.20, stake:10, result:"lost",    profit:-10.00,date:"1 Apr 2026" },
  { match:"Bayern vs Dortmund",       pred:"Home Win",  odds:1.85, stake:10, result:"won",     profit: 8.50, date:"31 Mar 2026" },
  { match:"PSG vs Marseille",         pred:"Home Win",  odds:1.50, stake:20, result:"won",     profit:10.00, date:"30 Mar 2026" },
  { match:"Juventus vs Roma",         pred:"Draw",      odds:3.00, stake:10, result:"lost",    profit:-10.00,date:"29 Mar 2026" },
  { match:"Liverpool vs Chelsea",     pred:"Home Win",  odds:1.72, stake:15, result:"won",     profit:10.80, date:"28 Mar 2026" },
  { match:"Atletico vs Sevilla",      pred:"Home Win",  odds:1.90, stake:10, result:"pending", profit: 0.00, date:"2 Apr 2026" },
  { match:"Ajax vs Feyenoord",        pred:"Home Win",  odds:2.00, stake:10, result:"won",     profit:10.00, date:"27 Mar 2026" },
  { match:"Inter vs Roma",            pred:"Home Win",  odds:1.80, stake:10, result:"won",     profit: 8.00, date:"26 Mar 2026" },
  { match:"Barcelona vs Atletico",    pred:"Draw",      odds:3.40, stake:10, result:"lost",    profit:-10.00,date:"25 Mar 2026" },
];

const LEADERBOARD_DATA = [
  { rank:1, initials:"JS", name:"John S.",   you:true,  bets:284, acc:"94.2%", profit:"+\u00a33,840", roi:"+18.4%", pos:true,  color:"linear-gradient(135deg,#f0a500,#c07d00)" },
  { rank:2, initials:"MR", name:"Maria R.",  you:false, bets:310, acc:"91.8%", profit:"+\u00a32,140", roi:"+14.2%", pos:true,  color:"#c0c0c0" },
  { rank:3, initials:"DK", name:"David K.",  you:false, bets:198, acc:"93.4%", profit:"+\u00a31,920", roi:"+16.1%", pos:true,  color:"#cd7f32" },
  { rank:4, initials:"AL", name:"Alex L.",   you:false, bets:422, acc:"88.7%", profit:"+\u00a31,540", roi:"+11.3%", pos:true,  color:"#7c5cbf" },
  { rank:5, initials:"SB", name:"Sophie B.", you:false, bets:167, acc:"90.1%", profit:"+\u00a3980",   roi:"+9.8%",  pos:true,  color:"#e63946" },
  { rank:6, initials:"TM", name:"Tom M.",    you:false, bets:289, acc:"85.2%", profit:"-\u00a3120",   roi:"-0.4%",  pos:false, color:"#3a8ef6" },
  { rank:7, initials:"KA", name:"Kenji A.",  you:false, bets:134, acc:"87.6%", profit:"+\u00a3640",   roi:"+8.1%",  pos:true,  color:"#2ec27e" },
];

// ── STATE ────────────────────────────────────────────────────
const STATE = { betslip:{}, dashFilter:"all", predFilter:"all", histFilter:"all", betslipOpen:false, notifOpen:false };

// ── EV SIDE ──────────────────────────────────────────────────
function calcEVSide(m) {
  const evH = m.homeOdds > 1 ? m.homeProb / 100 - 1 / m.homeOdds : -1;
  const evD = m.drawOdds > 1 ? m.drawProb / 100 - 1 / m.drawOdds : -1;
  const evA = m.awayOdds > 1 ? m.awayProb / 100 - 1 / m.awayOdds : -1;
  const best = Math.max(evH, evD, evA);
  if (best <= 0.005) return null;
  return best === evH ? "home" : best === evD ? "draw" : "away";
}

// ── NAVIGATION ───────────────────────────────────────────────
function navigateTo(page) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".nav-item[data-page]").forEach(n => n.classList.remove("active"));
  const pg = document.getElementById("page-" + page);
  if (pg) pg.classList.add("active");
  document.querySelectorAll('[data-page="' + page + '"]').forEach(n => n.classList.add("active"));
  closeSidebar();
  const renders = { dashboard:renderDashboard, predictions:renderPredictions, live:renderLive, leaderboard:renderLeaderboard, history:renderHistory, insights:renderInsights, statistics:renderStatistics, calculator:initCalculators };
  if (renders[page]) renders[page]();
}

document.querySelectorAll(".nav-item[data-page]").forEach(btn => {
  btn.addEventListener("click", () => navigateTo(btn.dataset.page));
});

// ── SIDEBAR ──────────────────────────────────────────────────
function toggleSidebar() {
  const sb = document.getElementById("sidebar");
  const ov = document.getElementById("sidebar-overlay");
  const open = !sb.classList.contains("open");
  sb.classList.toggle("open", open);
  if (ov) ov.style.display = open ? "block" : "none";
}
function closeSidebar() {
  document.getElementById("sidebar")?.classList.remove("open");
  const ov = document.getElementById("sidebar-overlay");
  if (ov) ov.style.display = "none";
}

// ── USER DROPDOWN ────────────────────────────────────────────
function toggleDropdown() { document.getElementById("user-dropdown")?.classList.toggle("open"); }
function closeDropdown()  { document.getElementById("user-dropdown")?.classList.remove("open"); }
document.addEventListener("click", e => {
  if (!e.target.closest("#user-btn") && !e.target.closest("#user-dropdown")) closeDropdown();
  if (!e.target.closest("#notif-btn") && !e.target.closest("#notif-panel")) closeNotif();
});

// ── BETSLIP ──────────────────────────────────────────────────
function toggleBetslip() {
  STATE.betslipOpen = !STATE.betslipOpen;
  document.getElementById("betslip-panel")?.classList.toggle("open", STATE.betslipOpen);
  if (STATE.notifOpen) { STATE.notifOpen = false; document.getElementById("notif-panel")?.classList.remove("open"); }
}

function addToBetslip(matchId, type, odds) {
  const m = MATCHES.find(x => x.id === matchId);
  if (!m) return;
  const key = String(matchId);
  if (STATE.betslip[key] && STATE.betslip[key].type === type) {
    delete STATE.betslip[key];
    showToast("Removed from betslip");
  } else {
    STATE.betslip[key] = { type, odds:parseFloat(odds), home:m.home, away:m.away };
    const lbl = type === "home" ? "Home Win" : type === "away" ? "Away Win" : "Draw";
    showToast("\u2713 Added: " + m.home + " vs " + m.away + " \u2014 " + lbl + " @ " + parseFloat(odds).toFixed(2));
  }
  renderBetslip();
  updateBetslipBadge();
}

function renderBetslip() {
  const items  = document.getElementById("betslip-items");
  const footer = document.getElementById("betslip-footer");
  const count  = document.getElementById("bp-count");
  if (!items) return;
  const entries = Object.entries(STATE.betslip);
  if (count) count.textContent = entries.length;

  if (!entries.length) {
    items.innerHTML = '<div class="bp-empty"><div class="bp-empty-icon">🎫</div><p>No selections yet.<br>Click any odds to add.</p></div>';
    if (footer) footer.style.display = "none";
    return;
  }

  items.innerHTML = entries.map(([id, s]) => {
    const lbl = s.type === "home" ? "Home Win" : s.type === "away" ? "Away Win" : "Draw";
    return '<div class="bp-item"><div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px"><div style="flex:1"><div class="bp-item-match">' + s.home + " vs " + s.away + '</div><div class="bp-item-sel">' + lbl + '</div></div><div style="display:flex;align-items:center;gap:8px"><div style="font-family:var(--f-cond);font-size:20px;font-weight:900">' + s.odds.toFixed(2) + '</div><button class="bp-remove" onclick="removeBetslipItem(\'' + id + '\')">✕</button></div></div></div>';
  }).join("");

  if (footer) footer.style.display = "block";
  updateBetslipTotals();
}

function removeBetslipItem(id) { delete STATE.betslip[id]; renderBetslip(); updateBetslipBadge(); }

function updateBetslipBadge() {
  const count = Object.keys(STATE.betslip).length;
  const badge = document.getElementById("bs-count-badge");
  if (badge) { badge.textContent = count; badge.style.display = count > 0 ? "block" : "none"; }
}

function updateBetslipTotals() {
  const entries = Object.values(STATE.betslip);
  if (!entries.length) return;
  const stake     = parseFloat(document.getElementById("bp-stake")?.value) || 10;
  const totalOdds = entries.reduce((a, s) => a * s.odds, 1);
  const ret       = stake * totalOdds;
  _set("bp-total-odds", totalOdds.toFixed(2));
  _set("bp-return", "\u00a3" + ret.toFixed(2));
  _set("bp-profit", "\u00a3" + (ret - stake).toFixed(2));
}

function placeBet() {
  const count = Object.keys(STATE.betslip).length;
  if (!count) return;
  const stake = parseFloat(document.getElementById("bp-stake")?.value) || 10;
  showToast("\u2705 Bet placed! \u00a3" + stake.toFixed(2) + " on " + count + " selection" + (count > 1 ? "s" : ""));
  STATE.betslip = {};
  renderBetslip();
  updateBetslipBadge();
  toggleBetslip();
}

document.getElementById("bp-stake")?.addEventListener("input", updateBetslipTotals);

// ── NOTIFICATIONS ────────────────────────────────────────────
function toggleNotif() {
  STATE.notifOpen = !STATE.notifOpen;
  document.getElementById("notif-panel")?.classList.toggle("open", STATE.notifOpen);
  if (STATE.notifOpen) document.getElementById("notif-dot").style.display = "none";
  if (STATE.betslipOpen) { STATE.betslipOpen = false; document.getElementById("betslip-panel")?.classList.remove("open"); }
}
function closeNotif() { STATE.notifOpen = false; document.getElementById("notif-panel")?.classList.remove("open"); }

function renderNotifications() {
  const list = document.getElementById("notif-list");
  if (!list) return;
  list.innerHTML = NOTIFICATIONS_DATA.map(n =>
    '<div class="notif-item" style="display:flex;gap:12px;align-items:flex-start;padding:10px 16px;border-bottom:1px solid var(--border);cursor:pointer"><div style="font-size:20px;flex-shrink:0;padding-top:2px">' + n.icon + '</div><div style="flex:1"><div class="ni-title">' + n.title + '</div><div class="ni-body">' + n.body + '</div><div class="ni-time">' + n.time + '</div></div></div>'
  ).join("");
  const dot = document.getElementById("notif-dot");
  if (dot) dot.style.display = "block";
}

// ── SEARCH ───────────────────────────────────────────────────
function handleSearch(val) {
  if (!val || val.length < 2) return;
  const q = val.toLowerCase();
  const hit = MATCHES.find(m => m.home.toLowerCase().includes(q) || m.away.toLowerCase().includes(q) || m.league.toLowerCase().includes(q));
  if (hit) { navigateTo("predictions"); showToast("Found: " + hit.home + " vs " + hit.away); }
}

// ── LOGOUT ───────────────────────────────────────────────────
function logout() { localStorage.removeItem("sportai_session"); window.location.href = "auth.html"; }

// ── TOAST ────────────────────────────────────────────────────
function showToast(msg, dur) {
  dur = dur || 2800;
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("show"), dur);
}

// ── FORM DOT ─────────────────────────────────────────────────
function formDot(r) { return '<div class="form-dot ' + (r==="W"?"fw":r==="D"?"fd":"fl") + '">' + r + '</div>'; }

// ── TICKER ───────────────────────────────────────────────────
function updateTicker() {
  const live  = MATCHES.filter(m => m.status === "live").length;
  const value = MATCHES.filter(m => m.isValue || calcEVSide(m)).length;
  _set("t-total",    MATCHES.length);
  _set("t-live",     live);
  _set("t-value",    value);
  _set("live-badge", live);
  _set("val-badge",  value);
  _set("dash-live",  live);
  _set("dash-value", value);
  _set("t-updated",  new Date().toLocaleTimeString("en-GB", {hour:"2-digit",minute:"2-digit"}));
}

// ============================================================
//  DASHBOARD
// ============================================================
function renderDashboard() {
  renderDashMatches();
  renderTopValueBets();
  renderPerfChart("perf-chart", [78,82,88,95,90,96,92]);
  updateTicker();
}

function renderDashMatches() {
  const c = document.getElementById("dash-matches");
  if (!c) return;
  let list = MATCHES.slice();
  if (STATE.dashFilter === "live")     list = list.filter(m => m.status === "live");
  if (STATE.dashFilter === "upcoming") list = list.filter(m => m.status === "upcoming");
  if (!list.length) { c.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-3)">No matches for this filter.</div>'; return; }

  c.innerHTML = list.map(function(m) {
    const bv = calcEVSide(m);
    return '<div class="match-row" style="cursor:pointer" onclick="navigateTo(\'predictions\')">' +
      '<div><div class="team-names"><div class="tn-home">' + m.home + '</div><div class="tn-away" style="color:var(--text-2);margin-top:2px">' + m.away + '</div></div>' +
      '<div style="font-size:10px;color:var(--text-3);margin-top:3px">' + m.flag + ' ' + m.league + ' \u00b7 ' +
      (m.status === "live" ? '<span style="color:var(--red)">\u25cf ' + m.kickoff + '</span>' : m.kickoff) + '</div></div>' +
      '<div><div class="prob-mini-bar"><div class="pmb-home" style="flex:' + m.homeProb + '"></div><div class="pmb-draw" style="flex:' + m.drawProb + '"></div><div class="pmb-away" style="flex:' + m.awayProb + '"></div></div>' +
      '<div class="prob-labels"><span>' + m.homeProb + '%</span><span>' + m.drawProb + '%</span><span>' + m.awayProb + '%</span></div></div>' +
      '<div class="odds-col" style="text-align:center"><button class="odds-btn' + (bv==="home"?" best":"") + '" onclick="event.stopPropagation();addToBetslip(' + m.id + ',\'home\',' + m.homeOdds + ')">' + m.homeOdds.toFixed(2) + '</button></div>' +
      '<div class="odds-col-draw" style="text-align:center"><button class="odds-btn' + (bv==="draw"?" best":"") + '" onclick="event.stopPropagation();addToBetslip(' + m.id + ',\'draw\',' + m.drawOdds + ')">' + m.drawOdds.toFixed(2) + '</button></div>' +
      '<div style="text-align:center"><button class="odds-btn' + (bv==="away"?" best":"") + '" onclick="event.stopPropagation();addToBetslip(' + m.id + ',\'away\',' + m.awayOdds + ')">' + m.awayOdds.toFixed(2) + '</button></div>' +
      '<div style="text-align:center">' + (bv ? '<div class="value-badge">+EV</div>' : '<div class="no-value">\u2014</div>') + '</div>' +
      '</div>';
  }).join("");
}

document.querySelectorAll("[data-df]").forEach(function(btn) {
  btn.addEventListener("click", function() {
    document.querySelectorAll("[data-df]").forEach(function(b) { b.classList.remove("active"); });
    btn.classList.add("active");
    STATE.dashFilter = btn.dataset.df;
    renderDashMatches();
  });
});

function renderTopValueBets() {
  const c = document.getElementById("top-value-list");
  if (!c) return;
  const valueBets = MATCHES.filter(function(m) { return m.isValue || calcEVSide(m); }).slice(0, 4);
  if (!valueBets.length) { c.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-3)">No value bets right now.</div>'; return; }

  c.innerHTML = valueBets.map(function(m) {
    const bv   = m.valueTarget || calcEVSide(m);
    const lbl  = bv === "home" ? "Home Win" : bv === "away" ? "Away Win" : "Draw";
    const odds = bv === "home" ? m.homeOdds : bv === "away" ? m.awayOdds : m.drawOdds;
    const prob = (bv === "home" ? m.homeProb : bv === "away" ? m.awayProb : m.drawProb) / 100;
    const evPct = ((prob * (odds - 1) - (1 - prob)) * 100).toFixed(1);
    return '<div class="vb-item" onclick="navigateTo(\'predictions\')">' +
      '<div class="vb-teams" style="flex:1"><div class="vb-match">' + m.home + ' vs ' + m.away + '</div><div class="vb-info">' + m.flag + ' ' + m.league + ' \u00b7 ' + lbl + '</div></div>' +
      '<div style="text-align:right;margin-right:10px"><div class="vb-ev">+' + evPct + '%</div><div class="vb-conf">' + m.confidence + '% conf</div></div>' +
      '<button class="vb-odds-btn" onclick="event.stopPropagation();addToBetslip(' + m.id + ',\'' + bv + '\',' + odds + ')">' + odds.toFixed(2) + '</button>' +
      '</div>';
  }).join("");
}

// ============================================================
//  PREDICTIONS
// ============================================================
function renderPredictions() {
  const c = document.getElementById("pred-container");
  if (!c) return;
  let list = MATCHES.slice();
  if (STATE.predFilter === "live")     list = list.filter(function(m) { return m.status === "live"; });
  if (STATE.predFilter === "upcoming") list = list.filter(function(m) { return m.status === "upcoming"; });
  if (STATE.predFilter === "value")    list = list.filter(function(m) { return m.isValue || calcEVSide(m); });
  const sort = document.getElementById("pred-sort") ? document.getElementById("pred-sort").value : "";
  if (sort === "conf") list.sort(function(a,b) { return b.confidence - a.confidence; });
  if (sort === "ev")   list.sort(function(a,b) { return (b.isValue?1:0) - (a.isValue?1:0); });
  if (sort === "time") list.sort(function(a,b) { return a.kickoff.localeCompare(b.kickoff); });
  c.innerHTML = list.length ? list.map(buildPredCard).join("") : '<div style="padding:40px;text-align:center;color:var(--text-3)">No predictions match this filter.</div>';
}

function buildPredCard(m) {
  const bv = m.valueTarget || calcEVSide(m);
  const o  = { home:m.homeOdds, draw:m.drawOdds, away:m.awayOdds };
  const p  = { home:m.homeProb, draw:m.drawProb, away:m.awayProb };
  const scoreHtml = m.score ? m.score : "";

  let evBadge = "";
  if (bv) {
    const evOdds = bv === "home" ? o.home : bv === "away" ? o.away : o.draw;
    const evProb = (bv === "home" ? p.home : bv === "away" ? p.away : p.draw) / 100;
    const evPct  = ((evProb * (evOdds - 1) - (1 - evProb)) * 100).toFixed(1);
    const kelly  = Math.max(0, (evProb * (evOdds - 1) - (1 - evProb)) / (evOdds - 1) * 0.25 * 500).toFixed(2);
    evBadge = '<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">' +
      '<div class="value-badge">\ud83d\udc8e +' + evPct + '% EV</div>' +
      '<div class="value-badge" style="background:rgba(41,121,255,.15);border-color:rgba(41,121,255,.3);color:var(--blue)">Kelly: \u00a3' + kelly + '</div>' +
      '</div>';
  }

  return '<div class="match-card' + (m.status==="live"?" live-card":"") + (bv?" value-card":"") + '" style="margin-bottom:12px">' +

    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">' +
      '<div style="display:flex;align-items:center;gap:8px"><span style="font-size:16px">' + m.flag + '</span><span style="font-size:12px;color:var(--text-2)">' + m.league + '</span>' +
      (bv ? '<span class="comp-badge value">\ud83d\udc8e VALUE</span>' : '') + '</div>' +
      '<div style="display:flex;align-items:center;gap:8px"><span style="font-size:11px;color:var(--text-3)">Confidence:</span>' +
      '<span style="font-family:var(--f-cond);font-size:14px;font-weight:800;color:' + (m.confidence>=85?"var(--green-lt)":m.confidence>=70?"var(--gold)":"var(--text-2)") + '">' + m.confidence + '%</span>' +
      '<span class="comp-badge ' + (m.status==="live"?"live":"upcoming") + '">' + (m.status==="live"?"\u25cf "+m.kickoff:m.kickoff) + '</span></div>' +
    '</div>' +

    '<div style="display:flex;align-items:center;gap:16px;margin-bottom:12px">' +
      '<div style="flex:1"><div class="vst-name">' + m.home + '</div>' +
      (m.status==="live" ? '<div style="font-size:24px;font-family:var(--f-cond);font-weight:900;margin:4px 0">' + (scoreHtml.split("\u2013")[0]||"0") + '</div>' : '') +
      '<div style="display:flex;gap:3px;margin-top:4px">' + m.homeForm.map(formDot).join("") + '</div></div>' +
      '<div style="text-align:center;padding:0 12px">' +
      (m.status==="live" ? '<div style="font-family:var(--f-cond);font-size:22px;font-weight:900">' + scoreHtml + '</div>' : '<div style="font-family:var(--f-cond);font-size:14px;font-weight:700;color:var(--text-2)">' + m.kickoff + '</div>') +
      '<div style="font-size:10px;color:var(--text-3);margin-top:4px">vs</div></div>' +
      '<div style="flex:1;text-align:right"><div class="vst-name">' + m.away + '</div>' +
      (m.status==="live" ? '<div style="font-size:24px;font-family:var(--f-cond);font-weight:900;margin:4px 0">' + (scoreHtml.split("\u2013")[1]||"0") + '</div>' : '') +
      '<div style="display:flex;gap:3px;margin-top:4px;justify-content:flex-end">' + m.awayForm.map(formDot).join("") + '</div></div>' +
    '</div>' +

    '<div style="display:flex;gap:2px;margin-bottom:10px;height:52px">' +
      '<div class="pc-prob-seg seg-home' + (bv==="home"?" seg-best":"") + '" style="flex:1;cursor:pointer" onclick="addToBetslip(' + m.id + ',\'home\',' + o.home + ')">' +
        '<div class="pps-lbl">Home Win</div><div class="pps-val" style="color:' + (bv==="home"?"#fff":"var(--blue)") + '">' + p.home + '%</div><div class="pps-odds">' + o.home.toFixed(2) + '</div></div>' +
      '<div class="pc-prob-seg seg-draw' + (bv==="draw"?" seg-best":"") + '" style="flex:1;cursor:pointer" onclick="addToBetslip(' + m.id + ',\'draw\',' + o.draw + ')">' +
        '<div class="pps-lbl">Draw</div><div class="pps-val" style="color:' + (bv==="draw"?"#fff":"var(--text-2)") + '">' + p.draw + '%</div><div class="pps-odds">' + o.draw.toFixed(2) + '</div></div>' +
      '<div class="pc-prob-seg seg-away' + (bv==="away"?" seg-best":"") + '" style="flex:1;cursor:pointer" onclick="addToBetslip(' + m.id + ',\'away\',' + o.away + ')">' +
        '<div class="pps-lbl">Away Win</div><div class="pps-val" style="color:' + (bv==="away"?"#fff":"var(--red)") + '">' + p.away + '%</div><div class="pps-odds">' + o.away.toFixed(2) + '</div></div>' +
    '</div>' +

    '<div class="ai-insight-row"><span class="ai-icon">\ud83e\udd16</span><strong>AI Insight:</strong> ' + m.ai + '</div>' +
    evBadge +
  '</div>';
}

document.querySelectorAll("[data-pf]").forEach(function(btn) {
  btn.addEventListener("click", function() {
    document.querySelectorAll("[data-pf]").forEach(function(b) { b.classList.remove("active"); });
    btn.classList.add("active"); STATE.predFilter = btn.dataset.pf; renderPredictions();
  });
});
if (document.getElementById("pred-sort")) document.getElementById("pred-sort").addEventListener("change", renderPredictions);

// ============================================================
//  LIVE CENTRE
// ============================================================
function renderLive() {
  const c = document.getElementById("live-container");
  if (!c) return;
  const live     = MATCHES.filter(function(m) { return m.status === "live"; });
  const upcoming = MATCHES.filter(function(m) { return m.status === "upcoming"; });
  let html = "";
  if (live.length) html += '<div class="live-section-title">\ud83d\udd34 Live Now (' + live.length + ')</div>' + live.map(buildPredCard).join("");
  if (upcoming.length) {
    html += '<div class="live-section-title" style="margin-top:16px">\u23f1 Upcoming (' + upcoming.length + ')</div><div class="grid-2">';
    html += upcoming.slice(0,6).map(function(m) {
      return '<div class="match-card"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px"><span style="font-size:12px;color:var(--text-2)">' + m.flag + ' ' + m.league + '</span><span class="comp-badge upcoming">' + m.kickoff + '</span></div>' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin:8px 0"><div style="font-family:var(--f-cond);font-weight:800;font-size:15px">' + m.home + '</div><div style="font-size:11px;color:var(--text-3)">vs</div><div style="font-family:var(--f-cond);font-weight:800;font-size:15px;text-align:right">' + m.away + '</div></div>' +
        '<div style="display:flex;gap:4px"><button class="odds-btn" style="flex:1" onclick="addToBetslip(' + m.id + ',\'home\',' + m.homeOdds + ')">' + m.homeOdds.toFixed(2) + '</button><button class="odds-btn" style="flex:1" onclick="addToBetslip(' + m.id + ',\'draw\',' + m.drawOdds + ')">' + m.drawOdds.toFixed(2) + '</button><button class="odds-btn" style="flex:1" onclick="addToBetslip(' + m.id + ',\'away\',' + m.awayOdds + ')">' + m.awayOdds.toFixed(2) + '</button></div></div>';
    }).join("") + '</div>';
  }
  if (!live.length && !upcoming.length) html = '<div style="padding:40px;text-align:center;color:var(--text-3)">\ud83d\udce1 No matches available right now.</div>';
  c.innerHTML = html;
}

// ============================================================
//  LEADERBOARD
// ============================================================
function renderLeaderboard() {
  const c = document.getElementById("lb-rows");
  if (!c) return;
  c.innerHTML = LEADERBOARD_DATA.map(function(u) {
    const rc = u.rank===1?"gold":u.rank===2?"silver":u.rank===3?"bronze":"";
    return '<div class="lb-row">' +
      '<div class="lb-rank ' + rc + '">' + u.rank + '</div>' +
      '<div class="lb-user"><div class="lb-avatar" style="background:' + u.color + ';color:' + (u.rank<=3?"#111":"#fff") + '">' + u.initials + '</div>' +
      '<div><div class="lb-name">' + u.name + (u.you?'<span class="lb-you">YOU</span>':"") + '</div><div style="font-size:10px;color:var(--text-3)">Pro Member</div></div></div>' +
      '<div style="font-size:12px;color:var(--text-2)">' + u.bets + '</div>' +
      '<div style="font-family:var(--f-cond);font-size:13px;font-weight:700;color:var(--green-lt)">' + u.acc + '</div>' +
      '<div style="font-family:var(--f-cond);font-size:14px;font-weight:800;color:' + (u.pos?"var(--gold)":"var(--red)") + '">' + u.profit + '</div>' +
      '<div style="font-family:var(--f-cond);font-size:13px;font-weight:700;color:' + (u.pos?"var(--green-lt)":"var(--red)") + '">' + u.roi + '</div>' +
    '</div>';
  }).join("");
}

// ============================================================
//  HISTORY
// ============================================================
function renderHistory(filter) {
  if (filter) STATE.histFilter = filter;
  const c = document.getElementById("history-rows");
  if (!c) return;
  let list = HISTORY_DATA.slice();
  if (STATE.histFilter === "won")  list = list.filter(function(h) { return h.result === "won"; });
  if (STATE.histFilter === "lost") list = list.filter(function(h) { return h.result === "lost"; });

  c.innerHTML = list.map(function(h) {
    const cls = h.result==="won" ? "result-won" : h.result==="pending" ? "result-pending" : "result-lost";
    const col = h.profit>0 ? "var(--green-lt)" : h.profit<0 ? "var(--red)" : "var(--text-2)";
    const pStr = h.profit>0 ? "+\u00a3"+h.profit.toFixed(2) : h.profit<0 ? "-\u00a3"+Math.abs(h.profit).toFixed(2) : "\u2014";
    return '<div style="display:grid;grid-template-columns:1fr 100px 80px 70px 70px 80px;padding:11px 16px;align-items:center;border-bottom:1px solid var(--border);font-size:12px">' +
      '<div><div style="font-weight:600">' + h.match + '</div><div style="font-size:10px;color:var(--text-3);margin-top:2px">' + h.date + '</div></div>' +
      '<div style="font-family:var(--f-cond);font-size:12px;font-weight:700">' + h.pred + '</div>' +
      '<div style="font-family:var(--f-cond);font-size:13px;font-weight:700">' + h.odds.toFixed(2) + '</div>' +
      '<div style="font-size:12px;color:var(--text-2)">\u00a3' + h.stake + '</div>' +
      '<div><span class="result-badge ' + cls + '">' + h.result.toUpperCase() + '</span></div>' +
      '<div style="font-family:var(--f-cond);font-size:13px;font-weight:800;color:' + col + '">' + pStr + '</div>' +
    '</div>';
  }).join("");
}

document.querySelectorAll("[data-hf]").forEach(function(btn) {
  btn.addEventListener("click", function() {
    document.querySelectorAll("[data-hf]").forEach(function(b) { b.classList.remove("active"); });
    btn.classList.add("active"); renderHistory(btn.dataset.hf);
  });
});

// ============================================================
//  AI INSIGHTS — HEATMAP
// ============================================================
function renderInsights() {
  const hm = document.getElementById("heatmap");
  if (!hm) return;
  hm.innerHTML = Array.from({length:49}, function(_, i) {
    const lvl = [0,1,2,3,4,5][Math.floor(Math.random()*6)];
    const acc = (75 + lvl*4 + Math.random()*3).toFixed(1);
    return '<div class="hm-cell hm-' + lvl + '" title="Day ' + (i+1) + ': ' + acc + '%" style="cursor:pointer"></div>';
  }).join("");
}

// ============================================================
//  STATISTICS
// ============================================================
function renderStatistics() { renderPerfChart("monthly-chart", [82,88,85,90,93,91,96]); }

// ============================================================
//  PERFORMANCE CHART
// ============================================================
function renderPerfChart(id, heights) {
  const el = document.getElementById(id);
  if (!el) return;
  const labels = ["88%","91%","90%","95%","90%","96%","94%"];
  el.innerHTML = heights.map(function(h, i) {
    return '<div class="mb-bar ' + (h>90?"great":h>83?"good":"") + '" style="height:' + h + '%;position:relative">' +
      '<div style="position:absolute;top:-22px;left:50%;transform:translateX(-50%);background:var(--bg-card);border:1px solid var(--border);border-radius:3px;padding:1px 5px;font-size:9px;font-family:var(--f-cond);font-weight:700;white-space:nowrap;opacity:0;transition:opacity .2s;pointer-events:none">' + labels[i] + '</div>' +
    '</div>';
  }).join("");
  el.querySelectorAll(".mb-bar").forEach(function(bar) {
    var tip = bar.querySelector("div");
    bar.addEventListener("mouseenter", function() { if(tip) tip.style.opacity="1"; });
    bar.addEventListener("mouseleave", function() { if(tip) tip.style.opacity="0"; });
  });
}

// ============================================================
//  BET CALCULATOR
// ============================================================
function initCalculators() { calcReturns(); calcKelly(); calcEV(); }

function calcReturns() {
  const stake  = parseFloat(document.getElementById("calc-stake")?.value) || 0;
  const odds   = parseFloat(document.getElementById("calc-odds")?.value)  || 1;
  const ret    = stake * odds, profit = ret - stake;
  const roi    = stake > 0 ? (profit / stake * 100) : 0;
  _set("calc-return", "\u00a3" + ret.toFixed(2));
  _set("calc-profit", "\u00a3" + profit.toFixed(2));
  _set("calc-roi",    roi.toFixed(1) + "%");
  const el = document.getElementById("calc-profit");
  if (el) el.style.color = profit >= 0 ? "var(--green-lt)" : "var(--red)";
}

function calcKelly() {
  const prob  = (parseFloat(document.getElementById("kelly-prob")?.value) || 0) / 100;
  const odds  = parseFloat(document.getElementById("kelly-odds")?.value)  || 1;
  const bank  = parseFloat(document.getElementById("kelly-bank")?.value)  || 0;
  const kelly = odds > 1 ? Math.max(0, (prob*(odds-1)-(1-prob))/(odds-1)) : 0;
  _set("kelly-pct",   (kelly*100).toFixed(1)+"%");
  _set("kelly-stake", "\u00a3"+(bank*kelly).toFixed(2));
  _set("kelly-half",  "\u00a3"+(bank*kelly/2).toFixed(2));
}

function calcEV() {
  const prob  = (parseFloat(document.getElementById("ev-prob")?.value)  || 0) / 100;
  const odds  = parseFloat(document.getElementById("ev-odds")?.value)   || 1;
  const stake = parseFloat(document.getElementById("ev-stake")?.value)  || 0;
  const ev    = (prob*(odds-1)-(1-prob))*stake;
  const fair  = prob > 0 ? (1/prob).toFixed(2) : "\u2014";
  const edge  = prob > 0 ? ((odds*prob-1)*100).toFixed(1) : "0";
  const evEl  = document.getElementById("ev-result");
  const edEl  = document.getElementById("ev-edge");
  if (evEl) { evEl.textContent = (ev>=0?"+":"")+"\u00a3"+ev.toFixed(2); evEl.style.color = ev>=0?"var(--green-lt)":"var(--red)"; }
  _set("ev-fair", fair);
  if (edEl) { edEl.textContent = (parseFloat(edge)>=0?"+":"")+edge+"%"; edEl.style.color = parseFloat(edge)>=0?"var(--gold)":"var(--red)"; }
}

// ============================================================
//  LIVE SIMULATION
// ============================================================
function simulateLive() {
  setInterval(function() {
    const live = MATCHES.filter(function(m) { return m.status === "live"; });
    if (!live.length) return;
    const m = live[Math.floor(Math.random() * live.length)];
    if (Math.random() < 0.10) {
      const scorer = Math.random() < 0.55 ? "home" : "away";
      const parts  = (m.score || "0\u20130").split("\u2013").map(Number);
      if (scorer === "home") { parts[0]++; m.homeProb = Math.min(88, m.homeProb+Math.floor(Math.random()*8+3)); m.awayProb = Math.max(5, m.awayProb-5); }
      else                   { parts[1]++; m.awayProb = Math.min(88, m.awayProb+Math.floor(Math.random()*8+3)); m.homeProb = Math.max(5, m.homeProb-5); }
      m.drawProb = Math.max(5, 100-m.homeProb-m.awayProb);
      m.score = parts.join("\u2013");
      showToast("\u26bd GOAL! " + m.home + " " + m.score + " " + m.away, 4000);
    }
    var match = m.kickoff.match(/LIVE (\d+)\u2032/);
    if (match) {
      var min = Math.min(90, parseInt(match[1]) + 1);
      m.kickoff = "LIVE " + min + "\u2032";
      if (min >= 90) { m.status = "finished"; m.kickoff = "FT"; }
    }
    updateTicker();
    var ap = document.querySelector(".page.active");
    if (ap) { var pg = ap.id.replace("page-",""); if (pg==="dashboard") renderDashMatches(); if (pg==="live") renderLive(); }
  }, 25000);
}

// ── KEYBOARD ─────────────────────────────────────────────────
document.addEventListener("keydown", function(e) {
  if (e.key === "Escape") { document.getElementById("betslip-panel")?.classList.remove("open"); document.getElementById("notif-panel")?.classList.remove("open"); STATE.betslipOpen=false; STATE.notifOpen=false; closeDropdown(); }
});

// ── GLOBAL EXPOSE ─────────────────────────────────────────────
window.navigateTo        = navigateTo;
window.logout            = logout;
window.toggleSidebar     = toggleSidebar;
window.closeSidebar      = closeSidebar;
window.toggleDropdown    = toggleDropdown;
window.closeDropdown     = closeDropdown;
window.toggleBetslip     = toggleBetslip;
window.addToBetslip      = addToBetslip;
window.removeBetslipItem = removeBetslipItem;
window.placeBet          = placeBet;
window.toggleNotif       = toggleNotif;
window.handleSearch      = handleSearch;
window.showToast         = showToast;
window.calcReturns       = calcReturns;
window.calcKelly         = calcKelly;
window.calcEV            = calcEV;

// ── BOOT ─────────────────────────────────────────────────────
function boot() {
  updateTicker();
  renderDashboard();
  renderNotifications();
  renderInsights();
  renderHistory();
  simulateLive();
  setInterval(updateTicker, 60000);
}

if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", boot); }
else { boot(); }