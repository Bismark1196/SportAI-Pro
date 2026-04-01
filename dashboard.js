/**
 * dashboard.js — SportAI Frontend
 * Connects to Flask backend at http://localhost:5000/api
 * Gracefully falls back to rich mock data if backend is offline.
 */

"use strict";

// ============================================================
//  CONFIG
// ============================================================
const API_BASE = "http://localhost:5000/api";

// ============================================================
//  PROMO CODES  (frontend validation — also enforced in DB)
// ============================================================
const PROMO_CODES = {
  "SPORT-PRO-2026":  { plan: "Pro",     label: "Pro Plan",     months: 1 },
  "SPORT-VIP-2026":  { plan: "Premium", label: "Premium Plan", months: 3 },
  "SPORT-TRIAL-001": { plan: "Pro",     label: "7-Day Trial",  months: 0 },
  "SPORTAI-ACCESS":  { plan: "Pro",     label: "Pro Plan",     months: 1 },
  "VIP-MEMBER-2026": { plan: "Premium", label: "Premium Plan", months: 6 },
  "BETA-TESTER-001": { plan: "Premium", label: "Beta Access",  months: 12 },
};

// ============================================================
//  MOCK DATA  (used when backend is offline)
// ============================================================
const MOCK_MATCHES = [
  { id:1, api_id:1001, comp:"Premier League", flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿", kickoff:"LIVE 73'", status:"live",
    home:"Man City", away:"Arsenal", home_score:2, away_score:1,
    home_prob:58, draw_prob:22, away_prob:20, home_odds:1.72, draw_odds:3.50, away_odds:4.80,
    home_form:["W","W","D","W","W"], away_form:["W","L","W","W","D"],
    confidence:"high", value_side:"home",
    ai_insight:"Man City dominate with 68% possession. Value in Home Win at 1.72 — EV +0.04." },
  { id:2, api_id:1002, comp:"La Liga", flag:"🇪🇸", kickoff:"LIVE 34'", status:"live",
    home:"Real Madrid", away:"Barcelona", home_score:0, away_score:1,
    home_prob:29, draw_prob:24, away_prob:47, home_odds:2.10, draw_odds:3.20, away_odds:3.60,
    home_form:["W","W","W","D","L"], away_form:["W","W","D","W","W"],
    confidence:"med", value_side:"away",
    ai_insight:"Barcelona lead and hold superior form. Away win EV positive at 3.60." },
  { id:3, api_id:1003, comp:"Champions League", flag:"🇪🇺", kickoff:"20:45", status:"upcoming",
    home:"PSG", away:"Bayern Munich", home_score:null, away_score:null,
    home_prob:36, draw_prob:26, away_prob:38, home_odds:2.50, draw_odds:3.10, away_odds:2.90,
    home_form:["W","D","W","L","W"], away_form:["W","W","W","D","W"],
    confidence:"low", value_side:"away",
    ai_insight:"Closely matched. Bayern slight value at 2.90 — model gives 38% vs 34% implied." },
  { id:4, api_id:1004, comp:"Serie A", flag:"🇮🇹", kickoff:"21:00", status:"upcoming",
    home:"Juventus", away:"Inter Milan", home_score:null, away_score:null,
    home_prob:41, draw_prob:30, away_prob:29, home_odds:2.30, draw_odds:3.00, away_odds:3.20,
    home_form:["D","W","W","D","W"], away_form:["W","L","W","W","D"],
    confidence:"med", value_side:"home",
    ai_insight:"Juventus home advantage and form edge. Home win value at 2.30 — EV +0.03." },
  { id:5, api_id:1005, comp:"Bundesliga", flag:"🇩🇪", kickoff:"18:30", status:"upcoming",
    home:"Dortmund", away:"Leverkusen", home_score:null, away_score:null,
    home_prob:44, draw_prob:27, away_prob:29, home_odds:2.20, draw_odds:3.40, away_odds:3.10,
    home_form:["W","W","L","W","D"], away_form:["W","W","W","L","W"],
    confidence:"med", value_side:null,
    ai_insight:"Evenly matched. No strong value detected; monitor odds movement closer to kick-off." },
  { id:6, api_id:1006, comp:"Ligue 1", flag:"🇫🇷", kickoff:"19:00", status:"upcoming",
    home:"Lyon", away:"Marseille", home_score:null, away_score:null,
    home_prob:39, draw_prob:28, away_prob:33, home_odds:2.60, draw_odds:3.10, away_odds:2.80,
    home_form:["D","W","D","W","L"], away_form:["W","D","W","W","D"],
    confidence:"low", value_side:null,
    ai_insight:"Lyon vs Marseille historically tight. Draw market worth monitoring at 3.10." },
  { id:7, api_id:1007, comp:"Premier League", flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿", kickoff:"LIVE 82'", status:"live",
    home:"Chelsea", away:"Liverpool", home_score:1, away_score:1,
    home_prob:21, draw_prob:44, away_prob:35, home_odds:5.20, draw_odds:2.40, away_odds:3.80,
    home_form:["L","D","W","L","D"], away_form:["W","W","D","W","L"],
    confidence:"med", value_side:"draw",
    ai_insight:"Draw highly probable at 82' with parity. Draw at 2.40 represents value — EV +0.05." },
  { id:8, api_id:1008, comp:"La Liga", flag:"🇪🇸", kickoff:"22:00", status:"upcoming",
    home:"Atletico", away:"Sevilla", home_score:null, away_score:null,
    home_prob:52, draw_prob:25, away_prob:23, home_odds:1.90, draw_odds:3.60, away_odds:4.40,
    home_form:["W","W","W","D","W"], away_form:["D","W","L","D","W"],
    confidence:"high", value_side:"home",
    ai_insight:"Atletico strong home record (W4 D1 L0 last 5). Home win value at 1.90 — EV +0.03." },
];

