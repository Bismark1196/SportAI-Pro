/* ============================================================
   SPORTAI — dashboard.js  (Vercel-ready, no backend required)
   All element IDs match index.html exactly.
   ============================================================ */
"use strict";

// ── AUTH GUARD ───────────────────────────────────────────────
(function () {
  try {
    const s = JSON.parse(localStorage.getItem("sportai_session") || "{}");
    if (!s.loggedIn) throw new Error();
  } catch (_) { window.location.href = "auth.html"; }
})();

// ── MATCH DATA ───────────────────────────────────────────────
const MATCHES = [
  { id:1, comp:"Premier League", flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿", kickoff:"LIVE 73'", status:"live",
    home:"Man City",    away:"Arsenal",
    home_score:2, away_score:1,
    home_prob:58, draw_prob:22, away_prob:20,
    home_odds:1.72, draw_odds:3.50, away_odds:4.80,
    home_form:["W","W","D","W","W"], away_form:["W","L","W","W","D"],
    confidence:"high", ai_insight:"Man City dominate with 68% possession. Home Win is value at 1.72 — EV +8.4%." },
  { id:2, comp:"La Liga", flag:"🇪🇸", kickoff:"LIVE 34'", status:"live",
    home:"Real Madrid", away:"Barcelona",
    home_score:0, away_score:1,
    home_prob:29, draw_prob:24, away_prob:47,
    home_odds:2.10, draw_odds:3.20, away_odds:3.60,
    home_form:["W","W","W","D","L"], away_form:["W","W","D","W","W"],
    confidence:"med", ai_insight:"Barcelona lead and hold superior form. Away win EV positive at 3.60 — EV +6.1%." },
  { id:3, comp:"Champions League", flag:"🇪🇺", kickoff:"20:45", status:"upcoming",
    home:"PSG", away:"Bayern Munich",
    home_score:null, away_score:null,
    home_prob:36, draw_prob:26, away_prob:38,
    home_odds:2.50, draw_odds:3.10, away_odds:2.90,
    home_form:["W","D","W","L","W"], away_form:["W","W","W","D","W"],
    confidence:"low", ai_insight:"Closely matched. Bayern slight value at 2.90 — model gives 38% vs 34% implied." },
  { id:4, comp:"Serie A", flag:"🇮🇹", kickoff:"21:00", status:"upcoming",
    home:"Juventus", away:"Inter Milan",
    home_score:null, away_score:null,
    home_prob:41, draw_prob:30, away_prob:29,
    home_odds:2.30, draw_odds:3.00, away_odds:3.20,
    home_form:["D","W","W","D","W"], away_form:["W","L","W","W","D"],
    confidence:"med", ai_insight:"Juventus home advantage and form edge. Home win value at 2.30 — EV +9.3%." },
  { id:5, comp:"Bundesliga", flag:"🇩🇪", kickoff:"18:30", status:"upcoming",
    home:"Dortmund", away:"Leverkusen",
    home_score:null, away_score:null,
    home_prob:44, draw_prob:27, away_prob:29,
    home_odds:2.20, draw_odds:3.40, away_odds:3.10,
    home_form:["W","W","L","W","D"], away_form:["W","W","W","L","W"],
    confidence:"med", ai_insight:"Evenly matched. No strong value detected; monitor odds movement closer to kick-off." },
  { id:6, comp:"Ligue 1", flag:"🇫🇷", kickoff:"19:00", status:"upcoming",
    home:"Lyon", away:"Marseille",
    home_score:null, away_score:null,
    home_prob:39, draw_prob:28, away_prob:33,
    home_odds:2.60, draw_odds:3.10, away_odds:2.80,
    home_form:["D","W","D","W","L"], away_form:["W","D","W","W","D"],
    confidence:"low", ai_insight:"Lyon vs Marseille historically tight. Draw market worth monitoring at 3.10." },
  { id:7, comp:"Premier League", flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿", kickoff:"LIVE 82'", status:"live",
    home:"Chelsea", away:"Liverpool",
    home_score:1, away_score:1,
    home_prob:21, draw_prob:44, away_prob:35,
    home_odds:5.20, draw_odds:2.40, away_odds:3.80,
    home_form:["L","D","W","L","D"], away_form:["W","W","D","W","L"],
    confidence:"med", ai_insight:"Draw highly probable at 82' with parity. Draw at 2.40 represents value — EV +5.6%." },
  { id:8, comp:"La Liga", flag:"🇪🇸", kickoff:"22:00", status:"upcoming",
    home:"Atletico", away:"Sevilla",
    home_score:null, away_score:null,
    home_prob:52, draw_prob:25, away_prob:23,
    home_odds:1.90, draw_odds:3.60, away_odds:4.40,
    home_form:["W","W","W","D","W"], away_form:["D","W","L","D","W"],
    confidence:"high", ai_insight:"Atletico strong home record (W4 D1 L0 last 5). Home win value at 1.90 — EV +3.4%." },
];

