
/* =========================================================
   THUISINVENTARIS - GEDEELDE APP.JS
   Opslag, inventaris, navigatie, modals en meldingen.
========================================================= */

// -------------------------
// 1. INLOGCONTROLE
// -------------------------

try {
  if (!localStorage.getItem("thuisinventaris-user")) {
    location.replace("login.html");
  }
} catch {
  location.replace("login.html");
}

const PAGE = document.body.dataset.page ||
  location.pathname.split("/").pop().replace(".html", "").toLowerCase();

const DEFAULT_LOCATIONS = [
  "Garage – Kast 1",
  "Garage – Kast 2",
  "Schuur – Plank 1"
];

const defaultItems = [
  {
    id: 1,
    name: "Boormachine",
    category: "Gereedschap",
    location: "Garage – Kast 1",
    quantity: 1,
    qr: "QR2",
    loanedTo: "Oma",
    loanDate: "02-11-2026"
  },
  {
    id: 2,
    name: "Hamer",
    category: "Gereedschap",
    location: "Garage – Kast 1",
    quantity: 2,
    qr: "QR3",
    loanedTo: "",
    loanDate: ""
  },
  {
    id: 3,
    name: "Brandblusser",
    category: "Overig",
    location: "Garage – Kast 2",
    quantity: 1,
    qr: "QR4",
    loanedTo: "",
    loanDate: "",
    expiry: "2027-05-20"
  },
  {
    id: 4,
    name: "Verlengsnoer",
    category: "Elektronica",
    location: "Schuur – Plank 1",
    quantity: 3,
    qr: "QR5",
    loanedTo: "",
    loanDate: ""
  }
];

// -------------------------
// 2. GEGEVENS OPHALEN
// -------------------------

function read(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function migrate(item) {
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(
    item.expiry || ""
  );

  return match
    ? {
        ...item,
        expiry: `${match[3]}-${match[2]}-${match[1]}`
      }
    : item;
}

let items = read("thuisinventaris-items", defaultItems);

if (!Array.isArray(items)) items = defaultItems;

items = items.map(migrate);

let locations = read(
  "thuisinventaris-locations",
  DEFAULT_LOCATIONS
);

if (!Array.isArray(locations)) {
  locations = [...DEFAULT_LOCATIONS];
}

let activeFilter = "all";
let selectedItemId = null;
let modalDone = null;

// -------------------------
// 3. OPSLAAN
// -------------------------

function persist() {
  try {
    localStorage.setItem(
      "thuisinventaris-items",
      JSON.stringify(items)
    );

    localStorage.setItem(
      "thuisinventaris-locations",
      JSON.stringify(locations)
    );

    return true;
  } catch {
    showToast("Opslaan in deze browser lukt niet.");
    return false;
  }
}

// -------------------------
// 4. HULPFUNCTIES
// -------------------------

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[c]);
}

function fmtDate(iso) {
  if (!iso) return "";

  const [year, month, day] = iso.split("-");

  return `${day}-${month}-${year}`;
}

function expiryBadge(item) {
  if (!item.expiry) return "";

  const expiry = new Date(item.expiry + "T00:00:00");
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const days = Math.ceil(
    (expiry - today) / 86400000
  );

  if (days > 90) return "";

  return `
    <span class="status warning">
      ${days < 0
        ? "Verlopen"
        : days === 0
          ? "Vervalt vandaag"
          : "Vervalt over " + days + " dagen"}
    </span>
  `;
}

function getItem(id) {
  return items.find(item => item.id === Number(id));
}

// -------------------------
// 5. MELDINGEN
// -------------------------

let toastTimer;