const MOCK_NOTIFICATIONS = [
  { id:1, icon:"⚽", title:"GOAL! Man City 2–1 Arsenal",  description:"Haaland 73' — AI predicted Home Win (58%). Probs updated.", created_at:new Date(Date.now()-120000).toISOString(), unread:1 },
  { id:2, icon:"💎", title:"High Value Bet Found",         description:"Bayern Munich Away vs PSG @ 2.90 — EV +0.04. Kelly: £12.80.", created_at:new Date(Date.now()-480000).toISOString(), unread:1 },
  { id:3, icon:"🔔", title:"Match Starting Soon",          description:"Juventus vs Inter Milan kicks off in 30 minutes.", created_at:new Date(Date.now()-1320000).toISOString(), unread:1 },
  { id:4, icon:"✅", title:"Prediction Correct",           description:"Real Madrid Win (1.85) confirmed — +£8.50 profit.", created_at:new Date(Date.now()-7200000).toISOString(), unread:0 },
  { id:5, icon:"📊", title:"Weekly Report Ready",          description:"Your performance report for this week is available.", created_at:new Date(Date.now()-18000000).toISOString(), unread:0 },
  { id:6, icon:"🤖", title:"AI Model Updated",             description:"DeepMatch v3.2 deployed with improved draw detection.", created_at:new Date(Date.now()-86400000).toISOString(), unread:0 },
];

const MOCK_LEADERBOARD = [
  { rank:1, init:"JS", bg:"linear-gradient(135deg,#f0a500,#c07d00)", name:"John S.", tag:"@johnsmith", bets:284, acc:"94.2%", profit:"+£3,840", roi:"18.4%", pos:true },
  { rank:2, init:"MR", bg:"#c0c0c0",  name:"Maria R.",  tag:"@maria_r",  bets:310, acc:"91.8%", profit:"+£2,140", roi:"14.2%", pos:true },
  { rank:3, init:"DK", bg:"#cd7f32",  name:"David K.",  tag:"@dkings",   bets:198, acc:"93.4%", profit:"+£1,920", roi:"16.1%", pos:true },
  { rank:4, init:"AL", bg:"#7c5cbf",  name:"Alex L.",   tag:"@alexL",    bets:422, acc:"88.7%", profit:"+£1,540", roi:"11.3%", pos:true },
  { rank:5, init:"SB", bg:"#e63946",  name:"Sophie B.", tag:"@sophieb",  bets:167, acc:"90.1%", profit:"+£980",   roi:"9.8%",  pos:true },
  { rank:6, init:"TM", bg:"#3a8ef6",  name:"Tom M.",    tag:"@tommitch", bets:289, acc:"85.2%", profit:"-£120",   roi:"-0.4%", pos:false },
  { rank:7, init:"KA", bg:"#2ec27e",  name:"Kenji A.",  tag:"@kenji_a",  bets:134, acc:"87.6%", profit:"+£640",   roi:"8.1%",  pos:true },
];

const MOCK_HISTORY = [
  { match:"Man City vs Arsenal",      selection:"Man City Win",   odds:1.65, stake:10, result:"WON",     profit:6.50,  created_at:new Date().toISOString() },
  { match:"Real Madrid vs Barcelona", selection:"Draw",           odds:3.20, stake:10, result:"LOST",    profit:-10,   created_at:new Date(Date.now()-3600000).toISOString() },
  { match:"Bayern vs Dortmund",       selection:"Bayern Win",     odds:1.85, stake:10, result:"WON",     profit:8.50,  created_at:new Date(Date.now()-86400000).toISOString() },
  { match:"PSG vs Marseille",         selection:"PSG Win",        odds:1.50, stake:20, result:"WON",     profit:10,    created_at:new Date(Date.now()-86400000).toISOString() },
  { match:"Juventus vs Roma",         selection:"Draw",           odds:3.00, stake:10, result:"LOST",    profit:-10,   created_at:new Date(Date.now()-172800000).toISOString() },
  { match:"Liverpool vs Chelsea",     selection:"Liverpool Win",  odds:1.72, stake:15, result:"WON",     profit:10.80, created_at:new Date(Date.now()-172800000).toISOString() },
  { match:"Atletico vs Sevilla",      selection:"Atletico Win",   odds:1.90, stake:10, result:"PENDING", profit:0,     created_at:new Date().toISOString() },
];

// ============================================================
//  STATE
// ============================================================
let STATE = {
  user:         null,
  userId:       1,
  matches:      [],
  notifications:[],
  leaderboard:  [],
  history:      [],
  betslip:      {},
  dashFilter:   "all",
  predFilter:   "all",
  histFilter:   "all",
  backendOnline: false,
};

let PROMO_VERIFIED = null;