const NOTIFICATIONS = [
  { icon:"⚽", title:"GOAL! Man City 2-1 Arsenal",  body:"Haaland 73' — AI predicted Home Win (58%). Probs updated.", time:"2 min ago", unread:true },
  { icon:"💎", title:"High Value Bet Found",         body:"Bayern Munich Away vs PSG @ 2.90 — EV +4%. Kelly: £12.80.",  time:"8 min ago", unread:true },
  { icon:"🔔", title:"Match Starting Soon",          body:"Juventus vs Inter Milan kicks off in 30 minutes.",           time:"22 min ago", unread:true },
  { icon:"✅", title:"Prediction Correct",           body:"Real Madrid Win (1.85) confirmed — +£8.50 profit.",          time:"2h ago", unread:false },
  { icon:"📊", title:"Weekly Report Ready",          body:"Your performance report for this week is available.",         time:"5h ago", unread:false },
  { icon:"🤖", title:"AI Model Updated",             body:"DeepMatch v3.2 deployed with improved draw detection.",       time:"1d ago", unread:false },
];

const LEADERBOARD = [
  { rank:1, init:"JS", name:"John S.",   tag:"@johnsmith", bets:284, acc:"94.2%", profit:"+£3,840", roi:"+18.4%", pos:true, you:true },
  { rank:2, init:"MR", name:"Maria R.",  tag:"@maria_r",   bets:310, acc:"91.8%", profit:"+£2,140", roi:"+14.2%", pos:true },
  { rank:3, init:"DK", name:"David K.",  tag:"@dkings",    bets:198, acc:"93.4%", profit:"+£1,920", roi:"+16.1%", pos:true },
  { rank:4, init:"AL", name:"Alex L.",   tag:"@alexL",     bets:422, acc:"88.7%", profit:"+£1,540", roi:"+11.3%", pos:true },
  { rank:5, init:"SB", name:"Sophie B.", tag:"@sophieb",   bets:167, acc:"90.1%", profit:"+£980",   roi:"+9.8%",  pos:true },
  { rank:6, init:"TM", name:"Tom M.",    tag:"@tommitch",  bets:289, acc:"85.2%", profit:"-£120",   roi:"-0.4%",  pos:false },
  { rank:7, init:"KA", name:"Kenji A.",  tag:"@kenji_a",   bets:134, acc:"87.6%", profit:"+£640",   roi:"+8.1%",  pos:true },
];

const HISTORY = [
  { match:"Man City vs Arsenal",      selection:"Man City Win",   odds:1.65, stake:10, result:"WON",     profit:6.50,  date:"2 Apr 2026" },
  { match:"Real Madrid vs Barcelona", selection:"Draw",           odds:3.20, stake:10, result:"LOST",    profit:-10,   date:"1 Apr 2026" },
  { match:"Bayern vs Dortmund",       selection:"Bayern Win",     odds:1.85, stake:10, result:"WON",     profit:8.50,  date:"31 Mar 2026" },
  { match:"PSG vs Marseille",         selection:"PSG Win",        odds:1.50, stake:20, result:"WON",     profit:10,    date:"30 Mar 2026" },
  { match:"Juventus vs Roma",         selection:"Draw",           odds:3.00, stake:10, result:"LOST",    profit:-10,   date:"29 Mar 2026" },
  { match:"Liverpool vs Chelsea",     selection:"Liverpool Win",  odds:1.72, stake:15, result:"WON",     profit:10.80, date:"28 Mar 2026" },
  { match:"Atletico vs Sevilla",      selection:"Atletico Win",   odds:1.90, stake:10, result:"PENDING", profit:0,     date:"2 Apr 2026" },
  { match:"Inter vs AC Milan",        selection:"Inter Win",      odds:2.10, stake:10, result:"WON",     profit:11.00, date:"27 Mar 2026" },
  { match:"Ajax vs PSV",             selection:"Draw",            odds:3.40, stake:10, result:"LOST",    profit:-10,   date:"26 Mar 2026" },
  { match:"Lyon vs Monaco",           selection:"Away Win",       odds:2.80, stake:10, result:"WON",     profit:18.00, date:"25 Mar 2026" },
];

// ── STATE ────────────────────────────────────────────────────
const STATE = {
  matches:    MATCHES.map(m => ({...m})),
  betslip:    {},
  dashFilter: "all",
  predFilter: "all",
  histFilter: "all",
};

// ── UTILS ────────────────────────────────────────────────────
const $  = id => document.getElementById(id);
const tx = (id, v) => { const e = $(id); if (e) e.textContent = v; };

function evSide(m) {
  const evH = m.home_prob/100 - 1/m.home_odds;
  const evD = m.draw_prob/100 - 1/m.draw_odds;
  const evA = m.away_prob/100 - 1/m.away_odds;
  const best = Math.max(evH, evD, evA);
  if (best <= 0.01) return null;
  return best === evH ? "home" : best === evD ? "draw" : "away";
}

function evPct(m, side) {
  side = side || evSide(m);
  if (!side) return 0;
  const p = m[side+"_prob"]/100, o = m[side+"_odds"];
  return +((p*(o-1)-(1-p))*100).toFixed(1);
}

