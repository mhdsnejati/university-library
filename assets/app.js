
const data = window.LibraryBI;
const root = document.querySelector("#view-root");
const title = document.querySelector("#page-title");
const subtitle = document.querySelector("#page-subtitle");
const searchInput = document.querySelector("#global-search");
const navButtons = [...document.querySelectorAll(".nav button")];

const pageMeta = {
  overview: ["Project Overview", "Executive view of dataset health, delivery package, and high-level BI outcomes."],
  manager: ["Manager Dashboard", "Strategic KPIs for demand, purchase planning, branch workload, and financial exposure."],
  analyst: ["Analyst / Operator Dashboard", "Daily operational view for overdue follow-up, reservations, staff workload, and data quality."],
  member: ["Member Experience", "External user view for book availability, reservation status, fines, and self-service behavior."],
  chatbot: ["Telegram Chatbot", "Interactive simulator and implementation guide for the Telegram validation bot."],
  looker: ["Looker Studio", "Production build guide for recreating the dashboard in Looker Studio."],
  report: ["Final Report", "Full English analytical report prepared for submission."],
  erd: ["ERD & Data Model", "Entities, keys, relationships, constraints, and data quality model."],
  downloads: ["Downloads", "CSV exports, zip packages, and project files for submission or app integration."]
};

function fmt(value, decimals = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) return value ?? "";
  return n.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

function pct(value) {
  const n = Number(value);
  return Number.isFinite(n) ? `${n.toFixed(2)}%` : value;
}

function card(label, value, context, accent = "accent-blue") {
  return `<article class="card kpi ${accent}">
    <div class="label">${label}</div>
    <div class="value">${value}</div>
    <div class="context">${context}</div>
  </article>`;
}

function bars(rows, labelKey, valueKey, color = "var(--blue)") {
  const max = Math.max(...rows.map(row => Number(row[valueKey]) || 0), 1);
  return `<div class="bar-chart">${rows.map(row => {
    const value = Number(row[valueKey]) || 0;
    const width = Math.max(2, value / max * 100);
    return `<div class="bar-row">
      <div class="bar-label" title="${escapeHtml(row[labelKey])}">${escapeHtml(row[labelKey])}</div>
      <div class="bar-track"><div class="bar-fill" style="width:${width}%;background:${color}"></div></div>
      <div class="bar-value">${fmt(value)}</div>
    </div>`;
  }).join("")}</div>`;
}

function table(rows, columns, limit = 20) {
  const visibleRows = rows.slice(0, limit);
  return `<div class="table-scroll"><table>
    <thead><tr>${columns.map(col => `<th>${escapeHtml(col.label)}</th>`).join("")}</tr></thead>
    <tbody>${visibleRows.map(row => `<tr>${columns.map(col => `<td>${escapeHtml(formatCell(row[col.key], col))}</td>`).join("")}</tr>`).join("")}</tbody>
  </table></div>`;
}

