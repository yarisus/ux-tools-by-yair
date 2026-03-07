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

const salaryInput = document.getElementById("salaryInput");
const toggleSalaryBtn = document.getElementById("toggleSalaryBtn");
const monthlySpendEl = document.getElementById("monthlySpend");
const availableBalanceEl = document.getElementById("availableBalance");
const weeklyBudgetEl = document.getElementById("weeklyBudget");
const dailyBudgetEl = document.getElementById("dailyBudget");
const expenseForm = document.getElementById("expenseForm");
const resetDataBtn = document.getElementById("resetDataBtn");
const expenseModal = document.getElementById("expenseModal");
const openExpenseModalBtn = document.getElementById("openExpenseModalBtn");
const closeExpenseModalBtn = document.getElementById("closeExpenseModalBtn");
const categoryFilter = document.getElementById("categoryFilter");
const statusFilter = document.getElementById("statusFilter");
const expenseTableBody = document.getElementById("expenseTableBody");
const tableRowTemplate = document.getElementById("tableRowTemplate");
const categoryDonut = document.getElementById("categoryDonut");
const donutLegend = document.getElementById("donutLegend");
const donutTotal = document.getElementById("donutTotal");
const installAppBtn = document.getElementById("installAppBtn");

salaryInput.value = state.salary;
applySalaryVisibility();

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

openExpenseModalBtn.addEventListener("click", () => {
  expenseModal.classList.add("show");
  expenseModal.setAttribute("aria-hidden", "false");
});

closeExpenseModalBtn.addEventListener("click", closeModal);

expenseModal.addEventListener("click", (event) => {
  const target = event.target;
  if (target.dataset.closeModal === "true") {
    closeModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && expenseModal.classList.contains("show")) {
    closeModal();
  }
});

expenseForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const category = document.getElementById("categoryInput").value;
  const name = document.getElementById("nameInput").value.trim();
  const amount = Number(document.getElementById("amountInput").value || 0);
  const status = document.getElementById("statusInput").value;

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
  document.getElementById("statusInput").value = "en-uso";

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
});

categoryFilter.addEventListener("change", () => {
  renderExpenseTable();
});

statusFilter.addEventListener("change", () => {
  renderExpenseTable();
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
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      // Keep app functional even if SW registration fails.
    });
  });
}

function createItemId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `item_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

function closeModal() {
  expenseModal.classList.remove("show");
  expenseModal.setAttribute("aria-hidden", "true");
}

function applySalaryVisibility() {
  salaryInput.type = state.hideSalary ? "password" : "number";
  toggleSalaryBtn.innerHTML = state.hideSalary ? '<i class="bi bi-eye-slash"></i>' : '<i class="bi bi-eye"></i>';
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { salary: 0, items: [], hideSalary: false };
  }

  try {
    const parsed = JSON.parse(raw);
    const items = Array.isArray(parsed.items)
      ? parsed.items
          .map((item) => ({
            id: String(item.id || createItemId()),
            name: String(item.name || "").trim(),
            amount: Number(item.amount || 0),
            category: CATEGORY_CONFIG[item.category] ? item.category : "variables",
            status: item.status === "libre" ? "libre" : "en-uso"
          }))
          .filter((item) => item.name)
      : [];

    return {
      salary: Number(parsed.salary || 0),
      items,
      hideSalary: Boolean(parsed.hideSalary)
    };
  } catch {
    return { salary: 0, items: [], hideSalary: false };
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
  const selectedStatus = statusFilter.value;

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
    cell.colSpan = 5;
    cell.className = "table-empty";
    cell.innerHTML = '<i class="bi bi-inbox"></i> No hay items para este filtro.';
    row.appendChild(cell);
    expenseTableBody.appendChild(row);
    return;
  }

  for (const item of filteredItems) {
    const row = tableRowTemplate.content.firstElementChild.cloneNode(true);
    const config = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.variables;

    row.querySelector(".item-name").textContent = item.name;

    const chip = row.querySelector(".category-chip");
    chip.textContent = config.label;
    chip.dataset.category = item.category;

    const infoBtn = row.querySelector(".info-btn");
    infoBtn.title = config.help;

    const statusPill = row.querySelector(".status-pill");
    statusPill.dataset.status = item.status;
    statusPill.innerHTML =
      item.status === "en-uso"
        ? '<i class="bi bi-check-circle-fill"></i> En uso'
        : '<i class="bi bi-pause-circle"></i> Libre';

    const amountInput = row.querySelector(".inline-amount");
    amountInput.value = Number(item.amount || 0);
    amountInput.addEventListener("change", () => {
      item.amount = Math.max(0, Number(amountInput.value || 0));
      saveState();
      render();
    });

    const statusBtn = row.querySelector(".status-btn");
    statusBtn.innerHTML =
      item.status === "en-uso"
        ? '<i class="bi bi-arrow-right-circle"></i> Pasar a Libre'
        : '<i class="bi bi-arrow-left-circle"></i> Pasar a En uso';
    statusBtn.addEventListener("click", () => {
      item.status = item.status === "en-uso" ? "libre" : "en-uso";
      saveState();
      render();
    });

    const deleteBtn = row.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", () => {
      state.items = state.items.filter((entry) => entry.id !== item.id);
      saveState();
      render();
    });

    expenseTableBody.appendChild(row);
  }
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

function render() {
  renderSummary();
  renderExpenseTable();
  renderDonut();
}

render();