function fd(r) {
  return `<div class="form-dot ${r==="W"?"fw":r==="D"?"fd":"fl"}">${r}</div>`;
}

function fmtP(p) {
  if (p > 0) return `<span style="color:var(--green-lt)">+£${p.toFixed(2)}</span>`;
  if (p < 0) return `<span style="color:var(--red)">-£${Math.abs(p).toFixed(2)}</span>`;
  return `<span style="color:var(--gold)">PENDING</span>`;
}

function confColor(m) {
  return m.confidence==="high"?"var(--green-lt)":m.confidence==="med"?"var(--gold)":"var(--text-2)";
}

// ── TICKER ───────────────────────────────────────────────────
function updateTicker() {
  const live  = STATE.matches.filter(m => m.status==="live").length;
  const value = STATE.matches.filter(m => evSide(m)).length;
  tx("t-total",   STATE.matches.length);
  tx("t-live",    live);
  tx("t-value",   value);
  tx("live-badge",live);
  tx("val-badge", value);
  tx("dash-live", live);
  tx("dash-value",value);
  tx("t-updated", new Date().toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"}));
}

// ── NAVIGATION ───────────────────────────────────────────────
function navigateTo(page) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".nav-item[data-page]").forEach(n => n.classList.remove("active"));
  const pg = $("page-"+page);
  if (pg) pg.classList.add("active");
  document.querySelectorAll(`[data-page="${page}"]`).forEach(n => n.classList.add("active"));
  closeSidebar();
  renderPage(page);
}
window.navigateTo = navigateTo;

function renderPage(p) {
  ({dashboard:renderDashboard,predictions:renderPredictions,live:renderLive,
    leaderboard:renderLeaderboard,history:renderHistory,insights:renderInsights,
    statistics:renderStatistics,calculator:initCalcs})[p]?.();
}

document.querySelectorAll(".nav-item[data-page]").forEach(btn =>
  btn.addEventListener("click", () => navigateTo(btn.dataset.page)));

// ── SIDEBAR ──────────────────────────────────────────────────
function toggleSidebar() {
  $("sidebar").classList.toggle("open");
  const o = $("sidebar-overlay");
  if (o) o.style.display = $("sidebar").classList.contains("open") ? "block" : "none";
}
function closeSidebar() {
  $("sidebar").classList.remove("open");
  const o = $("sidebar-overlay"); if (o) o.style.display = "none";
}
window.toggleSidebar = toggleSidebar;
window.closeSidebar  = closeSidebar;
$("hamburger-btn")?.addEventListener("click", toggleSidebar);

// ── DROPDOWN ─────────────────────────────────────────────────
function toggleDropdown() { $("user-dropdown").classList.toggle("open"); }
function closeDropdown()  { $("user-dropdown").classList.remove("open"); }
window.toggleDropdown = toggleDropdown;
window.closeDropdown  = closeDropdown;
document.addEventListener("click", e => {
  if (!e.target.closest("#user-btn") && !e.target.closest("#user-dropdown")) closeDropdown();
  if (!e.target.closest("#notif-btn") && !e.target.closest("#notif-panel")) closeNotif();
});

// ── BETSLIP ──────────────────────────────────────────────────
let bsOpen = false;
function toggleBetslip() {
  bsOpen = !bsOpen;
  $("betslip-panel").classList.toggle("open", bsOpen);
}
window.toggleBetslip = toggleBetslip;

function addToBetslip(id, type, odds, home, away) {
  const key = String(id);
  if (STATE.betslip[key]?.type === type) {
    delete STATE.betslip[key];
    showToast("Removed from betslip");
  } else {
    STATE.betslip[key] = { type, odds:+odds, home, away };
    showToast(`Added: ${home} vs ${away} — ${type==="home"?home:type==="away"?away:"Draw"} @ ${(+odds).toFixed(2)}`);
  }
  renderBetslipPanel();
  const a = document.querySelector(".page.active");
  if (a) renderPage(a.id.replace("page-",""));
}
window.addToBetslip = addToBetslip;

function removeBetslipItem(key) { delete STATE.betslip[key]; renderBetslipPanel(); }
window.removeBetslipItem = removeBetslipItem;

function renderBetslipPanel() {
  const items = $("betslip-items"), footer = $("betslip-footer");
  const cnt   = $("bp-count"), badge = $("bs-count-badge");
  const entries = Object.entries(STATE.betslip);
  if (cnt)   cnt.textContent   = entries.length;
  if (badge) { badge.textContent = entries.length; badge.style.display = entries.length?"block":"none"; }
  if (!items) return;
  if (!entries.length) {
    items.innerHTML = `<div class="bp-empty"><div class="bp-empty-icon">🎫</div><p>No selections yet.<br>Click any odds to add.</p></div>`;
    if (footer) footer.style.display = "none";
    return;
  }
  items.innerHTML = entries.map(([key, s]) =>
    `<div class="bp-item">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px">
        <div style="flex:1;min-width:0">
          <div class="bp-item-match">${s.home} vs ${s.away}</div>
          <div class="bp-item-sel">${s.type==="home"?s.home:s.type==="away"?s.away:"Draw"}</div>
        </div>
        <div style="display:flex;align-items:center;gap:6px;flex-shrink:0">
          <div style="font-family:var(--f-cond);font-size:18px;font-weight:900">${(+s.odds).toFixed(2)}</div>
          <button class="bp-remove" onclick="removeBetslipItem('${key}')">✕</button>
        </div>
      </div>
    </div>`).join("");
  if (footer) footer.style.display = "block";
  updateBetslipTotals();
}
window.updateBetslipTotals = updateBetslipTotals;

