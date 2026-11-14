/* Gedeeld door alle pagina's behalve login.html: inlogcontrole, gegevens, hulpfuncties, topbalk, onderbalk, venster en melding. */

try { if (!localStorage.getItem("thuisinventaris-user")) location.replace("login.html"); } catch { location.replace("login.html"); }

const PAGE = document.body.dataset.page;
const DEFAULT_LOCATIONS = ["Garage – Kast 1","Garage – Kast 2","Schuur – Plank 1"];
const defaultItems = [
  {id:1, name:"Boormachine", category:"Gereedschap", location:"Garage – Kast 1", quantity:1, qr:"QR2", loanedTo:"Oma", loanDate:"02-11-2026"},
  {id:2, name:"Hamer", category:"Gereedschap", location:"Garage – Kast 1", quantity:2, qr:"QR3", loanedTo:"", loanDate:""},
  {id:3, name:"Brandblusser", category:"Overig", location:"Garage – Kast 2", quantity:1, qr:"QR4", loanedTo:"", loanDate:"", expiry:"2027-05-20"},
  {id:4, name:"Verlengsnoer", category:"Elektronica", location:"Schuur – Plank 1", quantity:3, qr:"QR5", loanedTo:"", loanDate:""}
];

function read(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; }
}

function migrate(item) {
  const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(item.expiry || "");
  return m ? { ...item, expiry: `${m[3]}-${m[2]}-${m[1]}` } : item;
}

let items = read("thuisinventaris-items", defaultItems).map(migrate);
let locations = read("thuisinventaris-locations", DEFAULT_LOCATIONS);

function persist() {
  try {
    localStorage.setItem("thuisinventaris-items", JSON.stringify(items));
    localStorage.setItem("thuisinventaris-locations", JSON.stringify(locations));
  } catch { showToast("Opslaan in deze browser lukt niet."); }
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}

function fmtDate(iso) { const [y, m, d] = iso.split("-"); return `${d}-${m}-${y}`; }

function expiryBadge(item) {
  if (!item.expiry) return "";
  const days = Math.ceil((new Date(item.expiry) - new Date()) / 864e5);
  if (days > 90) return "";
  return `<span class="status warning">${days < 0 ? "Verlopen" : "Vervalt over " + days + " dagen"}</span>`;
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message; toast.classList.add("show");
  clearTimeout(window.toastTimer); window.toastTimer = setTimeout(()=>toast.classList.remove("show"),2500);
}

function logout() {
  try { localStorage.removeItem("thuisinventaris-user"); } catch {}
  location.replace("login.html");
}

let modalDone = null;
function openModal({ title, text = "", label = "", type = "text", value = "", confirm = "OK", options = null, onConfirm }) {
  document.getElementById("modal-title").textContent = title;
  document.getElementById("modal-text").textContent = text;
  document.getElementById("modal-field").hidden = !label;
  document.getElementById("modal-label").textContent = label;
  const input = document.getElementById("modal-input");
  const select = document.getElementById("modal-select");
  input.hidden = !!options; select.hidden = !options;
  if (options) select.innerHTML = options.map(o => `<option ${o === value ? "selected" : ""}>${escapeHtml(o)}</option>`).join("");
  input.type = type; input.value = value; input.required = !!label && !options; input.min = type === "number" ? 1 : "";
  document.getElementById("modal-ok").textContent = confirm;
  modalDone = onConfirm;
  document.getElementById("modal").classList.add("show");
  (options ? select : label ? input : document.getElementById("modal-ok")).focus();
}

function closeModal() { document.getElementById("modal").classList.remove("show"); }

/* Topbalk, onderbalk, venster en melding worden op elke pagina hier opgebouwd. */
const NAV = [
  ["index", "Spullen", `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 9h8M8 13h8"/></svg>`],
  ["scan", "Scan QR", `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M4 12h16"/></svg>`],
  ["locaties", "Locaties", `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>`],
  ["familie", "Familie", `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 5.5a3 3 0 0 1 0 5M18 14.5c1.8.8 3 2.6 3 5.5"/></svg>`]
];
document.getElementById("topbar").innerHTML = `
  <a href="index.html" class="brand" aria-label="Naar het overzicht"><div class="brand-mark">T</div><h1>Thuisinventaris</h1></a>
  <div class="top-actions">
    <button class="secondary" onclick="logout()">Uitloggen</button>
    <a class="icon-button" href="instellingen.html" title="Instellingen" aria-label="Instellingen"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></a>
  </div>`;
document.getElementById("nav").innerHTML = NAV.map(([id, label, icon]) =>
  `<a class="tab${id === PAGE ? " active" : ""}" href="${id}.html"${id === PAGE ? ' aria-current="page"' : ""}>${icon}${label}</a>`).join("");
document.body.insertAdjacentHTML("beforeend", `
  <div id="modal" class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <form class="modal" id="modal-form">
      <h2 id="modal-title"></h2>
      <p id="modal-text" class="muted"></p>
      <div class="field" id="modal-field"><label for="modal-input" id="modal-label"></label><input id="modal-input"><select id="modal-select" hidden></select></div>
      <div class="form-actions"><button type="button" class="secondary" id="modal-cancel">Annuleren</button><button type="submit" class="primary" id="modal-ok">OK</button></div>
    </form>
  </div>
  <div id="toast" class="toast" role="status"></div>`);

document.getElementById("modal-form").addEventListener("submit", e => {
  e.preventDefault();
  const select = document.getElementById("modal-select");
  const value = select.hidden ? document.getElementById("modal-input").value : select.value;
  if (modalDone(value) !== false) closeModal();
});
document.getElementById("modal-cancel").addEventListener("click", closeModal);
document.getElementById("modal").addEventListener("click", e => { if (e.target.id === "modal") closeModal(); });
document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeModal();
  if (e.key === "Enter" && e.target.matches('[role="button"]')) e.target.click();
});