function showToast(message) {
  const toast = document.getElementById("toast");

  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

// -------------------------
// 6. UITLOGGEN
// -------------------------

function logout() {
  try {
    localStorage.removeItem("thuisinventaris-user");
  } catch {}

  location.replace("login.html");
}

// -------------------------
// 7. MODAL
// -------------------------

function createModal() {
  if (document.getElementById("modal")) return;

  document.body.insertAdjacentHTML("beforeend", `
    <div
      id="modal"
      class="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <form class="modal" id="modal-form">
        <h2 id="modal-title"></h2>

        <p id="modal-text" class="muted"></p>

        <div class="field" id="modal-field">
          <label for="modal-input" id="modal-label"></label>
          <input id="modal-input">
          <select id="modal-select" hidden></select>
        </div>

        <div class="form-actions">
          <button type="button" class="secondary" id="modal-cancel">
            Annuleren
          </button>

          <button type="submit" class="primary" id="modal-ok">
            OK
          </button>
        </div>
      </form>
    </div>
  `);
}

function openModal({
  title,
  text = "",
  label = "",
  type = "text",
  value = "",
  confirm = "OK",
  options = null,
  onConfirm
}) {
  createModal();

  const modal = document.getElementById("modal");
  const input = document.getElementById("modal-input");
  const select = document.getElementById("modal-select");

  document.getElementById("modal-title").textContent = title;
  document.getElementById("modal-text").textContent = text;
  document.getElementById("modal-field").hidden = !label;
  document.getElementById("modal-label").textContent = label;

  input.hidden = !!options;
  select.hidden = !options;

  if (options) {
    select.innerHTML = options.map(option => `
      <option value="${escapeHtml(option)}"
        ${option === value ? "selected" : ""}>
        ${escapeHtml(option)}
      </option>
    `).join("");
  }

  input.type = type;
  input.value = value;
  input.required = !!label && !options;
  input.min = type === "number" ? 1 : "";

  document.getElementById("modal-ok").textContent = confirm;

  modalDone = onConfirm;

  modal.classList.add("show");

  (options ? select : label ? input :
    document.getElementById("modal-ok")).focus();
}

function closeModal() {
  document.getElementById("modal")?.classList.remove("show");
}

// -------------------------
// 8. MODAL GEBEURTENISSEN
// -------------------------

function setupModal() {
  createModal();

  document.getElementById("modal-form")
    .addEventListener("submit", event => {
      event.preventDefault();

      if (!modalDone) {
        closeModal();
        return;
      }

      const select = document.getElementById("modal-select");

      const value = select.hidden
        ? document.getElementById("modal-input").value
        : select.value;

      if (modalDone(value) !== false) {
        closeModal();
      }
    });

  document.getElementById("modal-cancel")
    .addEventListener("click", closeModal);

  document.getElementById("modal")
    .addEventListener("click", event => {
      if (event.target.id === "modal") {
        closeModal();
      }
    });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeModal();
  });
}

// -------------------------
// 9. NAVIGATIE
// -------------------------

const NAV = [
  [
    "index",
    "Spullen",
    `<svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="3"/>
      <path d="M8 9h8M8 13h8"/>
    </svg>`
  ],
  [
    "scan",
    "Scan QR",
    `<svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M4 12h16"/>
    </svg>`
  ],
  [
    "locaties",
    "Locaties",
    `<svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z"/>
      <circle cx="12" cy="10" r="2.5"/>
    </svg>`
  ],
  [
    "familie",
    "Familie",
    `<svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="9" cy="8" r="3"/>
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 5.5a3 3 0 0 1 0 5M18 14.5c1.8.8 3 2.6 3 5.5"/>
    </svg>`
  ]
];

function setupNavigation() {
  const topbar = document.getElementById("topbar");

  if (topbar) {
    topbar.innerHTML = `
      <a href="index.html" class="brand">
        <div class="brand-mark">T</div>
        <h1>Thuisinventaris</h1>
      </a>

      <div class="top-actions">
        <button class="secondary" onclick="logout()">
          Uitloggen
        </button>

        <a class="icon-button"
          href="Instellingen.html"
          title="Instellingen"
          aria-label="Instellingen">⚙</a>
      </div>
    `;
  }

  const nav = document.getElementById("nav");

  if (nav) {
    nav.innerHTML = NAV.map(([id, label, icon]) => `
      <a class="tab${id === PAGE ? " active" : ""}"
         href="${id}.html"
         ${id === PAGE ? 'aria-current="page"' : ""}>
        ${icon}
        ${label}
      </a>
    `).join("");
  }
}

// -------------------------
// 10. PAGINA WEERGEVEN
// -------------------------