function updateBetslipTotals() {
  const stake = parseFloat($("bp-stake")?.value)||10;
  const tot   = Object.values(STATE.betslip).reduce((a,s)=>a*s.odds,1);
  const ret   = stake * tot;
  tx("bp-total-odds", tot.toFixed(2));
  tx("bp-return",     "£"+ret.toFixed(2));
  tx("bp-profit",     "£"+(ret-stake).toFixed(2));
}

function placeBet() {
  if (!Object.keys(STATE.betslip).length) return;
  const stake = parseFloat($("bp-stake")?.value)||10;
  showToast(`✅ Bet placed! £${stake.toFixed(2)} on ${Object.keys(STATE.betslip).length} selection(s)`);
  STATE.betslip = {};
  renderBetslipPanel();
  if (bsOpen) toggleBetslip();
}
window.placeBet = placeBet;

// ── NOTIFICATIONS ────────────────────────────────────────────
let notifOpen = false;
function toggleNotif() {
  notifOpen = !notifOpen;
  $("notif-panel").classList.toggle("open", notifOpen);
  if (notifOpen) $("notif-dot").style.display = "none";
}
function closeNotif() { notifOpen=false; $("notif-panel")?.classList.remove("open"); }
window.toggleNotif = toggleNotif;

function renderNotifications() {
  const list = $("notif-list");
  if (!list) return;
  list.innerHTML = NOTIFICATIONS.map(n =>
    `<div style="display:flex;gap:10px;padding:12px 16px;border-bottom:1px solid var(--border);${n.unread?"background:rgba(245,197,24,0.04)":""}">
      <div style="font-size:20px;flex-shrink:0">${n.icon}</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:12px;font-weight:600;margin-bottom:2px">${n.title}</div>
        <div style="font-size:11px;color:var(--text-2);line-height:1.4">${n.body}</div>
        <div style="font-size:10px;color:var(--text-3);margin-top:4px">${n.time}</div>
      </div>
      ${n.unread?`<div style="width:6px;height:6px;border-radius:50%;background:var(--gold);flex-shrink:0;margin-top:4px"></div>`:""}
    </div>`).join("");
}

// ── SEARCH ───────────────────────────────────────────────────
function handleSearch(val) {
  if (!val||val.length<2) return;
  const hit = STATE.matches.find(m =>
    m.home.toLowerCase().includes(val.toLowerCase())||
    m.away.toLowerCase().includes(val.toLowerCase())||
    m.comp.toLowerCase().includes(val.toLowerCase()));
  if (hit) { showToast(`Found: ${hit.home} vs ${hit.away}`); navigateTo("predictions"); }
}
window.handleSearch = handleSearch;