function formatCell(value, col) {
  if (col.type === "number") return fmt(value);
  if (col.type === "money") return fmt(value, 2);
  if (col.type === "score") return fmt(value, 2);
  return value ?? "";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function section(html) {
  return `<div class="view">${html}</div>`;
}

function renderOverview() {
  const k = data.kpis;
  root.innerHTML = section(`
    <div class="grid cols-4">
      ${card("Total loans", fmt(k.total_loans), "Complete circulation history", "accent-blue")}
      ${card("Available copies", fmt(k.available_copies), `${pct(k.availability_rate_percent)} availability`, "accent-green")}
      ${card("Reservations", fmt(k.total_reservations), `${fmt(k.waiting_reservations)} waiting requests`, "accent-amber")}
      ${card("Validation", "0 errors", "Foreign keys and loan dates passed", "accent-cyan")}
    </div>
    <div class="grid cols-2">
      <article class="card">
        <h2>Professional Delivery Package</h2>
        <p>This website integrates the BI dashboard, final report, data model, Looker Studio plan, Telegram chatbot, Colab instructions, and downloads in one place.</p>
        <p><strong>Dataset:</strong> close-to-real assumed operational data designed to behave like a real university library export.</p>
        <p><strong>Validation:</strong> <span class="status-ok">${data.validation.validation.join(", ")}</span></p>
      </article>
      <article class="card">
        <h2>Management Findings</h2>
        <p>Purchase planning should prioritize high reservation pressure and low availability.</p>
        <p>Central Library carries the largest loan workload and should be reviewed first for staffing and copy allocation.</p>
        <p>Student members are the largest usage segment, so reminders, rules, and chatbot flows should be optimized for them.</p>
      </article>
    </div>
    <div class="grid cols-2">
      <article class="card">
        <h3>Monthly Borrowing Trend</h3>
        ${bars(data.charts.monthlyLoans, "month", "loans", "var(--blue)")}
      </article>
      <article class="card">
        <h3>Top Purchase Recommendations</h3>
        ${table(data.tables.purchaseNeeds, [
          {key:"title", label:"Title"},
          {key:"category_name", label:"Category"},
          {key:"reservation_count", label:"Reservations", type:"number"},
          {key:"available_copies", label:"Available", type:"number"},
          {key:"purchase_need_score", label:"Score", type:"score"}
        ], 8)}
      </article>
    </div>
  `);
}

function renderManager() {
  const k = data.kpis;
  root.innerHTML = section(`
    <div class="grid cols-4">
      ${card("Total loans", fmt(k.total_loans), "Unit: loan records", "accent-blue")}
      ${card("Overdue rate", pct(k.overdue_rate_percent), "Open-loan risk indicator", "accent-red")}
      ${card("Available copies", fmt(k.available_copies), "Current service capacity", "accent-green")}
      ${card("Fine balance", fmt(k.fine_balance, 2), "Outstanding amount", "accent-amber")}
    </div>
    <div class="grid cols-2">
      <article class="card">
        <h3>Loans by Branch</h3>
        ${bars(data.charts.loansByBranch, "branch_name", "loans", "var(--green)")}
        <p>Use this to compare workload and staffing pressure.</p>
      </article>
      <article class="card">
        <h3>Reservation Status</h3>
        ${bars(data.charts.reservationStatus, "reservation_status", "reservations", "var(--amber)")}
        <p>Shows demand pipeline: fulfilled, waiting, cancelled, and expired requests.</p>
      </article>
    </div>
    <article class="card">
      <h3>Purchase Need Ranking</h3>
      ${table(data.tables.purchaseNeeds, [
        {key:"book_id", label:"Book ID"},
        {key:"title", label:"Title"},
        {key:"category_name", label:"Category"},
        {key:"loan_count", label:"Loans", type:"number"},
        {key:"reservation_count", label:"Reservations", type:"number"},
        {key:"available_copies", label:"Available", type:"number"},
        {key:"purchase_need_score", label:"Purchase Score", type:"score"}
      ], 15)}
    </article>
  `);
}

function renderAnalyst() {
  const k = data.kpis;
  root.innerHTML = section(`
    <div class="grid cols-4">
      ${card("Active loans", fmt(k.active_loans), "Currently open", "accent-blue")}
      ${card("Overdue loans", fmt(k.overdue_loans), "Need follow-up", "accent-red")}
      ${card("Waiting reservations", fmt(k.waiting_reservations), "Queue pressure", "accent-amber")}
      ${card("Returned loans", fmt(Number(k.total_loans) - Number(k.active_loans) - Number(k.overdue_loans)), "Completed or closed", "accent-green")}
    </div>
    <div class="grid cols-2">
      <article class="card">
        <h3>Overdue Loans by Category</h3>
        ${bars(data.charts.overdueByCategory, "category_name", "overdue_loans", "var(--red)")}
      </article>
      <article class="card">
        <h3>Librarian Checkout Workload</h3>
        ${bars(data.charts.operatorWorkload, "checkout_librarian", "processed_loans", "var(--cyan)")}
      </article>
    </div>
    <article class="card">
      <h3>Active / Overdue / Lost Loans</h3>
      ${table(data.tables.activeLoans, [
        {key:"loan_id", label:"Loan"},
        {key:"checkout_date", label:"Checkout"},
        {key:"due_date", label:"Due"},
        {key:"loan_status", label:"Status"},
        {key:"member_type", label:"Member Type"},
        {key:"branch_name", label:"Branch"},
        {key:"title", label:"Title"}
      ], 25)}
    </article>
  `);
}

function renderMember() {
  const query = searchInput.value.trim().toLowerCase();
  const books = data.tables.bookAvailability.filter(row => {
    if (!query) return true;
    return `${row.title} ${row.category_name} ${row.book_id}`.toLowerCase().includes(query);
  });
  root.innerHTML = section(`
    <div class="grid cols-4">
      ${card("Availability rate", pct(data.kpis.availability_rate_percent), "Available copies / total copies", "accent-green")}
      ${card("Total reservations", fmt(data.kpis.total_reservations), "All request statuses", "accent-amber")}
      ${card("Paid fines", fmt(data.kpis.paid_fines, 2), "Collected amount", "accent-blue")}
      ${card("Book titles", fmt(data.validation.row_counts.book), "Searchable catalog", "accent-cyan")}
    </div>
    <div class="grid cols-2">
      <article class="card">
        <h3>Member Type Usage</h3>
        ${bars(data.charts.memberTypeUsage, "member_type", "loans", "var(--blue)")}
      </article>
      <article class="card">
        <h3>Fine Balance by Type</h3>
        ${bars(data.charts.fineByType, "fine_type", "outstanding_amount", "var(--amber)")}
      </article>
    </div>
    <article class="card">
      <h3>Searchable Book Availability</h3>
      ${table(books, [
        {key:"book_id", label:"Book ID"},
        {key:"title", label:"Title"},
        {key:"category_name", label:"Category"},
        {key:"loan_count", label:"Loans", type:"number"},
        {key:"reservation_count", label:"Reservations", type:"number"},
        {key:"available_copies", label:"Available", type:"number"},
        {key:"total_copies", label:"Total", type:"number"}
      ], 25)}
    </article>
  `);
}

function renderChatbot() {
  root.innerHTML = section(`
    <div class="grid cols-2">
      <article class="card">
        <h3>Telegram Bot Simulator</h3>
        <p>Try commands such as <code>/search database</code>, <code>/reserve M000001 B000001</code>, <code>/kpis</code>, or <code>/purchase_needs</code>.</p>
        <div class="chat-window" id="chat-window">
          <div class="message">Central University Library Bot is ready. Type <code>/start</code> for commands.</div>
        </div>
        <div class="chat-controls">
          <input id="chat-input" type="text" placeholder="/search database">
          <button class="action" id="chat-send">Send</button>
        </div>
      </article>
      <article class="card doc">${data.docs.telegram}</article>
    </div>
  `);
  document.querySelector("#chat-send").addEventListener("click", sendChat);
  document.querySelector("#chat-input").addEventListener("keydown", event => {
    if (event.key === "Enter") sendChat();
  });
}

function sendChat() {
  const input = document.querySelector("#chat-input");
  const text = input.value.trim();
  if (!text) return;
  input.value = "";
  addMessage(text, "user");
  addMessage(handleBotCommand(text), "bot");
}

function addMessage(text, kind) {
  const box = document.querySelector("#chat-window");
  const div = document.createElement("div");
  div.className = `message ${kind === "user" ? "user" : ""}`;
  div.innerHTML = text;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

function handleBotCommand(text) {
  const parts = text.trim().split(/\s+/);
  const cmd = (parts[0] || "").toLowerCase();
  if (!cmd || cmd === "/start" || cmd === "/help") {
    return `<strong>Commands</strong><br>/search keyword<br>/reserve MEMBER_ID BOOK_ID<br>/loans MEMBER_ID<br>/fines MEMBER_ID<br>/kpis<br>/purchase_needs`;
  }
  if (cmd === "/search") {
    const term = parts.slice(1).join(" ").toLowerCase();
    if (!term) return "Please write a search term. Example: /search database";
    const results = data.chatbot.books.filter(book => `${book.title} ${book.category_name} ${book.book_id}`.toLowerCase().includes(term)).slice(0, 5);
    if (!results.length) return "No matching books were found.";
    return `<strong>Search results</strong><br>${results.map(book => `${escapeHtml(book.book_id)} | ${escapeHtml(book.title)}<br>Category: ${escapeHtml(book.category_name)} | Available: ${book.available_copies}`).join("<br><br>")}`;
  }
  if (cmd === "/reserve") {
    if (parts.length !== 3) return "Use this format: /reserve MEMBER_ID BOOK_ID";
    const member = data.chatbot.members[parts[1]];
    if (!member) return "Member ID was not found. Please check the ID.";
    if (member.status !== "active") return `Reservation rejected because member status is ${escapeHtml(member.status)}.`;
    if (Number(member.fine_balance) > 35) return `Reservation rejected because outstanding fines are ${fmt(member.fine_balance, 2)}.`;
    const book = data.chatbot.books.find(item => item.book_id === parts[2]);
    if (!book) return "Book ID was not found in the simulator sample.";
    const tracking = `RSV-20260708-${parts[1].slice(-3)}-${parts[2].slice(-3)}`;
    return `Reservation accepted. ${book.available_copies} available copy/copies found. Tracking number: ${tracking}.`;
  }
  if (cmd === "/kpis") {
    return `<strong>Manager KPI Summary</strong><br>Total loans: ${fmt(data.kpis.total_loans)}<br>Active loans: ${fmt(data.kpis.active_loans)}<br>Overdue loans: ${fmt(data.kpis.overdue_loans)}<br>Overdue rate: ${pct(data.kpis.overdue_rate_percent)}<br>Available copies: ${fmt(data.kpis.available_copies)}<br>Waiting reservations: ${fmt(data.kpis.waiting_reservations)}<br>Fine balance: ${fmt(data.kpis.fine_balance, 2)}`;
  }
  if (cmd === "/purchase_needs") {
    return `<strong>Top Purchase Recommendations</strong><br>${data.tables.purchaseNeeds.slice(0, 5).map(row => `${escapeHtml(row.book_id)} | ${escapeHtml(row.title)}<br>Score: ${row.purchase_need_score} | Loans: ${row.loan_count} | Reservations: ${row.reservation_count} | Available: ${row.available_copies}`).join("<br><br>")}`;
  }
  if (cmd === "/fines") {
    if (parts.length !== 2) return "Use this format: /fines MEMBER_ID";
    const member = data.chatbot.members[parts[1]];
    if (!member) return "Member ID was not found.";
    return `<strong>Fine summary for ${escapeHtml(parts[1])}</strong><br>Outstanding: ${fmt(member.fine_balance, 2)}<br>Member type: ${escapeHtml(member.member_type)}`;
  }
  if (cmd === "/loans") {
    if (parts.length !== 2) return "Use this format: /loans MEMBER_ID";
    const rows = data.tables.activeLoans.filter(row => row.member_id === parts[1]).slice(0, 6);
    if (!rows.length) return `No active, overdue, or lost loans found for ${escapeHtml(parts[1])}.`;
    return `<strong>Open loans for ${escapeHtml(parts[1])}</strong><br>${rows.map(row => `${row.loan_id} | ${row.loan_status} | Due: ${row.due_date}<br>${escapeHtml(row.title)}`).join("<br><br>")}`;
  }
  return "Unknown command. Try /start.";
}

function renderLooker() {
  root.innerHTML = section(`
    <div class="grid cols-2">
      <article class="card">
        <h2>Production Looker Studio Build</h2>
        <p>Use the CSV exports as Google Sheets data sources. Build three role-based pages: Manager, Analyst/Operator, and External User/Member.</p>
        <div class="download-list">${data.downloads.filter(item => item.name.includes("CSV") || item.name.includes("zip")).slice(0, 6).map(item => `<div class="download-item"><span>${escapeHtml(item.name)}</span><a href="${item.path}" download>Download</a></div>`).join("")}</div>
      </article>
      <article class="card">
        <h3>Required Filters</h3>
        <p>Date range, branch, category, member type, loan status, and librarian.</p>
        <h3>Required Chart Types</h3>
        <p>KPI cards, time trend, bar chart, donut chart, ranking table, and searchable availability table.</p>
      </article>
    </div>
    <article class="card doc">${data.docs.looker}</article>
  `);
}

function renderReport() {
  root.innerHTML = section(`<article class="card doc">${data.docs.report}</article>`);
}

function renderErd() {
  root.innerHTML = section(`
    <div class="grid cols-2">
      <article class="card doc">${data.docs.erd}</article>
      <article class="card doc">${data.docs.summary}</article>
    </div>
  `);
}

function renderDownloads() {
  root.innerHTML = section(`
    <article class="card">
      <h2>Project Downloads</h2>
      <p>Use the Looker exports zip for dashboard/app integration. Use the complete package zip for submission or backup.</p>
      <div class="download-list">${data.downloads.map(item => `<div class="download-item"><span>${escapeHtml(item.name)}</span><a href="${item.path}" download>Download</a></div>`).join("")}</div>
    </article>
    <article class="card">
      <h3>Validation Summary</h3>
      <pre>${escapeHtml(JSON.stringify(data.validation, null, 2))}</pre>
    </article>
  `);
}

const renderers = {
  overview: renderOverview,
  manager: renderManager,
  analyst: renderAnalyst,
  member: renderMember,
  chatbot: renderChatbot,
  looker: renderLooker,
  report: renderReport,
  erd: renderErd,
  downloads: renderDownloads
};

function setView(view) {
  navButtons.forEach(button => button.classList.toggle("active", button.dataset.view === view));
  title.textContent = pageMeta[view][0];
  subtitle.textContent = pageMeta[view][1];
  renderers[view]();
}

navButtons.forEach(button => button.addEventListener("click", () => setView(button.dataset.view)));
searchInput.addEventListener("input", () => {
  const active = document.querySelector(".nav button.active")?.dataset.view;
  if (searchInput.value.trim() && active !== "member") {
    setView("member");
    return;
  }
  if (active === "member") renderMember();
});

setView("overview");