// ============================================================
//  API CLIENT
// ============================================================
async function apiFetch(path, opts = {}) {
  try {
    const res = await fetch(API_BASE + path, {
      headers: {
        "Content-Type": "application/json",
        "X-User-Id": String(STATE.userId),
      },
      ...opts,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    STATE.backendOnline = true;
    return await res.json();
  } catch (e) {
    STATE.backendOnline = false;
    console.warn(`[API] ${path} — offline, using mock data`);
    return null;
  }
}
const apiGet  = p       => apiFetch(p);
const apiPost = (p, b)  => apiFetch(p, { method:"POST", body: JSON.stringify(b) });
const apiPut  = (p, b)  => apiFetch(p, { method:"PUT",  body: JSON.stringify(b) });

// ============================================================
//  DATA LOADERS
// ============================================================
async function loadMatches() {
  const d = await apiGet("/matches");
  STATE.matches = (d?.matches?.length > 0) ? d.matches : MOCK_MATCHES;
}

async function loadNotifications() {
  const d = await apiGet(`/notifications?user_id=${STATE.userId}`);
  STATE.notifications = d?.notifications?.length ? d.notifications : MOCK_NOTIFICATIONS;
}

async function loadLeaderboard() {
  const d = await apiGet("/leaderboard");
  STATE.leaderboard = d?.leaderboard?.length ? d.leaderboard : MOCK_LEADERBOARD;
}

async function loadHistory() {
  const d = await apiGet(`/history?user_id=${STATE.userId}`);
  STATE.history = d?.predictions?.length ? d.predictions : MOCK_HISTORY;
}

async function loadStats() {
  const d = await apiGet("/stats");
  if (d) {
    _set("t-total",   d.total_matches);
    _set("t-live",    d.live_matches);
    _set("t-val",     d.value_bets);
    _set("live-badge",d.live_matches);
    _set("val-badge", d.value_bets);
    _set("vb-badge",  d.value_bets);
    _set("dash-live", d.live_matches);
    _set("dash-value",d.value_bets);
    _set("vb-count",  d.value_bets);
    _set("ticker-time","Updated " + new Date().toLocaleTimeString());
  }
}

function _set(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

// ============================================================
//  AUTH — Login
// ============================================================
function switchTab(tab) {
  document.getElementById("form-login").style.display  = tab === "login"  ? "block" : "none";
  document.getElementById("form-signup").style.display = tab === "signup" ? "block" : "none";
  document.getElementById("tab-login").classList.toggle("active",  tab === "login");
  document.getElementById("tab-signup").classList.toggle("active", tab === "signup");
}

function togglePw(id, btn) {
  const inp = document.getElementById(id);
  inp.type       = inp.type === "password" ? "text" : "password";
  btn.textContent = inp.type === "password" ? "👁" : "🙈";
}

async function handleLogin() {
  const u   = document.getElementById("login-user").value.trim();
  const p   = document.getElementById("login-pass").value;
  const btn = document.getElementById("login-btn");
  const err = document.getElementById("login-err");
  err.classList.remove("show");
  ["login-user","login-pass"].forEach(id => document.getElementById(id).classList.remove("error"));

  if (!u || !p) { err.textContent = "Please enter username and password."; err.classList.add("show"); return; }

  _btnLoading(btn, "login-btn-text", "login-loading", true);

  // Try backend first
  const d = await apiPost("/auth/login", { username: u, password: p });

  if (d?.ok) {
    STATE.user   = d.user;
    STATE.userId = d.user.id;
    enterApp(d.user);
  } else {
    // Demo fallback (john / password123)
    if ((u === "john" || u === "john@sportai.demo") && p === "password123") {
      const demoUser = { id:1, username:"john", name:"John Smithson", email:"john@sportai.demo", plan:"pro", initials:"JS" };
      STATE.user   = demoUser;
      STATE.userId = 1;
      enterApp(demoUser);
    } else {
      err.textContent = "Invalid credentials. Try: john / password123";
      err.classList.add("show");
      ["login-user","login-pass"].forEach(id => document.getElementById(id).classList.add("error"));
    }
  }
  _btnLoading(btn, "login-btn-text", "login-loading", false);
}

// ============================================================
//  AUTH — Signup (promo-gated)
// ============================================================
function verifyPromo() {
  const code = document.getElementById("promo-code").value.trim().toUpperCase();
  const btn  = document.getElementById("promo-btn");
  btn.disabled = true; btn.textContent = "…";

  setTimeout(() => {
    const match = PROMO_CODES[code];
    document.getElementById("promo-valid").style.display   = match ? "flex" : "none";
    document.getElementById("promo-invalid").style.display = match ? "none"  : "flex";
    if (match) {
      document.getElementById("promo-plan-name").textContent = match.label;
      PROMO_VERIFIED = { code, ...match };
    } else {
      PROMO_VERIFIED = null;
    }
    btn.disabled = false; btn.textContent = "Verify";
  }, 900);
}

async function handleSignup() {
  const fname = document.getElementById("reg-fname").value.trim();
  const lname = document.getElementById("reg-lname").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const uname = document.getElementById("reg-user").value.trim();
  const pass  = document.getElementById("reg-pass").value;
  const terms = document.getElementById("terms-cb").checked;
  const err   = document.getElementById("signup-err");
  err.style.display = "none";

  if (!PROMO_VERIFIED)                  { err.textContent = "Please verify your access code first."; err.style.display = "block"; return; }
  if (!fname||!lname||!email||!uname)   { err.textContent = "Please fill in all fields."; err.style.display = "block"; return; }
  if (pass.length < 8)                  { err.textContent = "Password must be at least 8 characters."; err.style.display = "block"; return; }
  if (!terms)                           { err.textContent = "Please accept the Terms of Service."; err.style.display = "block"; return; }

  const btn = document.getElementById("signup-btn");
  _btnLoading(btn, "signup-btn-text", "signup-loading", true);

  const d = await apiPost("/auth/register", { username: uname, email, password: pass });

  let user;
  if (d?.ok) {
    user = d.user;
    user.name = `${fname} ${lname}`;
    user.initials = (fname[0] + lname[0]).toUpperCase();
  } else {
    // offline fallback — create local session
    user = { id:1, username:uname, name:`${fname} ${lname}`, email, plan:PROMO_VERIFIED.plan, initials:(fname[0]+lname[0]).toUpperCase() };
    if (d?.error) { err.textContent = d.error; err.style.display = "block"; _btnLoading(btn,"signup-btn-text","signup-loading",false); return; }
  }

  STATE.user   = user;
  STATE.userId = user.id;
  _btnLoading(btn, "signup-btn-text", "signup-loading", false);
  enterApp(user);
}

function _btnLoading(btn, textId, spinId, loading) {
  btn.disabled = loading;
  document.getElementById(textId).style.display = loading ? "none"  : "block";
  document.getElementById(spinId).classList.toggle("show", loading);
}

// ============================================================
//  ENTER APP
// ============================================================
async function enterApp(user) {
  document.getElementById("auth-screen").classList.add("hidden");
  document.getElementById("app").classList.add("show");

  const first = (user.name || user.username || "").split(" ")[0];
  const init  = user.initials || (user.name || "JS").substring(0,2).toUpperCase();

  _set("nav-avatar",   init);
  _set("nav-username", first);
  _set("ud-name",  user.name  || user.username);
  _set("ud-email", user.email || "");
  _set("ud-plan",  (user.plan || "pro").charAt(0).toUpperCase() + (user.plan || "pro").slice(1));
  _set("set-name", user.name  || user.username);
  _set("set-email",user.email || "");
  _set("set-plan", (user.plan || "PRO").toUpperCase());
  _set("dash-welcome", first);

  if (!STATE.backendOnline) showToast("ℹ  Running in offline mode — using demo data", "info");

  await Promise.all([loadMatches(), loadNotifications(), loadLeaderboard(), loadHistory()]);
  await loadStats();
  renderNotifications();
  renderDashboard();
  simulateLive();

  // Auto-refresh every 30s
  setInterval(async () => {
    await loadMatches();
    await loadStats();
    refreshCurrent();
  }, 30000);
}

function logout() {
  STATE.user   = null;
  STATE.betslip = {};
  document.getElementById("app").classList.remove("show");
  document.getElementById("auth-screen").classList.remove("hidden");
  switchTab("login");
  closeAllPanels();
  showToast("Signed out successfully", "info");
}

// ============================================================
//  NAVIGATION
// ============================================================
function navigateTo(page) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".nav-item,.mn-item").forEach(n => n.classList.remove("active"));
  const pg = document.getElementById("page-" + page);
  if (pg) pg.classList.add("active");
  document.querySelectorAll(`[data-page="${page}"]`).forEach(n => n.classList.add("active"));
  closeSidebar();
  renderPage(page);
  window.scrollTo(0, 0);
}

document.querySelectorAll(".nav-item[data-page],.mn-item[data-page]").forEach(btn => {
  btn.addEventListener("click", () => navigateTo(btn.dataset.page));
});

function renderPage(p) {
  const map = {
    dashboard:   renderDashboard,
    predictions: renderPredictions,
    live:        renderLive,
    valuebets:   renderValueBets,
    leaderboard: renderLeaderboard,
    history:     renderHistory,
    insights:    renderInsights,
    statistics:  renderStatistics,
  };
  if (map[p]) map[p]();
}

function refreshCurrent() {
  const a = document.querySelector(".page.active");
  if (a) renderPage(a.id.replace("page-", ""));
}

// ============================================================
//  SIDEBAR
// ============================================================
document.getElementById("hamburger-btn").addEventListener("click", () => {
  document.getElementById("sidebar").classList.add("open");
  document.getElementById("sidebar-overlay").classList.add("show");
});
function closeSidebar() {
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("sidebar-overlay").classList.remove("show");
}

// ============================================================
//  USER DROPDOWN
// ============================================================
document.getElementById("user-menu-btn").addEventListener("click", e => {
  e.stopPropagation();
  document.getElementById("user-dropdown").classList.toggle("open");
});
document.addEventListener("click", () => document.getElementById("user-dropdown").classList.remove("open"));
function closeDropdown() { document.getElementById("user-dropdown").classList.remove("open"); }

// ============================================================
//  PANELS
// ============================================================
document.getElementById("betslip-btn").addEventListener("click", () => togglePanel("betslip-panel"));
document.getElementById("bp-close").addEventListener("click",    closeAllPanels);
document.getElementById("notif-btn").addEventListener("click",   () => {
  togglePanel("notif-panel");
  document.getElementById("notif-dot").style.display = "none";
  apiPost("/notifications/read", { user_id: STATE.userId });
});
document.getElementById("np-close").addEventListener("click",    closeAllPanels);
document.getElementById("panel-overlay").addEventListener("click", closeAllPanels);

function togglePanel(id) {
  const isOpen = document.getElementById(id).classList.contains("open");
  closeAllPanels();
  if (!isOpen) {
    document.getElementById(id).classList.add("open");
    document.getElementById("panel-overlay").classList.add("show");
  }
}
function closeAllPanels() {
  ["betslip-panel","notif-panel"].forEach(id => document.getElementById(id).classList.remove("open"));
  document.getElementById("panel-overlay").classList.remove("show");
}

// ============================================================
//  SEARCH
// ============================================================
function openSearch() {
  document.getElementById("search-overlay").classList.add("show");
  document.getElementById("search-overlay-inp").focus();
}
function closeSearch(e) {
  if (!e || e.target === document.getElementById("search-overlay"))
    document.getElementById("search-overlay").classList.remove("show");
}
function liveSearch(q) {
  const r = document.getElementById("search-results");
  if (!q) { r.innerHTML = ""; return; }
  const hits = STATE.matches.filter(m =>
    (m.home||"").toLowerCase().includes(q.toLowerCase()) ||
    (m.away||"").toLowerCase().includes(q.toLowerCase()) ||
    (m.comp||"").toLowerCase().includes(q.toLowerCase())
  );
  r.innerHTML = hits.length
    ? hits.map(m => `<div class="search-result" onclick="closeSearch();navigateTo('predictions')">${m.flag} <strong>${m.home}</strong> vs <strong>${m.away}</strong> <span style="color:var(--text-3);font-size:11px">— ${m.comp}</span></div>`).join("")
    : `<div class="search-empty">No matches found for "<strong>${q}</strong>"</div>`;
}
document.getElementById("search-inp").addEventListener("click", openSearch);
document.getElementById("search-inp").addEventListener("input", e => liveSearch(e.target.value));

// ============================================================
//  HELPERS
// ============================================================
function evSide(m) {
  const ho = m.home_odds || m.ho || 0;
  const _do = m.draw_odds || m.do || 0;
  const ao = m.away_odds || m.ao || 0;
  const hp = (m.home_prob || m.hp || 0) / 100;
  const dp = (m.draw_prob || m.dp || 0) / 100;
  const ap = (m.away_prob || m.ap || 0) / 100;
  const evH = ho > 1 ? hp - 1/ho : -1;
  const evD = _do > 1 ? dp - 1/_do : -1;
  const evA = ao > 1 ? ap - 1/ao : -1;
  const best = Math.max(evH, evD, evA);
  if (best <= 0.01) return null;
  return best === evH ? "home" : best === evD ? "draw" : "away";
}

function getOdds(m) {
  return {
    home: m.home_odds || m.ho || 0,
    draw: m.draw_odds || m.do || 0,
    away: m.away_odds || m.ao || 0,
  };
}

function getProbs(m) {
  return {
    home: m.home_prob || m.hp || 0,
    draw: m.draw_prob || m.dp || 0,
    away: m.away_prob || m.ap || 0,
  };
}

function getForm(m, side) {
  const f = side === "home" ? (m.home_form || m.hf) : (m.away_form || m.af);
  return Array.isArray(f) ? f : [];
}

function formDot(r) {
  return `<div class="f-dot f${r.toLowerCase()}">${r}</div>`;
}

function confCls(m) {
  const c = m.confidence || m.conf || "low";
  return c === "high" ? "c-high" : c === "med" ? "c-med" : "c-low";
}
function confLbl(m) {
  const c = m.confidence || m.conf || "low";
  return c === "high" ? "High Confidence" : c === "med" ? "Medium Confidence" : "Low Confidence";
}

function getStatus(m) { return m.status || "upcoming"; }

function getKickoff(m) { return m.kickoff || m.time_str || "TBD"; }

function getInsight(m) { return m.ai_insight || m.ai || "AI analysis in progress…"; }

function getMatchId(m) { return m.id || m.api_id; }

function animBars(el) {
  requestAnimationFrame(() => {
    el.querySelectorAll(".prob-fill[data-w]").forEach(e => e.style.width = e.dataset.w + "%");
  });
}

function fmtDate(iso) {
  try {
    const d = new Date(iso), now = new Date();
    const diff = (now - d) / 1000;
    if (diff < 60)    return "Just now";
    if (diff < 3600)  return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString();
  } catch { return iso || ""; }
}

// ============================================================
//  RENDER: MATCH CARD (compact table row)
// ============================================================
function renderMatchCard(m, i = 0) {
  const bv  = evSide(m);
  const sel = STATE.betslip[String(getMatchId(m))];
  const o   = getOdds(m);
  const p   = getProbs(m);
  const st  = getStatus(m);
  const id  = getMatchId(m);

  const hs  = (st === "live" && m.home_score != null) ? `<div class="team-s">${m.home_score}</div>` : "";
  const as_ = (st === "live" && m.away_score != null) ? `<div class="team-s">${m.away_score}</div>` : "";

  const vts = { home:"vt-h", draw:"vt-d", away:"vt-a" };
  const vls = { home:`1 ${(m.home||"").split(" ")[0]}`, draw:"X Draw", away:`2 ${(m.away||"").split(" ")[0]}` };

  const ob = (type, lbl, odds) => {
    if (!odds) return "";
    const isBest = bv === type, isSel = sel && sel.type === type;
    return `<div class="odds-cell"><button class="odds-btn${isBest?" best":""}${isSel?" sel":""}" onclick="toggleBet(${id},'${type}',${odds},'${m.home}','${m.away}')"><span class="o-type">${lbl}</span><span class="o-num">${(+odds).toFixed(2)}</span></button></div>`;
  };

  const strip = sel ? `<div class="bs-strip">
    <span class="bs-lbl">Selected</span>
    <span class="bs-sel"><strong>${sel.type==="home"?m.home:sel.type==="away"?m.away:"Draw"}</strong> — ${m.home} v ${m.away}</span>
    <span class="bs-odds">@ ${sel.odds.toFixed(2)}</span>
    <button class="bs-add" onclick="togglePanel('betslip-panel')">+ Betslip</button>
  </div>` : "";

  return `<div class="match-card${st==="live"?" live-card":bv?" value-card":""}" style="animation-delay:${i*.04}s">
    <div class="match-row">
      <div class="match-info">
        <div class="match-meta">
          <div class="match-time${st==="live"?" live":""}">${getKickoff(m)}</div>
          <div class="match-comp">${m.flag||"🌍"} ${m.comp||""}</div>
        </div>
        <div class="teams">
          <div class="team-r"><div class="team-n">${m.home}</div>${hs}</div>
          <div class="team-r"><div class="team-n">${m.away}</div>${as_}</div>
        </div>
      </div>
      <div class="prob-col">
        <div class="prob-r"><span class="prob-l">1</span><div class="prob-track"><div class="prob-fill pf-h" data-w="${p.home}" style="width:0%"></div></div><span class="prob-pct pct-h">${p.home}%</span></div>
        <div class="prob-r"><span class="prob-l">X</span><div class="prob-track"><div class="prob-fill pf-d" data-w="${p.draw}" style="width:0%"></div></div><span class="prob-pct pct-d">${p.draw}%</span></div>
        <div class="prob-r"><span class="prob-l">2</span><div class="prob-track"><div class="prob-fill pf-a" data-w="${p.away}" style="width:0%"></div></div><span class="prob-pct pct-a">${p.away}%</span></div>
      </div>
      ${ob("home","1",o.home)}${ob("draw","X",o.draw)}${ob("away","2",o.away)}
      <div class="val-cell">${bv ? `<span class="val-tag ${vts[bv]}">${vls[bv]}</span>` : `<span style="color:var(--text-3)">—</span>`}</div>
    </div>${strip}
  </div>`;
}

// ============================================================
//  RENDER: PREDICTION CARD (expanded)
// ============================================================
function renderPredCard(m, i = 0) {
  const bv  = evSide(m);
  const o   = getOdds(m);
  const p   = getProbs(m);
  const st  = getStatus(m);
  const id  = getMatchId(m);
  const hf  = getForm(m, "home");
  const af  = getForm(m, "away");
  const bvOdds = bv === "home" ? o.home : bv === "draw" ? o.draw : o.away;

  return `<div class="pred-card" style="animation-delay:${i*.05}s">
    <div class="pc-hd">
      <div style="display:flex;align-items:center;gap:8px">
        <span class="comp-tag${st==="live"?" live":""}">${m.flag||"🌍"} ${m.comp||""}</span>
        <span style="font-size:11px;color:var(--text-3)">${getKickoff(m)}</span>
      </div>
      <div class="conf-badge ${confCls(m)}"><div class="c-dot"></div>${confLbl(m)}</div>
    </div>
    <div class="pc-bd">
      <div class="vs-row">
        <div class="vs-team">
          <div class="vt-name">${m.home}</div>
          <div class="vt-form" style="display:flex;gap:3px;margin-top:5px">${hf.map(formDot).join("")}</div>
        </div>
        <div class="vs-mid">
          <div class="vs-mid-time">${getKickoff(m)}</div>
          <div class="vs-mid-vs">VS</div>
          ${st==="live" ? `<div style="font-size:14px;font-weight:700;color:#fff;margin-top:4px">${m.home_score??0}–${m.away_score??0}</div>` : ""}
        </div>
        <div class="vs-team away">
          <div class="vt-name">${m.away}</div>
          <div class="vt-form" style="display:flex;gap:3px;margin-top:5px;justify-content:flex-end">${af.map(formDot).join("")}</div>
        </div>
      </div>
      <div class="probs-row">
        <div class="prob-seg seg-h${bv==="home"?" seg-best":""}"><div class="ps-lbl">Home Win</div><div class="ps-val">${p.home}%</div><div class="ps-odds">${o.home.toFixed(2)}</div></div>
        <div class="prob-seg seg-d${bv==="draw"?" seg-best":""}"><div class="ps-lbl">Draw</div><div class="ps-val">${p.draw}%</div><div class="ps-odds">${o.draw.toFixed(2)}</div></div>
        <div class="prob-seg seg-a${bv==="away"?" seg-best":""}"><div class="ps-lbl">Away Win</div><div class="ps-val">${p.away}%</div><div class="ps-odds">${o.away.toFixed(2)}</div></div>
      </div>
      <div class="ai-row"><span class="ai-icon-lbl">🤖</span><strong>AI:</strong> ${getInsight(m)}</div>
    </div>
    <div class="pc-ft">
      <div class="pc-stats">
        <div class="pc-stat"><strong>${Math.max(p.home,p.draw,p.away)}%</strong>AI Confidence</div>
        <div class="pc-stat"><strong>${st==="live"?"In Play":"Pre-Match"}</strong>Status</div>
        ${bv ? `<div class="pc-stat"><strong style="color:var(--green)">+EV</strong>Value Bet</div>` : ""}
      </div>
      <div style="display:flex;gap:6px">
        <button class="btn btn-sm btn-outline">📊 H2H</button>
        ${bv ? `<button class="btn btn-sm btn-gold" onclick="toggleBet(${id},'${bv}',${bvOdds},'${m.home}','${m.away}')">+ Select</button>` : ""}
      </div>
    </div>
  </div>`;
}

// ============================================================
//  BETSLIP
// ============================================================
function toggleBet(id, type, odds, home, away) {
  const key = String(id);
  if (STATE.betslip[key] && STATE.betslip[key].type === type) delete STATE.betslip[key];
  else STATE.betslip[key] = { type, odds: +odds, home, away, match_id: id };
  updateBetslipUI();
  refreshCurrent();
}

function updateBetslipUI() {
  const count = Object.keys(STATE.betslip).length;
  _set("bp-cnt", count);
  const badge = document.getElementById("bs-badge");
  if (badge) { badge.textContent = count; badge.style.display = count ? "block" : "none"; }

  const items = document.getElementById("bp-items");
  const ft    = document.getElementById("bp-ft");
  if (!count) {
    items.innerHTML = '<div class="bp-empty"><div class="bp-empty-ico">🎫</div><p style="font-size:13px;color:var(--text-2)">No selections yet.<br>Click any odds to add.</p></div>';
    ft.style.display = "none";
    return;
  }
  items.innerHTML = Object.entries(STATE.betslip).map(([id, s]) => {
    const m = STATE.matches.find(x => String(x.id) === id || String(x.api_id) === id);
    const lbl = s.type === "home" ? s.home : s.type === "away" ? s.away : "Draw";
    return `<div class="bp-item">
      <div class="bp-match">${m ? m.comp : ""} — ${s.home} v ${s.away}</div>
      <div class="bp-sel">${lbl}</div>
      <div class="bp-odds">${s.odds.toFixed(2)}</div>
      <button class="bp-rm" onclick="removeBet('${id}')">✕</button>
    </div>`;
  }).join("");
  ft.style.display = "block";
  calcTotals();
}

function removeBet(id) { delete STATE.betslip[String(id)]; updateBetslipUI(); refreshCurrent(); }

function calcTotals() {
  const stake     = parseFloat(document.getElementById("bp-stake").value) || 10;
  const totalOdds = Object.values(STATE.betslip).reduce((a, s) => a * s.odds, 1);
  const ret       = stake * totalOdds;
  _set("bp-total-odds", totalOdds.toFixed(2));
  _set("bp-return",     "£" + ret.toFixed(2));
  _set("bp-profit",     "£" + (ret - stake).toFixed(2));
}

document.getElementById("bp-stake").addEventListener("input", calcTotals);

document.getElementById("bp-place").addEventListener("click", async () => {
  if (!Object.keys(STATE.betslip).length) return;
  const stake = parseFloat(document.getElementById("bp-stake").value) || 10;
  const bets  = Object.values(STATE.betslip).map(s => ({
    match_id:  s.match_id,
    selection: s.type === "home" ? `${s.home} Win` : s.type === "away" ? `${s.away} Win` : "Draw",
    odds:      s.odds,
    stake,
  }));
  await apiPost("/betslip/place", { user_id: STATE.userId, bets });
  STATE.betslip = {};
  updateBetslipUI();
  refreshCurrent();
  closeAllPanels();
  await loadHistory();
  showToast("✓ Bet placed successfully!", "success");
});

// ============================================================
//  PAGE RENDERS
// ============================================================

// DASHBOARD
function renderDashboard() {
  let list = [...STATE.matches];
  if (STATE.dashFilter === "live")     list = list.filter(m => getStatus(m) === "live");
  if (STATE.dashFilter === "upcoming") list = list.filter(m => getStatus(m) !== "live");

  const c = document.getElementById("dash-matches");
  c.innerHTML = list.slice(0, 5).map((m, i) => renderMatchCard(m, i)).join("");
  animBars(c);

  const vals = STATE.matches.filter(m => evSide(m)).slice(0, 4);
  const vl   = document.getElementById("top-val-list");
  vl.innerHTML = vals.map(m => {
    const bv   = evSide(m), o = getOdds(m);
    const odds = bv === "home" ? o.home : bv === "draw" ? o.draw : o.away;
    const lbl  = bv === "home" ? m.home : bv === "away" ? m.away : "Draw";
    const id   = getMatchId(m);
    return `<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 18px;border-bottom:1px solid var(--border);gap:10px">
      <div><div style="font-size:12px;font-weight:600">${m.home} v ${m.away}</div><div style="font-size:10px;color:var(--text-3)">${m.comp}</div></div>
      <div style="text-align:center">
        <div style="font-size:9px;color:var(--green);font-weight:700;text-transform:uppercase;letter-spacing:.5px">${lbl}</div>
        <div style="font-family:var(--f-display);font-size:20px;color:var(--gold);letter-spacing:.5px">${(+odds).toFixed(2)}</div>
      </div>
      <button class="btn btn-sm btn-green" onclick="toggleBet(${id},'${bv}',${odds},'${m.home}','${m.away}')">+ Add</button>
    </div>`;
  }).join("") || '<div style="padding:20px;text-align:center;color:var(--text-3)">No value bets detected right now</div>';

  // Performance chart
  const vals7 = [81,88,92,86,95,97,94];
  const pc = document.getElementById("perf-chart");
  if (pc) pc.innerHTML = vals7.map(v =>
    `<div class="bar-col"><div class="bar-fill" style="height:${v}%;background:${v>=90?"var(--green)":v>=85?"var(--gold)":"var(--blue)"}"></div></div>`
  ).join("");

  // Ticker
  const live   = STATE.matches.filter(m => getStatus(m) === "live").length;
  const vcount = STATE.matches.filter(m => evSide(m)).length;
  _set("t-total",    STATE.matches.length);
  _set("t-live",     live);
  _set("t-val",      vcount);
  _set("live-badge", live);
  _set("val-badge",  vcount);
  _set("vb-badge",   vcount);
  _set("dash-live",  live);
  _set("dash-value", vcount);
  _set("vb-count",   vcount);
  _set("ticker-time","Updated " + new Date().toLocaleTimeString());
  if (live > 0) document.getElementById("mn-dot-live")?.classList.add("show");
}

document.querySelectorAll("[data-df]").forEach(btn => btn.addEventListener("click", () => {
  document.querySelectorAll("[data-df]").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  STATE.dashFilter = btn.dataset.df;
  renderDashboard();
}));

// PREDICTIONS
function renderPredictions() {
  let list = [...STATE.matches];
  if (STATE.predFilter === "live")     list = list.filter(m => getStatus(m) === "live");
  if (STATE.predFilter === "upcoming") list = list.filter(m => getStatus(m) !== "live");
  if (STATE.predFilter === "value")    list = list.filter(m => evSide(m));
  if (STATE.predFilter === "high")     list = list.filter(m => (m.confidence||m.conf) === "high");

  const sort = document.getElementById("pred-sort")?.value;
  if (sort === "conf") list.sort((a, b) => Math.max(...Object.values(getProbs(b))) - Math.max(...Object.values(getProbs(a))));

  const c = document.getElementById("pred-container");
  c.innerHTML = list.length
    ? list.map((m, i) => renderPredCard(m, i)).join("")
    : `<div class="empty-st"><div class="empty-ico">📭</div><p>No predictions match this filter.</p></div>`;
}

document.querySelectorAll("[data-pf]").forEach(btn => btn.addEventListener("click", () => {
  document.querySelectorAll("[data-pf]").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  STATE.predFilter = btn.dataset.pf;
  renderPredictions();
}));
document.getElementById("pred-sort")?.addEventListener("change", renderPredictions);

// VALUE BETS
function renderValueBets() {
  const vals = STATE.matches.filter(m => evSide(m));
  const c = document.getElementById("vb-container");
  c.innerHTML = vals.length ? vals.map((m, i) => {
    const bv   = evSide(m), o = getOdds(m), p = getProbs(m);
    const odds = bv === "home" ? o.home : bv === "draw" ? o.draw : o.away;
    const prob = (bv === "home" ? p.home : bv === "draw" ? p.draw : p.away) / 100;
    const evPct  = ((prob * (odds - 1) - (1 - prob)) * 100).toFixed(1);
    const kelly  = Math.max(0, (prob * (odds - 1) - (1 - prob)) / (odds - 1) * 500 * 0.25).toFixed(2);
    const lbl    = bv === "home" ? m.home : bv === "away" ? m.away : "Draw";
    return renderPredCard(m, i) + `
      <div style="display:flex;gap:8px;padding:0 18px 14px;margin-top:-6px;flex-wrap:wrap">
        <div class="badge badge-green">EV +${evPct}%</div>
        <div class="badge badge-blue">Kelly £${kelly}</div>
        <div class="badge badge-gold">${lbl} @ ${(+odds).toFixed(2)}</div>
      </div>`;
  }).join("") : `<div class="empty-st"><div class="empty-ico">🔍</div><p>No value bets detected right now.</p></div>`;
}

// LIVE
function renderLive() {
  const live = STATE.matches.filter(m => getStatus(m) === "live");
  const c = document.getElementById("live-container");
  c.innerHTML = live.length
    ? live.map((m, i) => renderPredCard(m, i)).join("")
    : `<div class="empty-st"><div class="empty-ico">📡</div><p>No live matches right now. Check back soon.</p></div>`;
}

// LEADERBOARD
function renderLeaderboard() {
  document.getElementById("lb-rows").innerHTML = STATE.leaderboard.map(u => {
    const rc = u.rank===1?"r1":u.rank===2?"r2":u.rank===3?"r3":"";
    return `<div class="lb-row">
      <div class="lb-rank ${rc}">${u.rank}</div>
      <div class="lb-user">
        <div class="lb-av" style="background:${u.bg||u.color};color:${u.rank<=3?"#111":"#fff"}">${u.init}</div>
        <div><div class="lb-name">${u.name}</div><div class="lb-tag">${u.tag}</div></div>
      </div>
      <div class="lb-cell">${u.bets}</div>
      <div class="lb-cell acc">${u.acc}</div>
      <div class="lb-cell ${(u.pos||u.roi_pos)?"profit":"loss"}">${u.profit}</div>
      <div class="lb-cell"><span class="roi-pill ${(u.pos||u.roi_pos)?"roi-pos":"roi-neg"}">${u.roi}</span></div>
    </div>`;
  }).join("");
}

// HISTORY
function renderHistory() {
  const list = STATE.history.filter(h => {
    if (STATE.histFilter === "won")     return h.result === "WON";
    if (STATE.histFilter === "lost")    return h.result === "LOST";
    if (STATE.histFilter === "pending") return h.result === "PENDING" || h.result === "pending";
    return true;
  });
  const rows = document.getElementById("history-rows");
  rows.innerHTML = list.map(h => {
    const won     = h.result === "WON";
    const pending = h.result === "PENDING" || h.result === "pending";
    const pill    = won ? "rp-won" : pending ? "rp-pending" : "rp-lost";
    const profit  = typeof h.profit === "number"
      ? (h.profit > 0 ? `+£${h.profit.toFixed(2)}` : h.profit < 0 ? `-£${Math.abs(h.profit).toFixed(2)}` : "—")
      : (h.profit || "—");
    const match = h.match || `${h.home || ""} vs ${h.away || ""}`;
    const date  = fmtDate(h.created_at || h.date);
    return `<div class="hist-row">
      <div class="hr-main">
        <div class="hr-match">${match}</div>
        <div class="hr-sel" style="margin-top:2px">${h.selection || h.sel || ""} — <span style="color:var(--text-3)">${date}</span></div>
      </div>
      <div style="text-align:center">
        <div class="hr-odds">${(+(h.odds||0)).toFixed(2)}</div>
        <div class="hr-stake">£${h.stake||0} stake</div>
      </div>
      <div class="hr-result">
        <span class="result-pill ${pill}">${h.result || "PENDING"}</span>
        <div class="hr-profit" style="color:${won?"var(--green)":pending?"var(--gold)":"var(--red)"}">${profit}</div>
      </div>
    </div>`;
  }).join("") || `<div class="empty-st"><div class="empty-ico">📭</div><p>No predictions found.</p></div>`;
}

document.querySelectorAll("[data-hf]").forEach(btn => btn.addEventListener("click", () => {
  document.querySelectorAll("[data-hf]").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  STATE.histFilter = btn.dataset.hf;
  renderHistory();
}));

// INSIGHTS
function renderInsights() {
  const lv = [3,4,2,5,4,3,5,4,1,5,3,4,5,2,4,5,4,3,5,4,3,4,5,5,5,4,3,5,4,4,5,5,3,4,5,5,4,3,5,4,3,4,5,5,5,4,3,5,4,4];
  const hm = document.getElementById("heatmap");
  if (hm) hm.innerHTML = lv.map((l, i) =>
    `<div class="hm-cell hm-${l}" title="Day ${i+1}: ${[0,72,80,85,90,95,99][l]}%">${[0,"","","","","",99][l] || ""}</div>`
  ).join("");
}

// STATISTICS
function renderStatistics() {
  const m = [89, 91, 90, 92, 93, 94, 94], mx = Math.max(...m);
  const mc = document.getElementById("monthly-chart");
  if (mc) mc.innerHTML = m.map(v =>
    `<div class="bar-col" style="height:120px;justify-content:flex-end"><div class="bar-fill" style="height:${v/mx*100}%;background:var(--blue);width:100%"></div></div>`
  ).join("");
}

// NOTIFICATIONS
function renderNotifications() {
  const list = document.getElementById("notif-list");
  if (!list) return;
  const n = STATE.notifications.length ? STATE.notifications : MOCK_NOTIFICATIONS;
  list.innerHTML = n.map(item => `
    <div class="notif-item${item.unread ? " unread" : ""}">
      <div class="ni-icon">${item.icon}</div>
      <div class="ni-body">
        <div class="ni-title">${item.title}</div>
        <div class="ni-desc">${item.description || item.desc || ""}</div>
        <div class="ni-time">${fmtDate(item.created_at || item.time || new Date().toISOString())}</div>
      </div>
    </div>`).join("");
}

// ============================================================
//  LIVE SIMULATION  (when backend has no real data)
// ============================================================
function simulateLive() {
  setInterval(() => {
    const live = STATE.matches.filter(m => getStatus(m) === "live");
    if (!live.length) return;
    const m = live[Math.floor(Math.random() * live.length)];
    if (Math.random() < 0.10) {
      const scorer = Math.random() < 0.55 ? "home" : "away";
      if (scorer === "home") {
        m.home_score = (m.home_score || 0) + 1;
        m.home_prob = Math.min(85, (m.home_prob||40) + Math.floor(Math.random()*8+3));
        m.away_prob = Math.max(5,  (m.away_prob||25) - Math.floor(Math.random()*5+2));
        m.draw_prob = Math.max(5,  100 - m.home_prob - m.away_prob);
      } else {
        m.away_score = (m.away_score || 0) + 1;
        m.away_prob = Math.min(85, (m.away_prob||25) + Math.floor(Math.random()*8+3));
        m.home_prob = Math.max(5,  (m.home_prob||40) - Math.floor(Math.random()*5+2));
        m.draw_prob = Math.max(5,  100 - m.home_prob - m.away_prob);
      }
      showToast(`⚽ GOAL! ${m.home} ${m.home_score}–${m.away_score} ${m.away}`, "goal");
      refreshCurrent();
    }
    // Advance minute
    const tm = (m.kickoff || "").match(/LIVE (\d+)'/);
    if (tm) {
      const min = Math.min(90, parseInt(tm[1]) + Math.floor(Math.random() * 2 + 1));
      m.kickoff = `LIVE ${min}'`;
      if (min >= 90) { m.status = "finished"; m.kickoff = "FT"; }
      refreshCurrent();
    }
  }, 28000);
}

// ============================================================
//  TOAST
// ============================================================
function showToast(msg, type = "") {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className   = "toast" + (type ? " " + type : "");
  t.classList.add("show");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("show"), 3500);
}

// ============================================================
//  KEYBOARD SHORTCUTS
// ============================================================
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    closeSearch();
    closeAllPanels();
  }
  if (e.key === "Enter" && !document.getElementById("auth-screen")?.classList.contains("hidden")) {
    const loginVisible = document.getElementById("form-login")?.style.display !== "none";
    if (loginVisible) handleLogin(); else handleSignup();
  }
});

// Make auth functions available globally (called from onclick in HTML)
window.switchTab    = switchTab;
window.togglePw     = togglePw;
window.verifyPromo  = verifyPromo;
window.handleLogin  = handleLogin;
window.handleSignup = handleSignup;
window.navigateTo   = navigateTo;
window.logout       = logout;
window.toggleBet    = toggleBet;
window.removeBet    = removeBet;
window.openSearch   = openSearch;
window.closeSearch  = closeSearch;
window.liveSearch   = liveSearch;
window.closeDropdown= closeDropdown;
window.showToast    = showToast;