// ── DASHBOARD ────────────────────────────────────────────────
function renderDashboard() {
  let list = [...STATE.matches];
  if (STATE.dashFilter==="live")     list = list.filter(m=>m.status==="live");
  if (STATE.dashFilter==="upcoming") list = list.filter(m=>m.status!=="live");

  const dc = $("dash-matches");
  if (dc) dc.innerHTML = list.slice(0,6).map(m => {
    const bv  = evSide(m);
    const sel = STATE.betslip[String(m.id)];
    return `<div class="match-row" onclick="navigateTo('predictions')" style="cursor:pointer">
      <div>
        <div class="team-names">
          <div class="tn-home">${m.home}${m.status==="live"?` <strong style="color:#fff">${m.home_score}</strong>`:""}</div>
          <div class="tn-away" style="color:var(--text-2)">${m.away}${m.status==="live"?` <strong style="color:#fff">${m.away_score}</strong>`:""}</div>
        </div>
        <div class="match-time">${m.flag} ${m.comp} · ${m.status==="live"?`<span style="color:var(--red)">● ${m.kickoff}</span>`:m.kickoff}</div>
      </div>
      <div>
        <div class="prob-mini-bar">
          <div class="pmb-home" style="flex:${m.home_prob}"></div>
          <div class="pmb-draw" style="flex:${m.draw_prob}"></div>
          <div class="pmb-away" style="flex:${m.away_prob}"></div>
        </div>
        <div class="prob-labels"><span>${m.home_prob}%</span><span>${m.draw_prob}%</span><span>${m.away_prob}%</span></div>
      </div>
      <div style="text-align:center"><button class="odds-btn${sel?.type==="home"?" selected":""}" onclick="event.stopPropagation();addToBetslip(${m.id},'home',${m.home_odds},'${m.home}','${m.away}')">${m.home_odds}</button></div>
      <div class="odds-col-draw" style="text-align:center"><button class="odds-btn${sel?.type==="draw"?" selected":""}" onclick="event.stopPropagation();addToBetslip(${m.id},'draw',${m.draw_odds},'${m.home}','${m.away}')">${m.draw_odds}</button></div>
      <div style="text-align:center"><button class="odds-btn${sel?.type==="away"?" selected":""}" onclick="event.stopPropagation();addToBetslip(${m.id},'away',${m.away_odds},'${m.home}','${m.away}')">${m.away_odds}</button></div>
      <div style="text-align:center">${bv?`<div class="value-badge">+${evPct(m,bv)}% EV</div>`:`<div class="no-value">—</div>`}</div>
    </div>`;
  }).join("");

  const vl = $("top-value-list");
  if (vl) {
    const vals = STATE.matches.filter(m=>evSide(m)).slice(0,4);
    vl.innerHTML = vals.length ? vals.map(m => {
      const bv=evSide(m), odds=m[bv+"_odds"], lbl=bv==="home"?m.home:bv==="away"?m.away:"Draw";
      return `<div class="vb-item" onclick="navigateTo('predictions')">
        <div class="vb-teams"><div class="vb-match">${m.home} vs ${m.away}</div><div class="vb-info">${m.flag} ${m.comp} · ${lbl}</div></div>
        <div style="text-align:right"><div class="vb-ev">+${evPct(m,bv)}%</div><div class="vb-conf">${m.confidence} conf</div></div>
        <button class="vb-odds-btn" onclick="event.stopPropagation();addToBetslip(${m.id},'${bv}',${odds},'${m.home}','${m.away}')">${(+odds).toFixed(2)}</button>
      </div>`;
    }).join("") : `<div style="padding:20px;text-align:center;color:var(--text-3);font-size:12px">No value bets detected right now</div>`;
  }

  renderBarChart("perf-chart", [81,88,92,86,95,97,94]);
  updateTicker();
}

document.querySelectorAll("[data-df]").forEach(btn => btn.addEventListener("click", () => {
  document.querySelectorAll("[data-df]").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
  STATE.dashFilter = btn.dataset.df;
  renderDashboard();
}));

// ── PREDICTIONS ──────────────────────────────────────────────
function renderPredictions() {
  let list = [...STATE.matches];
  if (STATE.predFilter==="live")     list=list.filter(m=>m.status==="live");
  if (STATE.predFilter==="upcoming") list=list.filter(m=>m.status!=="live");
  if (STATE.predFilter==="value")    list=list.filter(m=>evSide(m));
  const sv = $("pred-sort")?.value;
  if (sv==="conf") list.sort((a,b)=>Math.max(b.home_prob,b.draw_prob,b.away_prob)-Math.max(a.home_prob,a.draw_prob,a.away_prob));
  if (sv==="ev")   list.sort((a,b)=>(evPct(b)||0)-(evPct(a)||0));

  const c = $("pred-container");
  if (!c) return;
  c.innerHTML = list.length ? list.map(renderPredCard).join("") :
    `<div style="text-align:center;padding:60px;color:var(--text-3)"><div style="font-size:40px;margin-bottom:12px">📭</div><p>No predictions match this filter.</p></div>`;
}

