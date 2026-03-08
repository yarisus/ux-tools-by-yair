const STORAGE_KEY = "expense_webapp_state";

const CATEGORY_CONFIG = {
  fijos: {
    label: "Gastos fijos",
    help: "Pagos que suelen repetirse todos los meses (ej: alquiler, luz, internet).",
    color: "var(--cat-fijos)"
  },
  variables: {
    label: "Gastos variables",
    help: "Montos que cambian segun uso o habitos (ej: supermercado, salidas).",
    color: "var(--cat-variables)"
  },
  semifijos: {
    label: "Fijos variables",
    help: "Pagos recurrentes, pero no siempre iguales (ej: tarjeta o servicios con consumo).",
    color: "var(--cat-semifijos)"
  }
};

const CATEGORY_KEYS = Object.keys(CATEGORY_CONFIG);
const state = loadState();

let deferredInstallPrompt = null;
let toastTimer = null;
let activeFilterSheet = "";

const salaryInput = document.getElementById("salaryInput");
const toggleSalaryBtn = document.getElementById("toggleSalaryBtn");
const monthlySpendEl = document.getElementById("monthlySpend");
const availableBalanceEl = document.getElementById("availableBalance");
const weeklyBudgetEl = document.getElementById("weeklyBudget");
const dailyBudgetEl = document.getElementById("dailyBudget");
const expenseForm = document.getElementById("expenseForm");
const categoryInput = document.getElementById("categoryInput");
const nameInput = document.getElementById("nameInput");
const amountInput = document.getElementById("amountInput");
const statusInput = document.getElementById("statusInput");
const resetDataBtn = document.getElementById("resetDataBtn");
const expenseModal = document.getElementById("expenseModal");
const openExpenseModalBtn = document.getElementById("openExpenseModalBtn");
const closeExpenseModalBtn = document.getElementById("closeExpenseModalBtn");
const categoryFilter = document.getElementById("categoryFilter");
const statusFilter = document.getElementById("statusFilter");
const mobileCategoryFilterBtn = document.getElementById("mobileCategoryFilterBtn");
const mobileStatusFilterBtn = document.getElementById("mobileStatusFilterBtn");
const expenseTableBody = document.getElementById("expenseTableBody");
const tableRowTemplate = document.getElementById("tableRowTemplate");
const expenseMobileList = document.getElementById("expenseMobileList");
const mobileItemTemplate = document.getElementById("mobileItemTemplate");
const categoryDonut = document.getElementById("categoryDonut");
const donutLegend = document.getElementById("donutLegend");
const donutTotal = document.getElementById("donutTotal");
const installAppBtn = document.getElementById("installAppBtn");
const themeToggleBtn = document.getElementById("themeToggleBtn");
const downloadMenuBtn = document.getElementById("downloadMenuBtn");
const downloadMenu = document.getElementById("downloadMenu");
const exportCsvBtn = document.getElementById("exportCsvBtn");
const exportPdfBtn = document.getElementById("exportPdfBtn");
const filterSheet = document.getElementById("filterSheet");
const closeFilterSheetBtn = document.getElementById("closeFilterSheetBtn");
const filterSheetTitle = document.getElementById("filterSheetTitle");
const filterSheetOptions = document.getElementById("filterSheetOptions");
const toast = document.getElementById("toast");

let modalTrigger = null;
let sheetTrigger = null;

salaryInput.value = state.salary;
applySalaryVisibility();
applyTheme();
updateMobileFilterButtonLabels();
downloadMenuBtn.setAttribute("aria-expanded", "false");

salaryInput.addEventListener("input", () => {
  state.salary = Number(salaryInput.value || 0);
  saveState();
  render();
});

toggleSalaryBtn.addEventListener("click", () => {
  state.hideSalary = !state.hideSalary;
  saveState();
  applySalaryVisibility();
});

if (themeToggleBtn) {
  themeToggleBtn.addEventListener("click", () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    saveState();
    applyTheme();
  });
}

openExpenseModalBtn.addEventListener("click", () => {
  modalTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  expenseModal.classList.add("show");
  expenseModal.setAttribute("aria-hidden", "false");
  updateOverlayScrollLock();
  requestAnimationFrame(() => {
    nameInput.focus();
  });
});

closeExpenseModalBtn.addEventListener("click", closeModal);

