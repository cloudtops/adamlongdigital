/*
  Capital SIR Deliverables
  Reads the "Deliverables" tab of a Google Sheet published to the web as CSV.
  Setup: File > Share > Publish to web > pick the "Deliverables" tab > CSV > Publish,
  then paste the link below.
*/
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSFGZ2i6pYvjEoyHLywP9XR3CgY7LNor3RdHC5rRYHRW1ppuHfTeYzfIN2oWF4yZw/pub?gid=15294287&single=true&output=csv";
const REFRESH_MINUTES = 5;

(function () {
  const STATUSES = ["Not started", "In progress", "In review", "Delivered"];
  const STATUS_VAR = { "not started": "todo", "in progress": "prog", "in review": "rev", "delivered": "done" };
  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  let items = [];
  let loaded = false;
  let error = "";
  const now = new Date();
  let view = { y: now.getFullYear(), m: now.getMonth() };
  let showDone = false;
  try { showDone = localStorage.getItem("capsir-showDone") === "1"; } catch (e) {}

  const $ = (id) => document.getElementById(id);
  $("showDone").checked = showDone;

  const pad = (n) => String(n).padStart(2, "0");
  const ymd = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const todayStr = () => ymd(new Date());
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // Accepts 2026-10-15, 10/15/2026, 10/15/26, or "Oct 15, 2026"
  function normDate(raw) {
    const s = String(raw || "").trim();
    if (!s) return "";
    let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (m) return m[1] + "-" + pad(+m[2]) + "-" + pad(+m[3]);
    m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
    if (m) { const y = m[3].length === 2 ? 2000 + +m[3] : +m[3]; return y + "-" + pad(+m[1]) + "-" + pad(+m[2]); }
    const d = new Date(s);
    return isNaN(d) ? "" : ymd(d);
  }
  const parse = (s) => { const p = String(s || "").split("-").map(Number); return p[0] ? new Date(p[0], p[1] - 1, p[2]) : null; };
  function normStatus(s) {
    const k = String(s || "").trim().toLowerCase();
    const hit = STATUSES.find((x) => x.toLowerCase() === k);
    return hit || "Not started";
  }
  const sv = (st) => STATUS_VAR[st.toLowerCase()] || "todo";
  const colorVars = (st) => `--c:var(--s-${sv(st)});--cb:var(--s-${sv(st)}-bg)`;

  // Small CSV parser that handles quoted fields, commas and line breaks inside quotes
  function parseCSV(text) {
    const rows = []; let row = []; let field = ""; let q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) {
        if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else q = false; }
        else field += c;
      } else if (c === '"') q = true;
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(field); rows.push(row); row = []; field = "";
      } else field += c;
    }
    if (field !== "" || row.length) { row.push(field); rows.push(row); }
    return rows;
  }

  const COLS = {
    title: ["deliverable", "title"],
    listing: ["listing", "listing or project", "property"],
    type: ["type"],
    due: ["due", "due date"],
    status: ["status"],
    agent: ["agent", "listing agent"],
    link: ["preview link", "link"],
    notes: ["notes", "notes for the team"]
  };

  function rowsToItems(rows) {
    if (!rows.length) return [];
    const head = rows[0].map((h) => h.trim().toLowerCase());
    const idx = {};
    for (const k in COLS) idx[k] = head.findIndex((h) => COLS[k].includes(h));
    if (idx.title < 0) throw new Error("The sheet needs a \"Deliverable\" column in row 1.");
    const get = (r, k) => (idx[k] >= 0 ? String(r[idx[k]] || "").trim() : "");
    return rows.slice(1).map((r, n) => ({
      id: "r" + (n + 2),
      title: get(r, "title"),
      listing: get(r, "listing"),
      type: get(r, "type"),
      due: normDate(get(r, "due")),
      status: normStatus(get(r, "status")),
      agent: get(r, "agent"),
      link: get(r, "link"),
      notes: get(r, "notes")
    })).filter((i) => i.title);
  }

  async function load() {
    if (!SHEET_CSV_URL || SHEET_CSV_URL.indexOf("http") !== 0) {
      error = "This calendar isn't connected to its Google Sheet yet. Paste the published CSV link into main.js.";
      loaded = true; render(); return;
    }
    try {
      const sep = SHEET_CSV_URL.indexOf("?") >= 0 ? "&" : "?";
      const res = await fetch(SHEET_CSV_URL + sep + "_=" + Date.now(), { cache: "no-store" });
      if (!res.ok) throw new Error("The sheet returned an error (" + res.status + "). Check that it's still published to the web.");
      const text = await res.text();
      if (/^\s*</.test(text)) throw new Error("The link returned a web page instead of CSV. Re-publish the tab as CSV and use that link.");
      items = rowsToItems(parseCSV(text));
      error = "";
      $("syncText").textContent = "Updated " + new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    } catch (e) {
      error = (e && e.message) || "Couldn't load the sheet. Check your connection and refresh.";
    }
    loaded = true;
    render();
  }

  function renderCounts() {
    const c = { "Not started": 0, "In progress": 0, "In review": 0, "Delivered": 0 };
    items.forEach((i) => { c[i.status]++; });
    const t = todayStr();
    const late = items.filter((i) => i.status !== "Delivered" && i.due && i.due < t).length;
    $("counts").innerHTML = items.length
      ? `<span><b>${c["In progress"]}</b> in progress</span><span><b>${c["In review"]}</b> in review</span><span><b>${c["Delivered"]}</b> delivered</span>` + (late ? `<span><b>${late}</b> past due</span>` : "")
      : "";
  }

  function renderCal() {
    $("monthLabel").textContent = MONTHS[view.m] + " " + view.y;
    const first = new Date(view.y, view.m, 1);
    const start = new Date(first); start.setDate(1 - first.getDay());
    const last = new Date(view.y, view.m + 1, 0);
    const cells = Math.ceil((first.getDay() + last.getDate()) / 7) * 7;
    const byDay = {};
    items.forEach((i) => { if (i.due) (byDay[i.due] = byDay[i.due] || []).push(i); });
    const t = todayStr();
    let html = "";
    for (let k = 0; k < cells; k++) {
      const d = new Date(start); d.setDate(start.getDate() + k);
      const key = ymd(d);
      const cls = ["day", d.getMonth() !== view.m ? "out" : "", key === t ? "today" : ""].join(" ");
      const list = (byDay[key] || []).slice().sort((a, b) => STATUSES.indexOf(a.status) - STATUSES.indexOf(b.status));
      html += `<div class="${cls}"><span class="num">${d.getDate()}</span>` +
        list.map((i) => `<button class="chip ${i.status === "Delivered" ? "delivered" : ""}" style="${colorVars(i.status)}" data-id="${i.id}" title="${esc(i.title)} (${esc(i.status)})">${esc(i.title)}</button>`).join("") +
        `</div>`;
    }
    $("grid").innerHTML = html;
  }

  function itemCard(i) {
    const d = parse(i.due);
    const late = i.status !== "Delivered" && i.due && i.due < todayStr();
    const dateHtml = d
      ? `<div class="date ${late ? "late" : ""}"><div class="m">${MONTHS[d.getMonth()].slice(0, 3)}</div><div class="d">${d.getDate()}</div></div>`
      : `<div class="date"><div class="m">No date</div></div>`;
    const sub = [i.listing, i.agent].filter(Boolean).map(esc).join(" · ");
    return `<button class="item" data-id="${i.id}">${dateHtml}<div><div class="item-title">${esc(i.title)}</div>` +
      (sub ? `<div class="item-sub">${sub}</div>` : "") +
      `<div class="pills"><span class="pill" style="${colorVars(i.status)}">${esc(i.status)}</span>${i.type ? `<span class="pill type">${esc(i.type)}</span>` : ""}</div></div></button>`;
  }

  function renderList() {
    if (!loaded) return;
    if (error) { $("list").innerHTML = `<div class="empty">${esc(error)}</div>`; return; }
    const t = todayStr();
    const sorted = items.slice().sort((a, b) => (a.due || "9999").localeCompare(b.due || "9999"));
    const open = sorted.filter((i) => i.status !== "Delivered");
    const done = sorted.filter((i) => i.status === "Delivered").reverse();
    let html = "";
    if (!items.length) {
      html = `<div class="empty">No deliverables scheduled yet. New work shows up here as soon as it's added.</div>`;
    } else {
      const late = open.filter((i) => i.due && i.due < t);
      const upcoming = open.filter((i) => !(i.due && i.due < t));
      if (late.length) html += `<div class="group-label">Past due</div>` + late.map(itemCard).join("");
      html += upcoming.length
        ? (late.length ? `<div class="group-label">Upcoming</div>` : "") + upcoming.map(itemCard).join("")
        : `<div class="empty">Nothing open right now.</div>`;
      if (showDone && done.length) html += `<div class="group-label">Delivered</div>` + done.map(itemCard).join("");
    }
    $("list").innerHTML = `<div style="display:flex;flex-direction:column;gap:10px">${html}</div>`;
  }

  function render() { renderCounts(); renderCal(); renderList(); }

  function closePanel() { $("scrimHost").innerHTML = ""; }
  function openPanel(id) {
    const i = items.find((x) => x.id === id);
    if (!i) return;
    const d = parse(i.due);
    const link = /^https?:\/\//i.test(i.link) ? `<a href="${esc(i.link)}" target="_blank" rel="noopener">${esc(i.link)}</a>` : esc(i.link);
    const body = `<h3>${esc(i.title)}</h3>
      <div class="pills"><span class="pill" style="${colorVars(i.status)}">${esc(i.status)}</span>${i.type ? `<span class="pill type">${esc(i.type)}</span>` : ""}</div>
      <div class="ro"><dl>
        ${i.listing ? `<dt>Listing</dt><dd>${esc(i.listing)}</dd>` : ""}
        <dt>Due</dt><dd>${d ? d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }) : "Not scheduled"}</dd>
        ${i.agent ? `<dt>Agent</dt><dd>${esc(i.agent)}</dd>` : ""}
        ${i.link ? `<dt>Preview</dt><dd>${link}</dd>` : ""}
        ${i.notes ? `<dt>Notes</dt><dd>${esc(i.notes)}</dd>` : ""}
      </dl></div>
      <div class="actions"><span></span><button type="button" class="btn" id="closeBtn">Close</button></div>`;
    $("scrimHost").innerHTML = `<div class="scrim" id="scrim"><div class="panel" role="dialog" aria-modal="true" aria-label="${esc(i.title)}">${body}</div></div>`;
    $("scrim").addEventListener("click", (e) => { if (e.target.id === "scrim") closePanel(); });
    $("closeBtn").addEventListener("click", closePanel);
    $("closeBtn").focus();
  }

  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closePanel(); });
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-id]");
    if (t && !t.closest(".panel")) openPanel(t.getAttribute("data-id"));
  });
  $("prev").addEventListener("click", () => { view.m--; if (view.m < 0) { view.m = 11; view.y--; } renderCal(); });
  $("next").addEventListener("click", () => { view.m++; if (view.m > 11) { view.m = 0; view.y++; } renderCal(); });
  $("todayBtn").addEventListener("click", () => { const n = new Date(); view = { y: n.getFullYear(), m: n.getMonth() }; renderCal(); });
  $("showDone").addEventListener("change", (e) => {
    showDone = e.target.checked;
    try { localStorage.setItem("capsir-showDone", showDone ? "1" : "0"); } catch (err) {}
    renderList();
  });
  $("refreshBtn").addEventListener("click", load);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) load(); });
  setInterval(load, REFRESH_MINUTES * 60 * 1000);

  render();
  load();
})();