function renderPredCard(m) {
  const bv=evSide(m), sel=STATE.betslip[String(m.id)];
  const bvOdds=bv?m[bv+"_odds"]:null, ev=bv?evPct(m,bv):0;
  return `<div class="match-card${m.status==="live"?" live-card":""}${bv?" value-card":""}" style="margin-bottom:12px">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;flex-wrap:wrap;gap:8px">
      <div style="display:flex;align-items:center;gap:8px">
        <span style="font-size:16px">${m.flag}</span>
        <span style="font-size:12px;color:var(--text-2)">${m.comp}</span>
        ${bv?`<span class="comp-badge value">💎 VALUE +${ev}%</span>`:""}
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <span style="font-size:11px;color:var(--text-3)">Conf:</span>
        <span style="font-family:var(--f-cond);font-size:14px;font-weight:800;color:${confColor(m)}">${m.confidence.toUpperCase()}</span>
        <span class="comp-badge ${m.status==="live"?"live":"upcoming"}">${m.status==="live"?"● "+m.kickoff:m.kickoff}</span>
      </div>
    </div>
    <div class="vs-row">
      <div class="vs-team">
        <div class="vst-name">${m.home}</div>
        ${m.status==="live"?`<div style="font-size:28px;font-family:var(--f-cond);font-weight:900;color:#fff;margin:4px 0">${m.home_score}</div>`:""}
        <div class="vst-form">${(m.home_form||[]).map(fd).join("")}</div>
      </div>
      <div style="text-align:center;padding:0 16px;flex-shrink:0">
        <div style="font-family:var(--f-cond);font-size:13px;color:var(--text-3);margin-bottom:4px">${m.comp}</div>
        <div style="font-family:var(--f-cond);font-size:14px;font-weight:700;color:var(--text-2)">VS</div>
        ${m.status!=="live"?`<div style="font-size:11px;color:var(--text-3);margin-top:4px">${m.kickoff}</div>`:""}
      </div>
      <div class="vs-team away">
        <div class="vst-name">${m.away}</div>
        ${m.status==="live"?`<div style="font-size:28px;font-family:var(--f-cond);font-weight:900;color:#fff;margin:4px 0">${m.away_score}</div>`:""}
        <div class="vst-form" style="justify-content:flex-end">${(m.away_form||[]).map(fd).join("")}</div>
      </div>
    </div>
    <div class="pc-probs">
      <div class="pc-prob-seg seg-home${bv==="home"?" seg-best":""}${sel?.type==="home"?" selected":""}" onclick="addToBetslip(${m.id},'home',${m.home_odds},'${m.home}','${m.away}')">
        <div class="pps-lbl">Home Win</div><div class="pps-val">${m.home_prob}%</div><div class="pps-odds">${m.home_odds}</div>
      </div>
      <div class="pc-prob-seg seg-draw${bv==="draw"?" seg-best":""}${sel?.type==="draw"?" selected":""}" onclick="addToBetslip(${m.id},'draw',${m.draw_odds},'${m.home}','${m.away}')">
        <div class="pps-lbl">Draw</div><div class="pps-val">${m.draw_prob}%</div><div class="pps-odds">${m.draw_odds}</div>
      </div>
      <div class="pc-prob-seg seg-away${bv==="away"?" seg-best":""}${sel?.type==="away"?" selected":""}" onclick="addToBetslip(${m.id},'away',${m.away_odds},'${m.home}','${m.away}')">
        <div class="pps-lbl">Away Win</div><div class="pps-val">${m.away_prob}%</div><div class="pps-odds">${m.away_odds}</div>
      </div>
    </div>
    <div class="ai-insight-row"><span class="ai-icon">🤖</span><strong>AI Insight:</strong> ${m.ai_insight}</div>
    ${bv?`<div style="display:flex;gap:8px;margin-top:10px;align-items:center;flex-wrap:wrap">
      <div class="value-badge">💎 +${ev}% Expected Value</div>
      <div style="font-size:11px;color:var(--text-3)">Kelly stake: £${Math.max(0,(m[bv+"_prob"]/100*(m[bv+"_odds"]-1)-(1-m[bv+"_prob"]/100))/(m[bv+"_odds"]-1)*500*0.25).toFixed(2)}</div>
      <button class="btn btn-gold" style="margin-left:auto;font-size:11px;padding:5px 14px" onclick="addToBetslip(${m.id},'${bv}',${bvOdds},'${m.home}','${m.away}')">${sel?"✓ Added":"+ Add to Betslip"}</button>
    </div>`:""}
  </div>`;
}

document.querySelectorAll("[data-pf]").forEach(btn => btn.addEventListener("click", () => {
  document.querySelectorAll("[data-pf]").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
  STATE.predFilter = btn.dataset.pf;
  renderPredictions();
}));
$("pred-sort")?.addEventListener("change", renderPredictions);

// ── LIVE ─────────────────────────────────────────────────────
function renderLive() {
  const c = $("live-container"); if (!c) return;
  const live=STATE.matches.filter(m=>m.status==="live");
  const up=STATE.matches.filter(m=>m.status!=="live");
  let html="";
  if (live.length) { html+=`<div class="live-section-title">🔴 Live Now (${live.length})</div>`; html+=live.map(renderPredCard).join(""); }
  if (up.length) {
    html+=`<div class="live-section-title" style="margin-top:20px">⏱ Upcoming (${up.length})</div><div class="grid-2">`;
    html+=up.slice(0,6).map(m=>`<div class="match-card">
      <div style="display:flex;justify-content:space-between;margin-bottom:8px">
        <span style="font-size:12px;color:var(--text-2)">${m.flag} ${m.comp}</span>
        <span class="comp-badge upcoming">${m.kickoff}</span>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin:8px 0">
        <div style="font-family:var(--f-cond);font-weight:800;font-size:15px">${m.home}</div>
        <div style="font-size:11px;color:var(--text-3)">vs</div>
        <div style="font-family:var(--f-cond);font-weight:800;font-size:15px;text-align:right">${m.away}</div>
      </div>
      <div style="display:flex;gap:4px">
        <button class="odds-btn" style="flex:1" onclick="addToBetslip(${m.id},'home',${m.home_odds},'${m.home}','${m.away}')">${m.home_odds}</button>
        <button class="odds-btn" style="flex:1" onclick="addToBetslip(${m.id},'draw',${m.draw_odds},'${m.home}','${m.away}')">${m.draw_odds}</button>
        <button class="odds-btn" style="flex:1" onclick="addToBetslip(${m.id},'away',${m.away_odds},'${m.home}','${m.away}')">${m.away_odds}</button>
      </div>
    </div>`).join("") + "</div>";
  }
  if (!live.length&&!up.length) html=`<div style="text-align:center;padding:60px;color:var(--text-3)"><div style="font-size:40px;margin-bottom:12px">📡</div><p>No matches available.</p></div>`;
  c.innerHTML=html;
}