expenseModal.addEventListener("click", (event) => {
  const target = event.target;
  if (target.dataset.closeModal === "true") {
    closeModal();
  }
});

expenseForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const category = categoryInput.value;
  const name = nameInput.value.trim();
  const amount = Number(amountInput.value || 0);
  const status = statusInput ? statusInput.value : "en-uso";

  if (!name || amount < 0 || !CATEGORY_CONFIG[category]) {
    return;
  }

  state.items.push({
    id: createItemId(),
    category,
    name,
    amount,
    status: status === "libre" ? "libre" : "en-uso"
  });

  expenseForm.reset();
  if (statusInput) {
    statusInput.value = "en-uso";
  }

  saveState();
  render();
  closeModal();
});

resetDataBtn.addEventListener("click", () => {
  const confirmReset = window.confirm("Seguro que quieres reiniciar todos los datos?");
  if (!confirmReset) {
    return;
  }

  state.salary = 0;
  state.items = [];
  salaryInput.value = 0;
  saveState();
  render();
  showToast("Datos reiniciados.");
});

categoryFilter.addEventListener("change", () => {
  renderByFilters();
});

if (statusFilter) {
  statusFilter.addEventListener("change", () => {
    renderByFilters();
  });
}

mobileCategoryFilterBtn.addEventListener("click", () => {
  openFilterSheet("category", mobileCategoryFilterBtn);
});

if (mobileStatusFilterBtn) {
  mobileStatusFilterBtn.addEventListener("click", () => {
    openFilterSheet("status", mobileStatusFilterBtn);
  });
}

closeFilterSheetBtn.addEventListener("click", closeFilterSheet);

filterSheet.addEventListener("click", (event) => {
  const target = event.target;
  if (target.dataset.closeSheet === "true") {
    closeFilterSheet();
  }
});

downloadMenuBtn.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleDownloadMenu();
});

downloadMenu.addEventListener("click", (event) => {
  event.stopPropagation();
});

filterSheetOptions.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  const optionBtn = target.closest("button[data-filter-type]");
  if (!optionBtn) {
    return;
  }

  const filterType = optionBtn.dataset.filterType;
  const filterValue = optionBtn.dataset.filterValue || "all";

  if (filterType === "category") {
    categoryFilter.value = filterValue;
  } else if (filterType === "status" && statusFilter) {
    statusFilter.value = filterValue;
  }

  renderByFilters();
  closeFilterSheet();
});

document.addEventListener("click", () => {
  hideDownloadMenu();
});

exportCsvBtn.addEventListener("click", () => {
  hideDownloadMenu();
  exportCsv();
});

exportPdfBtn.addEventListener("click", () => {
  hideDownloadMenu();
  exportPdf();
});

if (installAppBtn) {
  installAppBtn.addEventListener("click", async () => {
    if (!deferredInstallPrompt) {
      return;
    }

    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    installAppBtn.classList.add("is-hidden");
  });
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  if (installAppBtn) {
    installAppBtn.classList.remove("is-hidden");
  }
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  if (installAppBtn) {
    installAppBtn.classList.add("is-hidden");
  }
});

if ("serviceWorker" in navigator && window.location.protocol !== "file:") {
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("./sw.js");

      if (registration.waiting) {
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
      }

      registration.addEventListener("updatefound", () => {
        const nextWorker = registration.installing;
        if (!nextWorker) {
          return;
        }

        nextWorker.addEventListener("statechange", () => {
          if (nextWorker.state === "installed" && navigator.serviceWorker.controller) {
            nextWorker.postMessage({ type: "SKIP_WAITING" });
          }
        });
      });

      navigator.serviceWorker.addEventListener("controllerchange", () => {
        window.location.reload();
      });

      registration.update().catch(() => {
        // Ignore update check failures.
      });
    } catch {
      // Keep app functional even if SW registration fails.
    }
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }

  closeModal();
  closeFilterSheet();
  hideDownloadMenu();
});