function showView(view) {
  document.querySelectorAll(".view").forEach(section => {
    section.classList.toggle(
      "active",
      section.id === "view-" + view
    );
  });

  document.body.dataset.view = view;

  if (view === "items") {
    renderItems();
  }

  if (view === "add") {
    updateLocationSelect();
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// -------------------------
// 11. STATISTIEKEN
// -------------------------

function renderStats() {
  const total = items.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  const loaned = items.filter(
    item => item.loanedTo
  ).length;

  const locationCount = new Set(
    items.map(item => item.location).filter(Boolean)
  ).size;

  const totalElement = document.getElementById("stat-total");
  const loanedElement = document.getElementById("stat-loaned");
  const locationElement = document.getElementById("stat-locations");

  if (totalElement) totalElement.textContent = total;
  if (loanedElement) loanedElement.textContent = loaned;
  if (locationElement) locationElement.textContent = locationCount;
}

// -------------------------
// 12. VOORWERPEN WEERGEVEN
// -------------------------

function renderItems() {
  const container = document.getElementById("items-list");

  if (!container) return;

  const search = (
    document.getElementById("search")?.value || ""
  ).toLowerCase();

  const category = (
    document.getElementById("category-select")?.value || ""
  );

  const filtered = items.filter(item => {
    const matchesSearch = [
      item.name,
      item.location,
      item.qr,
      item.category
    ].some(value =>
      String(value || "").toLowerCase().includes(search)
    );

    const matchesCategory =
      !category || item.category === category;

    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "available" && !item.loanedTo) ||
      (activeFilter === "loaned" && !!item.loanedTo);

    return matchesSearch && matchesCategory && matchesFilter;
  });

  renderStats();

  if (!filtered.length) {
    container.innerHTML = `
      <div class="empty">
        <h3>Geen voorwerpen gevonden</h3>
        <p>Probeer een andere zoekopdracht of voeg een voorwerp toe.</p>
      </div>
    `;

    return;
  }

  container.innerHTML = filtered.map(item => `
    <article
      class="item-card"
      role="button"
      tabindex="0"
      onclick="showDetail(${item.id})"
      onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();showDetail(${item.id})}"
    >
      <div>
        <h3>${escapeHtml(item.name)}</h3>

        <div class="item-meta">
          ${escapeHtml(item.category)}
        </div>

        <div class="item-meta">
          ${escapeHtml(item.location)}
        </div>

        <div class="item-meta">
          Aantal: ${Number(item.quantity) || 0}
        </div>
      </div>

      <div class="item-right">
        <span class="status ${item.loanedTo ? "loaned" : "available"}">
          ${item.loanedTo ? "Uitgeleend" : "Beschikbaar"}
        </span>

        ${expiryBadge(item)}
      </div>
    </article>
  `).join("");
}

// -------------------------
// 13. FILTERS
// -------------------------

function setFilter(filter, button) {
  activeFilter = filter;

  document.querySelectorAll(".chip").forEach(chip => {
    chip.classList.remove("active");
  });

  if (button) {
    button.classList.add("active");
  } else {
    document.querySelector(
      `.chip[data-filter="${filter}"]`
    )?.classList.add("active");
  }

  renderItems();
}

// -------------------------
// 14. LOCATIES IN FORMULIER
// -------------------------

function updateLocationSelect(selected = "") {
  const select = document.getElementById("item-location");

  if (!select) return;

  select.innerHTML = locations.map(location => `
    <option value="${escapeHtml(location)}"
      ${location === selected ? "selected" : ""}>
      ${escapeHtml(location)}
    </option>
  `).join("");

  if (!locations.length) {
    select.innerHTML = `<option value="">Geen locaties beschikbaar</option>`;
  }
}

// -------------------------
// 15. NIEUW VOORWERP
// -------------------------

function openAdd() {
  const form = document.getElementById("item-form");

  if (!form) return;

  form.reset();

  document.getElementById("item-quantity").value = 1;

  updateLocationSelect();

  showView("add");
}

function saveItem(event) {
  event.preventDefault();

  const name = document.getElementById("item-name").value.trim();
  const category = document.getElementById("item-category").value;
  const location = document.getElementById("item-location").value;
  const quantity = Number(document.getElementById("item-quantity").value);
  const qr = document.getElementById("item-qr").value.trim();
  const expiry = document.getElementById("item-expiry").value;

  if (!name || !quantity || quantity < 1 || !location) {
    showToast("Controleer de ingevulde gegevens.");
    return;
  }

  if (qr && items.some(item => item.qr &&
      item.qr.toLowerCase() === qr.toLowerCase())) {
    showToast("Deze QR-code wordt al gebruikt.");
    return;
  }

  const newItem = {
    id: Date.now(),
    name,
    category,
    location,
    quantity,
    qr,
    loanedTo: "",
    loanDate: "",
    expiry
  };

  items.push(newItem);

  if (!persist()) {
    items.pop();
    return;
  }

  document.getElementById("item-form").reset();

  showToast("Voorwerp toegevoegd!");

  showView("items");
}

// -------------------------
// 16. VOORWERP DETAILS
// -------------------------

function showDetail(id) {
  const item = getItem(id);

  if (!item) {
    showToast("Voorwerp niet gevonden.");
    return;
  }

  selectedItemId = item.id;

  const content = document.getElementById("detail-content");

  if (!content) return;

  content.innerHTML = `
    <h2>${escapeHtml(item.name)}</h2>

    <p class="muted">
      ${escapeHtml(item.category)}
    </p>

    <div class="detail-info">
      <p><strong>Locatie:</strong> ${escapeHtml(item.location)}</p>
      <p><strong>Aantal:</strong> ${Number(item.quantity)}</p>
      <p><strong>QR-code:</strong> ${escapeHtml(item.qr || "Geen QR-code")}</p>
      <p><strong>Vervaldatum:</strong> ${item.expiry ? fmtDate(item.expiry) : "Geen vervaldatum"}</p>
    </div>

    ${expiryBadge(item)}

    ${item.loanedTo ? `
      <div class="loan-box">
        <strong>Uitgeleend aan ${escapeHtml(item.loanedTo)}</strong>
        <p>Uitgeleend op: ${escapeHtml(item.loanDate || "Onbekend")}</p>
      </div>
    ` : `
      <p class="status available">Beschikbaar</p>
    `}

    <div class="detail-actions">
      <button class="primary" onclick="editItem(${item.id})">
        Bewerken
      </button>

      ${item.loanedTo ? `
        <button class="secondary" onclick="returnItem(${item.id})">
          Terugmelden
        </button>
      ` : `
        <button class="secondary" onclick="loanItem(${item.id})">
          Uitlenen
        </button>
      `}

      <button class="secondary danger" onclick="deleteItem(${item.id})">
        Verwijderen
      </button>
    </div>
  `;

  showView("detail");
}

// -------------------------
// 17. VOORWERP BEWERKEN
// -------------------------

function editItem(id) {
  const item = getItem(id);

  if (!item) return;

  openModal({
    title: "Voorwerp bewerken",
    text: "Pas de naam van het voorwerp aan.",
    label: "NAAM",
    value: item.name,
    onConfirm: value => {
      const name = value.trim();

      if (!name) return false;

      item.name = name;

      persist();
      showDetail(item.id);
      renderItems();

      showToast("Voorwerp aangepast!");
    }
  });
}

// -------------------------
// 18. VOORWERP VERWIJDEREN
// -------------------------

function deleteItem(id) {
  const item = getItem(id);

  if (!item) return;

  openModal({
    title: "Voorwerp verwijderen?",
    text: `Weet je zeker dat je ${item.name} wilt verwijderen?`,
    confirm: "Verwijderen",
    onConfirm: () => {
      const oldItems = [...items];

      items = items.filter(entry => entry.id !== item.id);

      if (!persist()) {
        items = oldItems;
        return;
      }

      showToast("Voorwerp verwijderd!");

      showView("items");
    }
  });
}

// -------------------------
// 19. UITLENEN
// -------------------------

function loanItem(id) {
  const item = getItem(id);

  if (!item || item.loanedTo) return;

  openModal({
    title: "Voorwerp uitlenen",
    text: "Aan wie leen je dit voorwerp uit?",
    label: "NAAM",
    onConfirm: value => {
      const name = value.trim();

      if (!name) return false;

      item.loanedTo = name;

      const today = new Date();

      item.loanDate = [
        String(today.getDate()).padStart(2, "0"),
        String(today.getMonth() + 1).padStart(2, "0"),
        today.getFullYear()
      ].join("-");

      persist();

      showDetail(item.id);
      renderItems();

      showToast("Voorwerp uitgeleend!");
    }
  });
}

// -------------------------
// 20. TERUGMELDEN
// -------------------------

function returnItem(id) {
  const item = getItem(id);

  if (!item) return;

  item.loanedTo = "";
  item.loanDate = "";

  persist();

  showDetail(item.id);
  renderItems();

  showToast("Voorwerp is terug!");
}

// -------------------------
// 21. OPSTARTEN
// -------------------------

function initializeApp() {
  setupModal();
  setupNavigation();

  if (document.getElementById("item-location")) {
    updateLocationSelect();
  }

  if (document.getElementById("items-list")) {
    renderItems();
  }

  if (document.getElementById("view-items")) {
    document.body.dataset.view = "items";
  }
}

initializeApp();