// ── LEADERBOARD ──────────────────────────────────────────────
function renderLeaderboard() {
  const c=$("lb-rows"); if (!c) return;
  const colors=["linear-gradient(135deg,#f0a500,#c07d00)","#c0c0c0","#cd7f32","#7c5cbf","#e63946","#3a8ef6","#2ec27e"];
  c.innerHTML=LEADERBOARD.map((u,i)=>`<div class="lb-row">
    <div class="lb-rank ${i===0?"gold":i===1?"silver":i===2?"bronze":""}">${u.rank}</div>
    <div class="lb-user">
      <div class="lb-avatar" style="background:${colors[i]};color:${i<3?"#111":"#fff"}">${u.init}</div>
      <div><div class="lb-name">${u.name}${u.you?`<span class="lb-you">YOU</span>`:""}</div><div style="font-size:10px;color:var(--text-3)">${u.tag}</div></div>
    </div>
    <div class="lb-bets-val" style="font-size:12px;color:var(--text-2)">${u.bets}</div>
    <div style="font-family:var(--f-cond);font-size:13px;font-weight:700;color:var(--green-lt)">${u.acc}</div>
    <div style="font-family:var(--f-cond);font-size:14px;font-weight:800;color:${u.pos?"var(--gold)":"var(--red)"}">${u.profit}</div>
    <div class="lb-roi-val" style="font-family:var(--f-cond);font-size:13px;font-weight:700;color:${u.pos?"var(--green-lt)":"var(--red)"}">${u.roi}</div>
  </div>`).join("");
}

// ── HISTORY ──────────────────────────────────────────────────
function renderHistory() {
  const c=$("history-rows"); if (!c) return;
  let list=[...HISTORY];
  if (STATE.histFilter==="won")  list=list.filter(h=>h.result==="WON");
  if (STATE.histFilter==="lost") list=list.filter(h=>h.result==="LOST");
  c.innerHTML=list.map(h=>`<div class="hist-row">
    <div><div class="hist-match">${h.match}</div><div class="hist-date">${h.date}</div></div>
    <div style="font-family:var(--f-cond);font-size:12px;font-weight:700">${h.selection}</div>
    <div style="font-family:var(--f-cond);font-size:13px;font-weight:700">${h.odds.toFixed(2)}</div>
    <div style="font-size:12px;color:var(--text-2)">£${h.stake}</div>
    <div><span class="result-badge ${h.result==="WON"?"result-won":h.result==="LOST"?"result-lost":"result-pending"}">${h.result}</span></div>
    <div>${fmtP(h.profit)}</div>
  </div>`).join("") || `<div style="text-align:center;padding:40px;color:var(--text-3)">No predictions found.</div>`;
}

document.querySelectorAll("[data-hf]").forEach(btn => btn.addEventListener("click", () => {
  document.querySelectorAll("[data-hf]").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
  STATE.histFilter=btn.dataset.hf;
  renderHistory();
}));

// ── INSIGHTS ─────────────────────────────────────────────────
function renderInsights() {
  const hm=$("heatmap"); if (!hm) return;
  hm.innerHTML=Array.from({length:49},(_,i)=>{
    const l=[0,1,2,3,4,5][Math.floor(Math.random()*6)];
    return `<div class="hm-cell hm-${l}" title="Day ${i+1}: ${(75+l*4+Math.random()*3).toFixed(1)}% accuracy"></div>`;
  }).join("");
}

// ── STATISTICS ───────────────────────────────────────────────
function renderStatistics() {
  const mc=$("monthly-chart"); if (!mc) return;
  renderBarChart("monthly-chart",[89,91,90,92,93,94,94]);
}

// ── BAR CHART ────────────────────────────────────────────────
function renderBarChart(id, vals) {
  const el=$(id); if (!el) return;
  const mx=Math.max(...vals);
  el.innerHTML=vals.map(v=>`<div class="mb-bar${v>=93?" great":v>=88?" good":""}" style="height:${(v/mx*100).toFixed(0)}%"><div class="mb-bar-tip">${v}%</div></div>`).join("");
}

// ── CALCULATORS ──────────────────────────────────────────────
function initCalcs() { calcReturns(); calcKelly(); calcEV(); }

function calcReturns() {
  const stake=parseFloat($("calc-stake")?.value)||0, odds=parseFloat($("calc-odds")?.value)||1;
  const ret=stake*odds, profit=ret-stake, roi=stake>0?(profit/stake*100):0;
  tx("calc-return","£"+ret.toFixed(2)); tx("calc-profit","£"+profit.toFixed(2)); tx("calc-roi",roi.toFixed(1)+"%");
  if ($("calc-profit")) $("calc-profit").style.color=profit>=0?"var(--green-lt)":"var(--red)";
}
window.calcReturns=calcReturns;