function createItemId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `item_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

function closeModal() {
  const wasOpen = expenseModal.classList.contains("show");
  expenseModal.classList.remove("show");
  expenseModal.setAttribute("aria-hidden", "true");
  updateOverlayScrollLock();

  if (wasOpen && modalTrigger) {
    modalTrigger.focus();
  }

  modalTrigger = null;
}

function applySalaryVisibility() {
  salaryInput.type = state.hideSalary ? "password" : "number";
  toggleSalaryBtn.innerHTML = state.hideSalary ? '<i class="bi bi-eye-slash"></i>' : '<i class="bi bi-eye"></i>';
}

function applyTheme() {
  const isDark = state.theme === "dark";
  document.body.classList.toggle("theme-dark", isDark);

  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta) {
    themeMeta.setAttribute("content", isDark ? "#0b1220" : "#16697a");
  }

  if (themeToggleBtn) {
    themeToggleBtn.setAttribute("aria-pressed", String(isDark));
    themeToggleBtn.innerHTML = isDark
      ? '<i class="bi bi-sun"></i><span class="hidden sm:inline">Modo claro</span>'
      : '<i class="bi bi-moon-stars"></i><span class="hidden sm:inline">Modo oscuro</span>';
  }
}

function hideDownloadMenu() {
  downloadMenu.classList.add("is-hidden");
  downloadMenuBtn.setAttribute("aria-expanded", "false");
}

function toggleDownloadMenu() {
  const willOpen = downloadMenu.classList.contains("is-hidden");
  downloadMenu.classList.toggle("is-hidden");
  downloadMenuBtn.setAttribute("aria-expanded", String(willOpen));
}

function closeFilterSheet() {
  const wasOpen = filterSheet.classList.contains("show");
  filterSheet.classList.remove("show");
  filterSheet.setAttribute("aria-hidden", "true");
  activeFilterSheet = "";
  updateOverlayScrollLock();

  if (wasOpen && sheetTrigger) {
    sheetTrigger.focus();
  }

  sheetTrigger = null;
}

function openFilterSheet(type, trigger = null) {
  sheetTrigger = trigger;
  activeFilterSheet = type;
  renderFilterSheet();
  hideDownloadMenu();
  filterSheet.classList.add("show");
  filterSheet.setAttribute("aria-hidden", "false");
  updateOverlayScrollLock();

  requestAnimationFrame(() => {
    const selected = filterSheetOptions.querySelector(".sheet-option-btn.active");
    const first = filterSheetOptions.querySelector(".sheet-option-btn");
    const target = selected || first;

    if (target instanceof HTMLElement) {
      target.focus();
    }
  });
}

function renderFilterSheet() {
  if (activeFilterSheet === "category") {
    filterSheetTitle.textContent = "Filtrar por categoria";

    const options = [
      { value: "all", label: "Todas" },
      { value: "fijos", label: CATEGORY_CONFIG.fijos.label },
      { value: "variables", label: CATEGORY_CONFIG.variables.label },
      { value: "semifijos", label: CATEGORY_CONFIG.semifijos.label }
    ];

    renderSheetOptions("category", options, categoryFilter.value);
    return;
  }

  if (!statusFilter) {
    filterSheetTitle.textContent = "Filtrar por categoria";
    renderSheetOptions(
      "category",
      [
        { value: "all", label: "Todas" },
        { value: "fijos", label: CATEGORY_CONFIG.fijos.label },
        { value: "variables", label: CATEGORY_CONFIG.variables.label },
        { value: "semifijos", label: CATEGORY_CONFIG.semifijos.label }
      ],
      categoryFilter.value
    );
    return;
  }

  filterSheetTitle.textContent = "Filtrar por estado";
  const options = [
    { value: "all", label: "Todos" },
    { value: "en-uso", label: "En uso" },
    { value: "libre", label: "Libre" }
  ];
  renderSheetOptions("status", options, statusFilter.value);
}

function renderSheetOptions(type, options, selectedValue) {
  filterSheetOptions.innerHTML = "";

  for (const option of options) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "sheet-option-btn";
    button.dataset.filterType = type;
    button.dataset.filterValue = option.value;
    button.textContent = option.label;

    if (option.value === selectedValue) {
      button.classList.add("active");
    }

    filterSheetOptions.appendChild(button);
  }
}

function updateOverlayScrollLock() {
  const hasOpenOverlay = expenseModal.classList.contains("show") || filterSheet.classList.contains("show");
  document.body.classList.toggle("overflow-hidden", hasOpenOverlay);
}

function sanitizeItem(item) {
  const name = String(item?.name || "").trim();
  if (!name) {
    return null;
  }

  const category = CATEGORY_CONFIG[item?.category] ? item.category : "variables";
  const amount = Number.isFinite(Number(item?.amount)) ? Math.max(0, Number(item.amount)) : 0;
  const status = item?.status === "libre" ? "libre" : "en-uso";

  return {
    id: String(item?.id || createItemId()),
    name,
    category,
    amount,
    status
  };
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { salary: 0, items: [], hideSalary: false, theme: "light" };
  }

  try {
    const parsed = JSON.parse(raw);
    const items = Array.isArray(parsed.items) ? parsed.items.map(sanitizeItem).filter(Boolean) : [];

    return {
      salary: Number(parsed.salary || 0),
      items,
      hideSalary: Boolean(parsed.hideSalary),
      theme: parsed.theme === "dark" ? "dark" : "light"
    };
  } catch {
    return { salary: 0, items: [], hideSalary: false, theme: "light" };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function money(value) {
  const num = Number(value || 0);
  const abs = Math.abs(num);
  const formatted = new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(abs);

  return num < 0 ? `-$ ${formatted}` : `$ ${formatted}`;
}

function getTotals() {
  const byCategory = {
    fijos: { total: 0, usedAmount: 0, used: 0, free: 0 },
    variables: { total: 0, usedAmount: 0, used: 0, free: 0 },
    semifijos: { total: 0, usedAmount: 0, used: 0, free: 0 }
  };

  let monthlySpend = 0;

  for (const item of state.items) {
    const target = byCategory[item.category];
    if (!target) {
      continue;
    }

    const amount = Number(item.amount || 0);
    target.total += amount;

    if (item.status === "en-uso") {
      target.used += 1;
      target.usedAmount += amount;
      monthlySpend += amount;
    } else {
      target.free += 1;
    }
  }

  return { byCategory, monthlySpend };
}

function getRemainingDaysInMonth() {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const remaining = end.getDate() - now.getDate() + 1;
  return Math.max(1, remaining);
}

function renderSummary() {
  const { monthlySpend } = getTotals();
  const available = state.salary - monthlySpend;
  const remainingDays = getRemainingDaysInMonth();
  const daily = available / remainingDays;
  const weekly = daily * 7;

  monthlySpendEl.textContent = money(monthlySpend);
  availableBalanceEl.textContent = money(available);
  availableBalanceEl.style.color = available >= 0 ? "var(--ok)" : "var(--bad)";

  weeklyBudgetEl.textContent = money(weekly);
  weeklyBudgetEl.style.color = weekly >= 0 ? "var(--ok)" : "var(--bad)";

  dailyBudgetEl.textContent = money(daily);
  dailyBudgetEl.style.color = daily >= 0 ? "var(--ok)" : "var(--bad)";
}

function getFilteredItems() {
  const selectedCategory = categoryFilter.value;
  const selectedStatus = statusFilter ? statusFilter.value : "all";

  return state.items
    .filter((item) => {
      const passCategory = selectedCategory === "all" || item.category === selectedCategory;
      const passStatus = selectedStatus === "all" || item.status === selectedStatus;
      return passCategory && passStatus;
    })
    .sort((a, b) => {
      const byCategory = a.category.localeCompare(b.category);
      if (byCategory !== 0) {
        return byCategory;
      }

      return a.name.localeCompare(b.name);
    });
}

function renderExpenseTable() {
  const filteredItems = getFilteredItems();
  expenseTableBody.innerHTML = "";

  if (!filteredItems.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 3;
    cell.className = "table-empty";
    cell.innerHTML = '<i class="bi bi-inbox"></i> No hay items para este filtro.';
    row.appendChild(cell);
    expenseTableBody.appendChild(row);
    return;
  }

  for (const item of filteredItems) {
    const row = tableRowTemplate.content.firstElementChild.cloneNode(true);
    populateItemNode(row, item);
    expenseTableBody.appendChild(row);
  }
}

function renderExpenseMobileList() {
  const filteredItems = getFilteredItems();
  expenseMobileList.innerHTML = "";

  if (!filteredItems.length) {
    const empty = document.createElement("article");
    empty.className = "mobile-expense-card";
    empty.innerHTML = '<p class="table-empty"><i class="bi bi-inbox"></i> No hay items para este filtro.</p>';
    expenseMobileList.appendChild(empty);
    return;
  }

  for (const item of filteredItems) {
    const card = mobileItemTemplate.content.firstElementChild.cloneNode(true);
    populateItemNode(card, item);
    expenseMobileList.appendChild(card);
  }
}

function populateItemNode(node, item) {
  const config = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.variables;

  const nameNode = node.querySelector(".item-name") || node.querySelector(".mobile-item-name");
  if (nameNode) {
    nameNode.textContent = item.name;
  }

  const chip = node.querySelector(".category-chip");
  if (chip) {
    chip.textContent = config.label;
    chip.dataset.category = item.category;
  }

  const amountText = node.querySelector(".amount-text");
  const amountDisplayWrap = node.querySelector(".amount-display-wrap");
  const amountEditWrap = node.querySelector(".amount-edit-wrap");
  const amountInput = node.querySelector(".inline-amount");
  const editAmountBtn = node.querySelector(".edit-amount-btn");

  if (!amountText || !amountDisplayWrap || !amountEditWrap || !amountInput || !editAmountBtn) {
    return;
  }

  const currentAmount = Number(item.amount || 0);
  amountText.textContent = money(currentAmount);
  amountInput.value = currentAmount;

  let editClosed = true;

  const closeEditor = (saveChanges) => {
    if (editClosed) {
      return;
    }

    editClosed = true;

    if (saveChanges) {
      const nextAmount = Math.max(0, Number(amountInput.value || 0));
      if (nextAmount !== Number(item.amount || 0)) {
        item.amount = nextAmount;
        saveState();
        render();
        return;
      }
    }

    amountInput.value = Number(item.amount || 0);
    amountText.textContent = money(item.amount);
    amountEditWrap.classList.add("is-hidden");
    amountDisplayWrap.classList.remove("is-hidden");
  };

  editAmountBtn.addEventListener("click", () => {
    editClosed = false;
    amountDisplayWrap.classList.add("is-hidden");
    amountEditWrap.classList.remove("is-hidden");

    requestAnimationFrame(() => {
      amountInput.focus();
      amountInput.select();
    });
  });

  amountInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      closeEditor(true);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeEditor(false);
    }
  });

  amountInput.addEventListener("blur", () => {
    closeEditor(true);
  });
}

function renderDonut() {
  const { byCategory } = getTotals();

  const series = CATEGORY_KEYS.map((key) => ({
    key,
    label: CATEGORY_CONFIG[key].label,
    help: CATEGORY_CONFIG[key].help,
    color: CATEGORY_CONFIG[key].color,
    amount: byCategory[key].usedAmount
  }));

  const total = series.reduce((sum, item) => sum + item.amount, 0);
  donutTotal.textContent = money(total);

  if (total <= 0) {
    categoryDonut.style.background = "conic-gradient(#e3ece7 0deg 360deg)";
  } else {
    let cursor = 0;
    const slices = [];

    for (const item of series) {
      const degrees = (item.amount / total) * 360;
      const next = cursor + degrees;
      slices.push(`${item.color} ${cursor.toFixed(2)}deg ${next.toFixed(2)}deg`);
      cursor = next;
    }

    categoryDonut.style.background = `conic-gradient(${slices.join(",")})`;
  }

  donutLegend.innerHTML = "";

  for (const item of series) {
    const li = document.createElement("li");

    const left = document.createElement("div");
    left.className = "legend-left";

    const dot = document.createElement("span");
    dot.className = "legend-dot";
    dot.style.background = item.color;

    const label = document.createElement("span");
    label.textContent = item.label;

    const infoBtn = document.createElement("button");
    infoBtn.className = "info-btn";
    infoBtn.type = "button";
    infoBtn.title = item.help;
    infoBtn.innerHTML = '<i class="bi bi-exclamation-circle-fill"></i>';

    left.appendChild(dot);
    left.appendChild(label);
    left.appendChild(infoBtn);

    const amount = document.createElement("strong");
    amount.className = "legend-amount";

    const ratio = total > 0 ? Math.round((item.amount / total) * 100) : 0;
    amount.textContent = `${money(item.amount)} (${ratio}%)`;

    li.appendChild(left);
    li.appendChild(amount);
    donutLegend.appendChild(li);
  }
}

function getCategoryFilterLabel() {
  const value = categoryFilter.value;
  if (value === "fijos") {
    return CATEGORY_CONFIG.fijos.label;
  }
  if (value === "variables") {
    return CATEGORY_CONFIG.variables.label;
  }
  if (value === "semifijos") {
    return CATEGORY_CONFIG.semifijos.label;
  }
  return "Todas";
}

function getStatusFilterLabel() {
  if (!statusFilter) {
    return "Todos";
  }

  const value = statusFilter.value;
  if (value === "en-uso") {
    return "En uso";
  }
  if (value === "libre") {
    return "Libre";
  }
  return "Todos";
}

function updateMobileFilterButtonLabels() {
  mobileCategoryFilterBtn.innerHTML = `<i class="bi bi-funnel"></i> Categoria: ${getCategoryFilterLabel()}`;
  if (mobileStatusFilterBtn) {
    mobileStatusFilterBtn.innerHTML = `<i class="bi bi-sliders2"></i> Estado: ${getStatusFilterLabel()}`;
  }
}

function renderByFilters() {
  updateMobileFilterButtonLabels();
  renderExpenseTable();
  renderExpenseMobileList();
}

function dateStamp() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function csvEscape(value) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function exportCsv() {
  const rows = getFilteredItems();
  const lines = [];
  lines.push(["item", "categoria", "estado", "monto"].map(csvEscape).join(","));

  for (const item of rows) {
    lines.push(
      [
        csvEscape(item.name),
        csvEscape((CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.variables).label),
        csvEscape(item.status === "en-uso" ? "En uso" : "Libre"),
        csvEscape(String(Number(item.amount || 0)))
      ].join(",")
    );
  }

  const csv = `\ufeff${lines.join("\r\n")}`;
  downloadBlob(csv, `mis-gastos-${dateStamp()}.csv`, "text/csv;charset=utf-8");
  showToast("CSV exportado.");
}

function cutText(text, max) {
  const str = String(text || "");
  if (str.length <= max) {
    return str;
  }

  return `${str.slice(0, Math.max(0, max - 3))}...`;
}

function exportPdf() {
  const jsPdf = window.jspdf && window.jspdf.jsPDF;
  if (!jsPdf) {
    showToast("No se pudo cargar el motor PDF.", true);
    return;
  }

  const doc = new jsPdf({ unit: "pt", format: "a4" });
  const rows = getFilteredItems();
  const { monthlySpend } = getTotals();
  const available = Number(state.salary || 0) - monthlySpend;

  let y = 42;
  const left = 40;

  const drawHeader = () => {
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Reporte de gastos", left, y);

    y += 20;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Fecha: ${new Date().toLocaleString("es-AR")}`, left, y);

    y += 16;
    doc.text(`Sueldo mensual: ${money(state.salary)}`, left, y);
    y += 14;
    doc.text(`Gasto mensual en uso: ${money(monthlySpend)}`, left, y);
    y += 14;
    doc.text(`Saldo disponible: ${money(available)}`, left, y);

    y += 20;
    doc.setFont("helvetica", "bold");
    doc.text("Item", 40, y);
    doc.text("Categoria", 235, y);
    doc.text("Estado", 360, y);
    doc.text("Monto", 540, y, { align: "right" });

    y += 8;
    doc.line(40, y, 555, y);
    y += 14;
  };

  drawHeader();

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  if (!rows.length) {
    doc.text("No hay items para el filtro actual.", left, y);
  }

  for (const item of rows) {
    if (y > 780) {
      doc.addPage();
      y = 42;
      drawHeader();
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
    }

    const categoryLabel = (CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.variables).label;

    doc.text(cutText(item.name, 34), 40, y);
    doc.text(cutText(categoryLabel, 20), 235, y);
    doc.text(item.status === "en-uso" ? "En uso" : "Libre", 360, y);
    doc.text(money(item.amount), 540, y, { align: "right" });

    y += 14;
  }

  doc.save(`mis-gastos-${dateStamp()}.pdf`);
  showToast("PDF exportado.");
}

function showToast(message, isError = false) {
  if (!toast) {
    return;
  }

  toast.textContent = message;
  toast.classList.remove("error", "show");

  if (isError) {
    toast.classList.add("error");
  }

  if (toastTimer) {
    clearTimeout(toastTimer);
  }

  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  toastTimer = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

function render() {
  renderSummary();
  renderByFilters();
  renderDonut();
}

render();