function calcKelly() {
  const prob=(parseFloat($("kelly-prob")?.value)||0)/100, odds=parseFloat($("kelly-odds")?.value)||1, bank=parseFloat($("kelly-bank")?.value)||0;
  const k=Math.max(0,(prob*(odds-1)-(1-prob))/(odds-1));
  tx("kelly-pct",(k*100).toFixed(1)+"%"); tx("kelly-stake","£"+(bank*k).toFixed(2)); tx("kelly-half","£"+(bank*k/2).toFixed(2));
}
window.calcKelly=calcKelly;

function calcEV() {
  const prob=(parseFloat($("ev-prob")?.value)||0)/100, odds=parseFloat($("ev-odds")?.value)||1, stake=parseFloat($("ev-stake")?.value)||0;
  const ev=(prob*(odds-1)-(1-prob))*stake, fair=prob>0?(1/prob).toFixed(2):"—", edge=prob>0?((odds*prob-1)*100).toFixed(1):"0";
  tx("ev-result",(ev>=0?"+":"")+"£"+ev.toFixed(2)); tx("ev-fair",fair); tx("ev-edge",(parseFloat(edge)>=0?"+":"")+edge+"%");
  if ($("ev-result")) $("ev-result").style.color=ev>=0?"var(--green-lt)":"var(--red)";
  if ($("ev-edge"))   $("ev-edge").style.color=parseFloat(edge)>=0?"var(--gold)":"var(--red)";
}
window.calcEV=calcEV;

// ── TOAST ────────────────────────────────────────────────────
function showToast(msg, dur=3000) {
  const t=$("toast"); if (!t) return;
  t.textContent=msg; t.classList.add("show");
  clearTimeout(t._t); t._t=setTimeout(()=>t.classList.remove("show"), dur);
}
window.showToast=showToast;

// ── USER INFO ────────────────────────────────────────────────
function loadUser() {
  try {
    const s=JSON.parse(localStorage.getItem("sportai_session")||"{}");
    const u=JSON.parse(localStorage.getItem("sportai_user")||"{}");
    const name=s.name||u.name||"User";
    const email=s.email||u.email||"";
    const plan=u.plan||"Pro";
    const init=name.trim().split(/\s+/).map(n=>n[0]).join("").toUpperCase().slice(0,2)||"U";
    const btn=$("user-btn"); if (btn) btn.textContent=init;
    tx("ud-name",name); tx("ud-email",email); tx("ud-plan",plan);
    tx("settings-name",name); tx("settings-email",email); tx("settings-plan",plan.toUpperCase());
    tx("dash-greeting",`Welcome back, ${name.split(" ")[0]}. Here's today's overview.`);
  } catch(_){}
}

// ── LOGOUT ───────────────────────────────────────────────────
function logout() { localStorage.removeItem("sportai_session"); window.location.href="auth.html"; }
window.logout=logout;

// ── LIVE SIMULATION ──────────────────────────────────────────
function simulateLive() {
  setInterval(()=>{
    const live=STATE.matches.filter(m=>m.status==="live"); if (!live.length) return;
    const m=live[Math.floor(Math.random()*live.length)];
    if (Math.random()<0.12) {
      const scorer=Math.random()<0.55?"home":"away";
      if (scorer==="home") { m.home_score=(m.home_score||0)+1; m.home_prob=Math.min(85,m.home_prob+Math.floor(Math.random()*8+3)); m.away_prob=Math.max(5,m.away_prob-Math.floor(Math.random()*5+2)); m.draw_prob=Math.max(5,100-m.home_prob-m.away_prob); }
      else { m.away_score=(m.away_score||0)+1; m.away_prob=Math.min(85,m.away_prob+Math.floor(Math.random()*8+3)); m.home_prob=Math.max(5,m.home_prob-Math.floor(Math.random()*5+2)); m.draw_prob=Math.max(5,100-m.home_prob-m.away_prob); }
      showToast(`⚽ GOAL! ${m.home} ${m.home_score}-${m.away_score} ${m.away}`);
      const a=document.querySelector(".page.active"); if (a) renderPage(a.id.replace("page-",""));
      updateTicker();
    }
    const tm=(m.kickoff||"").match(/LIVE (\d+)'/);
    if (tm) { const min=Math.min(90,parseInt(tm[1])+1); m.kickoff=`LIVE ${min}'`; if (min>=90){m.status="finished";m.kickoff="FT";updateTicker();} }
  }, 25000);
}

// ── KEYBOARD ─────────────────────────────────────────────────
document.addEventListener("keydown", e => {
  if (e.key==="Escape") { closeNotif(); if (bsOpen) toggleBetslip(); closeDropdown(); }
});

// ── INIT ─────────────────────────────────────────────────────
loadUser();
renderNotifications();
updateTicker();
renderDashboard();
simulateLive();
setInterval(updateTicker, 60000);