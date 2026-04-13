const STORAGE_KEY = "expense_webapp_state";
const CLOUD_CONFIG_KEY = "expense_webapp_cloud_config";
const APP_VARIANT_HINT = String(globalThis.__DINARIA_APP_VARIANT__ || "").trim().toLowerCase();
const APP_VARIANT_HOST_IS_QA = /(^|[-.])qa([-.]|$)/i.test(globalThis.location?.hostname || "");
const APP_VARIANT = APP_VARIANT_HINT === "qa" || APP_VARIANT_HOST_IS_QA || /(?:^|\/)qa\.html$/i.test(globalThis.location?.pathname || "") ? "qa" : "production";
const IS_QA_APP = APP_VARIANT === "qa";
const STATE_STORAGE_KEY = IS_QA_APP ? `${STORAGE_KEY}_qa` : STORAGE_KEY;
const LOCAL_UI_STORAGE_KEY = IS_QA_APP ? `${STORAGE_KEY}_ui_qa` : `${STORAGE_KEY}_ui`;
const ACTIVE_CLOUD_CONFIG_KEY = IS_QA_APP ? `${CLOUD_CONFIG_KEY}_qa` : CLOUD_CONFIG_KEY;
const CLOUD_TABLE_NAME = "user_app_states";
const FEEDBACK_TABLE_NAME = "feedback_entries";
const CLOUD_SYNC_DEBOUNCE_MS = 700;
const CLOUD_PULL_INTERVAL_MS = 8000;
const CLOUD_OP_TIMEOUT_MS = 12000;
const APP_RUNTIME_ORIGIN = /^https?:\/\//i.test(String(globalThis.location?.origin || ""))
  ? String(globalThis.location.origin)
  : "https://dinariafinanzas.vercel.app";
const APP_PUBLIC_URL = IS_QA_APP
  ? /(?:^|\/)qa\.html$/i.test(globalThis.location?.pathname || "")
    ? `${APP_RUNTIME_ORIGIN}/qa.html`
    : `${APP_RUNTIME_ORIGIN}/`
  : `${APP_RUNTIME_ORIGIN}/`;
const APP_VERSION = "20260403-03";
const APP_DISPLAY_NAME = IS_QA_APP ? "Dinaria Finanzas QA" : "Dinaria Finanzas";
const ENABLE_LOCAL_MOBILE_DESIGN_SYSTEM =
  /^(localhost|127\.0\.0\.1)$/i.test(globalThis.location?.hostname || "")
  || globalThis.location?.protocol === "file:";

const EXPENSE_CATEGORY_CONFIG = {
  vivienda: {
    label: "Vivienda",
    help: "Alquiler, expensas y mantenimiento del hogar.",
    color: "#4F46E5"
  },
  servicios: {
    label: "Servicios del hogar",
    help: "Luz, agua, gas, internet, celular y servicios similares.",
    color: "#3B82F6"
  },
  alimentacion: {
    label: "Alimentacion",
    help: "Supermercado, verduleria, comida diaria y salidas para comer.",
    color: "#F59E0B"
  },
  transporte: {
    label: "Transporte",
    help: "Combustible, transporte publico, peajes y estacionamiento.",
    color: "#8B5CF6"
  },
  salud: {
    label: "Salud",
    help: "Farmacia, consultas medicas, obra social y bienestar.",
    color: "#06B6D4"
  },
  finanzas: {
    label: "Finanzas",
    help: "Tarjetas, comisiones, prestamos e intereses.",
    color: "#7C3AED"
  },
  educacion: {
    label: "Educacion",
    help: "Cursos, colegio, universidad, libros y materiales.",
    color: "#2563EB"
  },
  compras: {
    label: "Compras personales",
    help: "Ropa, cuidado personal y compras no alimentarias.",
    color: "#EC4899"
  },
  ocio: {
    label: "Ocio y entretenimiento",
    help: "Streaming, salidas, hobbies y entretenimiento.",
    color: "#F97316"
  },
  ahorro: {
    label: "Ahorro e inversion",
    help: "Aportes a ahorro, inversiones y metas financieras.",
    color: "#0EA5E9"
  },
  impuestos: {
    label: "Impuestos y seguros",
    help: "Impuestos, tasas, seguros y obligaciones similares.",
    color: "#A855F7"
  },
  otros: {
    label: "Otros",
    help: "Gastos que no encajan en otra categoria.",
    color: "#64748B"
  }
};

const INCOME_CATEGORY_CONFIG = {
  sueldo: {
    label: "Sueldo y haberes",
    help: "Sueldos, jornales, honorarios fijos y haberes mensuales.",
    color: "#2563EB"
  },
  freelance: {
    label: "Freelance / negocio",
    help: "Trabajos independientes, servicios, emprendimientos y ventas de negocio.",
    color: "#8B5CF6"
  },
  ventas: {
    label: "Ventas ocasionales",
    help: "Ventas puntuales de productos, usados o ingresos por marketplace.",
    color: "#F59E0B"
  },
  bonos: {
    label: "Bonos y comisiones",
    help: "Bonos, comisiones, premios y extras variables.",
    color: "#A855F7"
  },
  inversiones: {
    label: "Intereses e inversiones",
    help: "Rendimientos, intereses, dividendos y ganancias de inversiones.",
    color: "#06B6D4"
  },
  reintegros: {
    label: "Reintegros y devoluciones",
    help: "Cashback, devoluciones, reintegros y reembolsos.",
    color: "#F97316"
  },
  regalos: {
    label: "Regalos y transferencias",
    help: "Regalos, ayuda familiar, transferencias recibidas y aportes de terceros.",
    color: "#EC4899"
  },
  otros_ingresos: {
    label: "Otros ingresos",
    help: "Ingresos que no encajan en otra categoria.",
    color: "#64748B"
  }
};

const CATEGORY_CONFIG = {
  ...EXPENSE_CATEGORY_CONFIG,
  ...INCOME_CATEGORY_CONFIG
};
const EXPENSE_CATEGORY_KEYS = Object.keys(EXPENSE_CATEGORY_CONFIG);
const INCOME_CATEGORY_KEYS = Object.keys(INCOME_CATEGORY_CONFIG);
const CATEGORY_KEYS = Object.keys(CATEGORY_CONFIG);
const DEFAULT_EXPENSE_CATEGORY_KEY = "vivienda";
const DEFAULT_INCOME_CATEGORY_KEY = "sueldo";
const DEFAULT_CATEGORY_KEY = DEFAULT_EXPENSE_CATEGORY_KEY;
const FALLBACK_CATEGORY_KEY = "otros";
const FALLBACK_INCOME_CATEGORY_KEY = "otros_ingresos";
const LEGACY_CATEGORY_MAP = {
  fijos: "vivienda",
  variables: "alimentacion",
  semifijos: "finanzas"
};
const ONBOARDING_STEPS = 3;
const ONBOARDING_SWIPE_THRESHOLD = 36;
const ONBOARDING_SWIPE_VERTICAL_TOLERANCE = 36;
const ONBOARDING_TRANSITION_MS = 260;
const state = loadState();
const cloudConfig = loadCloudConfig();
let localUiState = loadLocalUiState();
const systemThemeMedia = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
const mobileViewportMedia = window.matchMedia ? window.matchMedia("(max-width: 767px)") : null;

let deferredInstallPrompt = null;
let toastTimer = null;
let activeFilterSheet = "";
let pendingCloudSyncTimer = null;
let cloudPushInFlight = false;
let lastCloudSignature = "";
let supabaseClient = null;
let authStateSubscription = null;
let authUser = null;
let authModalTrigger = null;
let cloudStatusText = "Sin sincronizacion";
let cloudStatusMode = "local";
let cloudPullIntervalId = null;
let cloudPullInFlight = false;
let cloudRealtimeChannel = null;
let hasSeenAuthStateEvent = false;
let pendingDeleteItemId = null;
let pendingDeleteKind = "item";
let feedbackClient = null;
let feedbackModalTrigger = null;
let feedbackSubmitting = false;
let monthModelOpen = false;
let pendingDeleteProjection = null;
let pendingDeleteRecurringContext = null;

const salaryInput = document.getElementById("salaryInput");
const toggleSalaryBtn = document.getElementById("toggleSalaryBtn");
const monthlyIncomeEl = document.getElementById("monthlyIncome");
const monthlySpendEl = document.getElementById("monthlySpend");
const availableBalanceEl = document.getElementById("availableBalance");
const weeklyBudgetEl = document.getElementById("weeklyBudget");
const dailyBudgetEl = document.getElementById("dailyBudget");
const budgetPeriodSelect = document.getElementById("budgetPeriodSelect");
const budgetPeriodBtn = document.getElementById("budgetPeriodBtn");
const budgetPeriodLabel = document.getElementById("budgetPeriodLabel");
const budgetPeriodMenu = document.getElementById("budgetPeriodMenu");
const expenseForm = document.getElementById("expenseForm");
const typeInput = document.getElementById("typeInput");
const dateInput = document.getElementById("dateInput");
const categoryInput = document.getElementById("categoryInput");
const nameInput = document.getElementById("nameInput");
const amountInput = document.getElementById("amountInput");
const recurringInput = document.getElementById("recurringInput");
const recurringMonthsWrap = document.getElementById("recurringMonthsWrap");
const recurringMonthsInput = document.getElementById("recurringMonthsInput");
const expenseEditScopeWrap = document.getElementById("expenseEditScopeWrap");
const expenseEditScopeThisMonthBtn = document.getElementById("expenseEditScopeThisMonthBtn");
const expenseEditScopeAllMonthsBtn = document.getElementById("expenseEditScopeAllMonthsBtn");
const expenseModal = document.getElementById("expenseModal");
const modalTitle = document.getElementById("modalTitle");
const expenseSubmitBtn = document.getElementById("expenseSubmitBtn");
const openExpenseModalBtn = document.getElementById("openExpenseModalBtn");
const closeExpenseModalBtn = document.getElementById("closeExpenseModalBtn");
const salaryModal = document.getElementById("salaryModal");
const closeSalaryModalBtn = document.getElementById("closeSalaryModalBtn");
const cancelSalaryModalBtn = document.getElementById("cancelSalaryModalBtn");
const saveSalaryModalBtn = document.getElementById("saveSalaryModalBtn");
const salaryModalInput = document.getElementById("salaryModalInput");
const categoryFilter = document.getElementById("categoryFilter");
const dateFilter = document.getElementById("dateFilter");
const statusFilter = document.getElementById("statusFilter");
const mobileCategoryFilterBtn = document.getElementById("mobileCategoryFilterBtn");
const mobileDateFilterBtn = document.getElementById("mobileDateFilterBtn");
const mobileStatusFilterBtn = document.getElementById("mobileStatusFilterBtn");
const movementsFilterStatus = document.getElementById("movementsFilterStatus");
const movementsFilterSummary = document.getElementById("movementsFilterSummary");
const movementsActiveFilters = document.getElementById("movementsActiveFilters");
const movementsFilterIndicator = document.getElementById("movementsFilterIndicator");
const clearMovementFiltersBtn = document.getElementById("clearMovementFiltersBtn");
const categoryFilterMenu = document.getElementById("categoryFilterMenu");
const dateFilterMenu = document.getElementById("dateFilterMenu");
const addMovementMenu = document.getElementById("addMovementMenu");
const expenseTableBody = document.getElementById("expenseTableBody");
const tableRowTemplate = document.getElementById("tableRowTemplate");
const expenseMobileList = document.getElementById("expenseMobileList");
const mobileItemTemplate = document.getElementById("mobileItemTemplate");
const categoryDonut = document.getElementById("categoryDonut");
const donutLegend = document.getElementById("donutLegend");
const donutTotal = document.getElementById("donutTotal");
const donutSvg = document.getElementById("donutSvg");
const donutHoverTooltip = document.getElementById("donutHoverTooltip");
const installAppBtn = document.getElementById("installAppBtn");
const themeToggleBtn = document.getElementById("themeToggleBtn");
const downloadMenuBtn = document.getElementById("downloadMenuBtn");
const downloadMenu = document.getElementById("downloadMenu");
const exportCsvBtn = document.getElementById("exportCsvBtn");
const exportPdfBtn = document.getElementById("exportPdfBtn");
const resetAllDataBtn = document.getElementById("resetAllDataBtn");
const profileFeedbackBtn = document.getElementById("profileFeedbackBtn");
const profileExportCsvBtn = document.getElementById("profileExportCsvBtn");
const profileExportPdfBtn = document.getElementById("profileExportPdfBtn");
const profileResetBtn = document.getElementById("profileResetBtn");
const filterSheet = document.getElementById("filterSheet");
const closeFilterSheetBtn = document.getElementById("closeFilterSheetBtn");
const filterSheetTitle = document.getElementById("filterSheetTitle");
const filterSheetOptions = document.getElementById("filterSheetOptions");
const openOnboardingBtn = document.getElementById("openOnboardingBtn");
const helpOnboardingBtn = document.getElementById("helpOnboardingBtn");
const openFeedbackModalBtn = document.getElementById("openFeedbackModalBtn");
const onboardingModal = document.getElementById("onboardingModal");
const closeOnboardingBtn = document.getElementById("closeOnboardingBtn");
const onboardingPrevBtn = document.getElementById("onboardingPrevBtn");
const onboardingNextBtn = document.getElementById("onboardingNextBtn");
const onboardingDoneBtn = document.getElementById("onboardingDoneBtn");
const onboardingSkipBtn = document.getElementById("onboardingSkipBtn");
const onboardingViewport = onboardingModal?.querySelector(".onboarding-viewport") || null;
const onboardingGestureSurface = onboardingModal?.querySelector(".onboarding-card") || onboardingViewport;
const onboardingStepDots = Array.from(document.querySelectorAll("[data-step-jump]"));
const onboardingStepCards = Array.from(document.querySelectorAll(".onboarding-step"));
const toast = document.getElementById("toast");
const authStatusPill = document.getElementById("authStatusPill");
const authStatusText = document.getElementById("authStatusText");
const authSyncText = document.getElementById("authSyncText");
const openAuthModalBtn = document.getElementById("openAuthModalBtn");
const profileDropdown = document.getElementById("profileDropdown");
const logoutBtn = document.getElementById("logoutBtn");
const authModal = document.getElementById("authModal");
const closeAuthModalBtn = document.getElementById("closeAuthModalBtn");
const cloudConfigSection = document.getElementById("cloudConfigSection");
const supabaseUrlInput = document.getElementById("supabaseUrlInput");
const supabaseAnonKeyInput = document.getElementById("supabaseAnonKeyInput");
const saveCloudConfigBtn = document.getElementById("saveCloudConfigBtn");
const clearCloudConfigBtn = document.getElementById("clearCloudConfigBtn");
const signInGoogleBtn = document.getElementById("signInGoogleBtn");
const authHelpText = document.getElementById("authHelpText");
const authLoggedBox = document.getElementById("authLoggedBox");
const authLoggedText = document.getElementById("authLoggedText");
const authAvatarImg = document.getElementById("authAvatarImg");
const authDisplayName = document.getElementById("authDisplayName");
const syncNowBtn = document.getElementById("syncNowBtn");
const logoutModalBtn = document.getElementById("logoutModalBtn");
const deleteConfirmModal = document.getElementById("deleteConfirmModal");
const deleteConfirmText = document.getElementById("deleteConfirmText");
const closeDeleteConfirmBtn = document.getElementById("closeDeleteConfirmBtn");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const confirmDeleteSeriesBtn = document.getElementById("confirmDeleteSeriesBtn");
const deleteConfirmTitle = document.getElementById("deleteConfirmTitle");
const feedbackModal = document.getElementById("feedbackModal");
const closeFeedbackModalBtn = document.getElementById("closeFeedbackModalBtn");
const feedbackForm = document.getElementById("feedbackForm");
const feedbackKindInput = document.getElementById("feedbackKindInput");
const feedbackRatingInput = document.getElementById("feedbackRatingInput");
const feedbackEmailInput = document.getElementById("feedbackEmailInput");
const feedbackMessageInput = document.getElementById("feedbackMessageInput");
const feedbackSubmitBtn = document.getElementById("feedbackSubmitBtn");
const appSidebar = document.getElementById("appSidebar");
const sidebarToggleBtn = document.getElementById("sidebarToggleBtn");
const heroGreeting = document.getElementById("heroGreeting");
const heroSubtitle = document.getElementById("heroSubtitle");
const activeMonthSection = document.getElementById("activeMonthSection");
const activeMonthEyebrow = document.getElementById("activeMonthEyebrow");
const activeMonthLabel = document.getElementById("activeMonthLabel");
const activeMonthMeta = document.getElementById("activeMonthMeta");
const activeMonthCopy = document.querySelector(".hero .month-context-copy");
const prevMonthBtn = document.getElementById("prevMonthBtn");
const nextMonthBtn = document.getElementById("nextMonthBtn");
const jumpCurrentMonthBtn = document.getElementById("jumpCurrentMonthBtn");
const viewMonthModelBtn = document.getElementById("viewMonthModelBtn");
const closeMonthModelBtn = document.getElementById("closeMonthModelBtn");
const monthModelSection = document.getElementById("monthModelSection");
const metricsGrid = document.getElementById("metricsGrid");
const workspaceGrid = document.getElementById("workspaceGrid");
const mobileHomeExperience = document.querySelector(".mobile-home-experience");
const chartModeExpenseBtn = document.getElementById("chartModeExpenseBtn");
const chartModeIncomeBtn = document.getElementById("chartModeIncomeBtn");
const mobilePrevMonthBtn = document.getElementById("mobilePrevMonthBtn");
const mobileNextMonthBtn = document.getElementById("mobileNextMonthBtn");
const mobileMonthShortcut = document.getElementById("mobileMonthShortcut");
const mobileActiveMonthEyebrow = document.getElementById("mobileActiveMonthEyebrow");
const mobileActiveMonthLabel = document.getElementById("mobileActiveMonthLabel");
const mobileActiveMonthMeta = document.getElementById("mobileActiveMonthMeta");
const mobileAvailableBalanceEl = document.getElementById("mobileAvailableBalance");
const mobileBudgetHintEl = document.getElementById("mobileBudgetHint");
const mobileMonthlyIncomeEl = document.getElementById("mobileMonthlyIncome");
const mobileMonthlySpendEl = document.getElementById("mobileMonthlySpend");
const mobileIncomeCard = document.getElementById("mobileIncomeCard");
const mobileBudgetPeriodBtn = document.getElementById("mobileBudgetPeriodBtn");
const mobileBudgetPeriodLabel = document.getElementById("mobileBudgetPeriodLabel");
const mobileBudgetPeriodMenu = document.getElementById("mobileBudgetPeriodMenu");
const mobileBudgetPeriodButtons = Array.from(document.querySelectorAll("[data-mobile-budget-period]"));
const mobileStickySummary = document.getElementById("mobileStickySummary");
const mobileStickyIncomeLabel = document.getElementById("mobileStickyIncomeLabel");
const mobileStickyIncome = document.getElementById("mobileStickyIncome");
const mobileStickyExpenseLabel = document.getElementById("mobileStickyExpenseLabel");
const mobileStickyExpense = document.getElementById("mobileStickyExpense");
const mobileStickyAvailableLabel = document.getElementById("mobileStickyAvailableLabel");
const mobileStickyAvailable = document.getElementById("mobileStickyAvailable");
const initialUsageState = document.getElementById("initialUsageState");
const initialUsageCard = document.getElementById("initialUsageCard");
const initialUsageTitle = document.getElementById("initialUsageTitle");
const initialUsageDescription = document.getElementById("initialUsageDescription");
const initialUsageCtaBtn = document.getElementById("initialUsageCtaBtn");
const initialUsageDismissBtn = document.getElementById("initialUsageDismissBtn");
const mobileQuickAddSheet = document.getElementById("mobileQuickAddSheet");
const closeMobileQuickAddBtn = document.getElementById("closeMobileQuickAddBtn");
const mobileQuickAddExpenseBtn = document.getElementById("mobileQuickAddExpenseBtn");
const mobileQuickAddIncomeBtn = document.getElementById("mobileQuickAddIncomeBtn");
const mobileQuickAddSalaryBtn = document.getElementById("mobileQuickAddSalaryBtn");
const mobileAmountScreen = document.getElementById("mobileAmountScreen");
const closeMobileAmountScreenBtn = document.getElementById("closeMobileAmountScreenBtn");
const mobileAmountExpenseTab = document.getElementById("mobileAmountExpenseTab");
const mobileAmountIncomeTab = document.getElementById("mobileAmountIncomeTab");
const mobileAmountInput = document.getElementById("mobileAmountInput");
const mobileAmountNextBtn = document.getElementById("mobileAmountNextBtn");
const mobileAmountKeys = Array.from(document.querySelectorAll("[data-mobile-amount-key]"));
const mobileQuickEntrySheet = document.getElementById("mobileQuickEntrySheet");
const backMobileQuickEntryBtn = document.getElementById("backMobileQuickEntryBtn");
const closeMobileQuickEntryBtn = document.getElementById("closeMobileQuickEntryBtn");
const mobileQuickEntryAmountEl = document.getElementById("mobileQuickEntryAmount");
const mobileQuickEntryAmountWrap = document.getElementById("mobileQuickEntryAmountWrap");
const mobileQuickEntryAmountInput = document.getElementById("mobileQuickEntryAmountInput");
const mobileQuickEntryTypePill = document.getElementById("mobileQuickEntryTypePill");
const mobileQuickEntryCategory = document.getElementById("mobileQuickEntryCategory");
const mobileQuickEntryName = document.getElementById("mobileQuickEntryName");
const mobileQuickEntryDate = document.getElementById("mobileQuickEntryDate");
const mobileQuickEntryRecurring = document.getElementById("mobileQuickEntryRecurring");
const mobileQuickEntryRecurringWrap = document.getElementById("mobileQuickEntryRecurringWrap");
const mobileQuickEntryRecurringMonthsWrap = document.getElementById("mobileQuickEntryRecurringMonthsWrap");
const mobileQuickEntryRecurringMonths = document.getElementById("mobileQuickEntryRecurringMonths");
const mobileQuickEntryScopeWrap = document.getElementById("mobileQuickEntryScopeWrap");
const mobileQuickEntryScopeThisMonthBtn = document.getElementById("mobileQuickEntryScopeThisMonthBtn");
const mobileQuickEntryScopeAllMonthsBtn = document.getElementById("mobileQuickEntryScopeAllMonthsBtn");
const mobileQuickEntrySaveBtn = document.getElementById("mobileQuickEntrySaveBtn");
const mobileQuickEntryDeleteBtn = document.getElementById("mobileQuickEntryDeleteBtn");
const mobileFilterSheet = document.getElementById("mobileFilterSheet");
const closeMobileFilterSheetBtn = document.getElementById("closeMobileFilterSheetBtn");
const mobileFilterSearchInput = document.getElementById("mobileFilterSearchInput");
const mobileFilterDateOptions = document.getElementById("mobileFilterDateOptions");
const mobileFilterStatusOptions = document.getElementById("mobileFilterStatusOptions");
const mobileFilterCategoryOptions = document.getElementById("mobileFilterCategoryOptions");
const mobileFilterEmptyState = document.getElementById("mobileFilterEmptyState");
const mobileClearFiltersBtn = document.getElementById("mobileClearFiltersBtn");
const mobileApplyFiltersBtn = document.getElementById("mobileApplyFiltersBtn");
const mobileClearFilterSearchBtn = document.getElementById("mobileClearFilterSearchBtn");
const overlayInteractionBlocker = document.getElementById("overlayInteractionBlocker");

populateMobileRecurringDurationOptions();
populateRecurringDurationOptions(recurringMonthsInput, recurringMonthsInput?.value || "12");
const mobileAddFabBtn = document.getElementById("mobileAddFabBtn");
const mobileAddMovementMenu = document.getElementById("mobileAddMovementMenu");
const mobileBottomNavButtons = Array.from(document.querySelectorAll("[data-mobile-nav-target]"));
const mobileThemeBtn = document.getElementById("mobileThemeBtn");
const mobileProfileBtn = document.getElementById("mobileProfileBtn");
const mobileEditSalaryBtn = document.getElementById("mobileEditSalaryBtn");
const movementTypeTabButtons = Array.from(document.querySelectorAll("[data-add-type]"));
const addTypeOptionButtons = Array.from(document.querySelectorAll(".add-type-option"));
const launchSplash = document.getElementById("launchSplash");
const startWalkthroughBtn = document.getElementById("startWalkthroughBtn");
const walkthroughOverlay = document.getElementById("walkthroughOverlay");
const walkthroughSpotlight = document.getElementById("walkthroughSpotlight");
const walkthroughCard = document.getElementById("walkthroughCard");
const walkthroughTitle = document.getElementById("walkthroughTitle");
const walkthroughBody = document.getElementById("walkthroughBody");
const walkthroughStepCounter = document.getElementById("walkthroughStepCounter");
const walkthroughPrevBtn = document.getElementById("walkthroughPrevBtn");
const walkthroughNextBtn = document.getElementById("walkthroughNextBtn");
const walkthroughSkipBtn = document.getElementById("walkthroughSkipBtn");
const closeWalkthroughBtn = document.getElementById("closeWalkthroughBtn");
const walkthroughDots = Array.from(document.querySelectorAll("[data-walkthrough-dot]"));
const profileDropdownOriginalParent = profileDropdown?.parentElement || null;
const profileDropdownOriginalNextSibling = profileDropdown?.nextSibling || null;

let modalTrigger = null;
let sheetTrigger = null;
let onboardingTrigger = null;
let onboardingStep = 0;
let pendingOnboardingTimer = null;
let onboardingGestureState = null;
let onboardingTransitionToken = 0;
let editingItemId = null;
let editingProjectedItem = null;
let salaryEditMode = false;
let pendingMovementType = "expense";
let sidebarResizeTimer = null;
let launchSplashHidden = false;
let walkthroughTrigger = null;
let walkthroughStepIndex = -1;
let walkthroughActiveTarget = null;
let walkthroughRepositionTimer = null;
let metricFitFrame = null;
let metricFitTimeoutId = null;
let mobileQuickAddOpen = false;
let mobileAmountScreenOpen = false;
let mobileQuickEntryOpen = false;
let mobileFilterSheetOpen = false;
let overlayBackStateActive = false;
let overlayBackStateSyncScheduled = false;
let ignoreOverlayBackPopstate = false;
let mobileQuickEntryAmount = 0;
let expenseEditScope = "thisMonth";
let mobileQuickEntryScope = "thisMonth";
let mobileAmountMode = "expense";
let mobileAmountValue = "";

const WALKTHROUGH_STEPS = [
  {
    targetId: "activeMonthSection",
    title: "Siempre sabes que mes estas viendo",
    body: () => `Usa estas flechas para ir hacia atras o hacia adelante. Todo lo que ves abajo se calcula segun ${formatMonthLabel(state.activeMonth)}.`,
    placement: "bottom-start"
  },
  {
    targetId: "availableBalanceCard",
    title: "Asi lees tu balance del mes",
    body: () => getVisibleMonthExpenseItems(state.activeMonth).length || getVisibleMonthIncomeItems(state.activeMonth).length
      ? `Este numero resume tu balance de ${formatMonthLabel(state.activeMonth)}: ingresos visibles menos gastos de ese mes.`
      : `Cuando cargues tu primer ingreso y tu primer gasto de ${formatMonthLabel(state.activeMonth)}, aqui veras cuanto dinero te queda en total.`,
    placement: "bottom-start"
  },
  {
    targetId: "periodBudgetCard",
    title: "Asi repartes tu disponible",
    body: () => `Aqui cambias entre dia, semana, quincena o mes para ver una sugerencia de gasto usando el disponible de ${formatMonthLabel(state.activeMonth)}.`,
    placement: "bottom-start"
  },
  {
    targetId: "openExpenseModalBtn",
    title: "Agregar un gasto lleva segundos",
    body: "Desde aqui registras un gasto. Si se repite cada mes, puedes marcarlo para que vuelva a aparecer en los meses siguientes.",
    placement: "bottom-end"
  },
  {
    targetId: "expenseTableBody",
    title: "Tus movimientos aparecen aqui",
    body: () => getVisibleMonthExpenseItems(state.activeMonth).length
      ? `Aqui puedes revisar, filtrar y editar los gastos de ${formatMonthLabel(state.activeMonth)}.`
      : `Todavia no tienes gastos en ${formatMonthLabel(state.activeMonth)}. Tu primer movimiento aparecera aqui.`,
    placement: "top-start"
  },
  {
    targetId: "categoryDonut",
    title: "Las categorias te dan contexto",
    body: () => getVisibleMonthExpenseItems(state.activeMonth).length
      ? `Este panel resume en que categorias estas gastando mas durante ${formatMonthLabel(state.activeMonth)}.`
      : `Cuando registres gastos en ${formatMonthLabel(state.activeMonth)}, aqui veras que categorias pesan mas.`,
    placement: "left-start"
  },
  {
    targetId: "downloadMenuBtn",
    title: "Tus exportaciones salen desde aqui",
    body: "Cuando quieras guardar o compartir tu informacion, desde Exportar puedes bajar un CSV o un PDF.",
    placement: "bottom-end"
  }
];

if (salaryInput) {
  salaryInput.value = formatAmountNumber(getMonthSalary(state.activeMonth), { withSymbol: false });
  setSalaryEditable(false);
}
applyTheme();
populateCategoryControls();
updateMobileFilterButtonLabels();
applySidebarState();
if (budgetPeriodSelect) {
  budgetPeriodSelect.value = normalizeBudgetPeriod(state.budgetPeriod);
}
if (downloadMenuBtn) {
  downloadMenuBtn.setAttribute("aria-expanded", "false");
}
setActiveMobileNavButton("homeSection");
updateMobileBudgetPeriodSelection();
hydrateCloudConfigInputs();
persistCloudConfig();
applyAppVariantUi();
updateAuthUi();
syncInstallAvailability();
renderActiveMonthContext();

if (salaryInput) {
salaryInput.addEventListener("input", () => {
  if (!salaryEditMode) {
    salaryInput.value = formatAmountNumber(getMonthSalary(state.activeMonth), { withSymbol: false });
    return;
  }

  const parsedSalary = parseCurrencyInput(salaryInput.value);
  setMonthSalary(state.activeMonth, parsedSalary);
  salaryInput.value = formatAmountNumber(getMonthSalary(state.activeMonth), { withSymbol: false });
  saveState();
  render();
});
}

if (amountInput) {
  amountInput.addEventListener("input", () => {
    const parsed = parseCurrencyInput(amountInput.value);
    amountInput.value = formatAmountNumber(parsed, { withSymbol: false });
  });
}

if (dateInput) {
  dateInput.addEventListener("input", () => {
    dateInput.value = formatDateInputTyping(dateInput.value);
  });

  dateInput.addEventListener("blur", () => {
    const formatted = formatDateForForm(dateInput.value, "");
    if (formatted) {
      dateInput.value = formatted;
    }
  });
}

if (typeInput) {
  typeInput.addEventListener("change", () => {
    pendingMovementType = normalizeMovementType(typeInput.value);
    populateCategoryControls();
    setExpenseFormMode(editingItemId ? "edit" : "create");
  });
}

for (const tabButton of movementTypeTabButtons) {
  tabButton.addEventListener("click", () => {
    const nextType = normalizeMovementType(tabButton.dataset.addType || "expense");
    if (typeInput) {
      typeInput.value = nextType;
    }
    pendingMovementType = nextType;
    syncMovementTypeTabs(nextType);
    populateCategoryControls();
    setExpenseFormMode(editingItemId ? "edit" : "create");
  });
}

if (toggleSalaryBtn) {
  toggleSalaryBtn.addEventListener("click", () => {
    if (salaryEditMode) {
      setSalaryEditable(false);
      salaryInput?.blur();
      return;
    }
    setSalaryEditable(true);
  });
}

prevMonthBtn?.addEventListener("click", () => {
  moveActiveMonth(-1);
});

nextMonthBtn?.addEventListener("click", () => {
  moveActiveMonth(1);
});

jumpCurrentMonthBtn?.addEventListener("click", () => {
  setActiveMonth(getCurrentMonthKey());
});

if (salaryInput) {
  salaryInput.addEventListener("beforeinput", (event) => {
    if (!salaryEditMode) {
      event.preventDefault();
    }
  });

  salaryInput.addEventListener("paste", (event) => {
    if (!salaryEditMode) {
      event.preventDefault();
    }
  });

  salaryInput.addEventListener("drop", (event) => {
    if (!salaryEditMode) {
      event.preventDefault();
    }
  });

  salaryInput.addEventListener("pointerdown", (event) => {
    if (!salaryEditMode) {
      event.preventDefault();
    }
  });

  salaryInput.addEventListener("focus", () => {
    if (!salaryEditMode) {
      salaryInput.blur();
    }
  });

  salaryInput.addEventListener("blur", () => {
    if (salaryEditMode) {
      setSalaryEditable(false);
    }
  });

  salaryInput.addEventListener("keydown", (event) => {
    if (!salaryEditMode) {
      const isTab = event.key === "Tab";
      if (!isTab) {
        event.preventDefault();
      }
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      setSalaryEditable(false);
      salaryInput.blur();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      salaryInput.value = formatAmountNumber(getMonthSalary(state.activeMonth), { withSymbol: false });
      setSalaryEditable(false);
      salaryInput.blur();
    }
  });
}

if (themeToggleBtn) {
  themeToggleBtn.addEventListener("click", () => {
    toggleThemePreference();
  });
}

if (mobileThemeBtn) {
  mobileThemeBtn.addEventListener("click", () => {
    toggleThemePreference();
  });
}

if (mobileProfileBtn) {
  mobileProfileBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleProfileDropdown();
  });
}

if (openExpenseModalBtn) {
  openExpenseModalBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    if (openExpenseModalBtn.disabled || isViewingPastMonth()) {
      return;
    }
    openExpenseModalForCreate(openExpenseModalBtn);
  });
}

if (initialUsageCtaBtn) {
  initialUsageCtaBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    openMovementCreateFlow(initialUsageCtaBtn, initialUsageCtaBtn.dataset.addType || "expense");
  });
}

if (initialUsageDismissBtn) {
  initialUsageDismissBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    dismissIncomeMissingAlert(state.activeMonth);
    renderInitialUsageState(getUsageStateForActiveMonth());
  });
}

if (mobileAddFabBtn) {
  mobileAddFabBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    if (mobileAddFabBtn.disabled || isViewingPastMonth()) {
      return;
    }
    openMobileAmountScreen("expense");
  });
}

if (closeMobileQuickAddBtn) {
  closeMobileQuickAddBtn.addEventListener("click", closeMobileQuickAddSheet);
}

if (mobileQuickAddSheet) {
  mobileQuickAddSheet.addEventListener("click", (event) => {
    const target = event.target;
    if (target instanceof HTMLElement && target.dataset.closeMobileQuickAdd === "true") {
      closeMobileQuickAddSheet();
    }
  });
}

if (mobileQuickAddExpenseBtn) {
  mobileQuickAddExpenseBtn.addEventListener("click", () => {
    openMobileAmountScreen("expense");
  });
}

if (mobileQuickAddIncomeBtn) {
  mobileQuickAddIncomeBtn.addEventListener("click", () => {
    openMobileAmountScreen("income");
  });
}

if (mobileQuickAddSalaryBtn) {
  mobileQuickAddSalaryBtn.addEventListener("click", () => {
    closeMobileQuickAddSheet();
    openSalaryModal(mobileEditSalaryBtn || mobileIncomeCard || mobileAddFabBtn);
  });
}

if (closeMobileAmountScreenBtn) {
  closeMobileAmountScreenBtn.addEventListener("click", closeMobileAmountScreen);
}

if (mobileAmountScreen) {
  mobileAmountScreen.addEventListener("click", (event) => {
    const target = event.target;
    if (target === mobileAmountScreen) {
      closeMobileAmountScreen();
    }
  });
}

if (mobileAmountExpenseTab) {
  mobileAmountExpenseTab.addEventListener("click", () => {
    setMobileAmountMode("expense");
  });
}

if (mobileAmountIncomeTab) {
  mobileAmountIncomeTab.addEventListener("click", () => {
    setMobileAmountMode("income");
  });
}

for (const keyButton of mobileAmountKeys) {
  keyButton.addEventListener("click", () => {
    updateMobileAmountValue(keyButton.dataset.mobileAmountKey || "");
  });
}

if (mobileAmountInput) {
  mobileAmountInput.addEventListener("input", () => {
    const parsed = parseCurrencyInput(mobileAmountInput.value || "");
    mobileAmountValue = String(Math.max(0, Math.trunc(parsed || 0)));
    renderMobileAmountDisplay();
  });

  mobileAmountInput.addEventListener("focus", () => {
    requestAnimationFrame(() => {
      const length = mobileAmountInput.value.length;
      mobileAmountInput.setSelectionRange(length, length);
    });
  });
}

if (mobileAmountNextBtn) {
  mobileAmountNextBtn.addEventListener("click", () => {
    commitMobileAmountFlow();
  });
}

if (backMobileQuickEntryBtn) {
  backMobileQuickEntryBtn.addEventListener("click", () => {
    closeMobileQuickEntrySheet();
  });
}

if (closeMobileQuickEntryBtn) {
  closeMobileQuickEntryBtn.addEventListener("click", closeMobileQuickEntrySheet);
}

if (mobileQuickEntrySheet) {
  mobileQuickEntrySheet.addEventListener("click", (event) => {
    const target = event.target;
    if (target instanceof HTMLElement && target.dataset.closeMobileQuickEntry === "true") {
      closeMobileQuickEntrySheet();
    }
  });
}

if (mobileQuickEntryCategory) {
  mobileQuickEntryCategory.addEventListener("change", () => {
    if (!(mobileQuickEntryCategory instanceof HTMLSelectElement) || !(mobileQuickEntryName instanceof HTMLInputElement)) {
      return;
    }
    if (mobileQuickEntryName.value.trim()) {
      return;
    }
    const config = getCategoryConfig(mobileQuickEntryCategory.value);
    mobileQuickEntryName.value = config.label;
  });
}

if (mobileQuickEntryDate) {
  mobileQuickEntryDate.addEventListener("input", () => {
    if (!(mobileQuickEntryDate instanceof HTMLInputElement)) {
      return;
    }
    if (mobileQuickEntryDate.type === "date") {
      return;
    }
    const parsed = normalizeItemDate(mobileQuickEntryDate.value || "");
    mobileQuickEntryDate.value = formatDateForForm(parsed);
  });
}

if (recurringInput) {
  recurringInput.addEventListener("change", () => {
    syncRecurringDurationVisibility();
  });
}

if (recurringMonthsInput) {
  recurringMonthsInput.addEventListener("change", () => {
    if (!(recurringMonthsInput instanceof HTMLSelectElement)) {
      return;
    }
    populateRecurringDurationOptions(recurringMonthsInput, recurringMonthsInput.value || "12");
  });
}

if (expenseEditScopeThisMonthBtn) {
  expenseEditScopeThisMonthBtn.addEventListener("click", () => {
    expenseEditScope = "thisMonth";
    updateExpenseEditScopeSelection();
  });
}

if (expenseEditScopeAllMonthsBtn) {
  expenseEditScopeAllMonthsBtn.addEventListener("click", () => {
    expenseEditScope = "allMonths";
    updateExpenseEditScopeSelection();
  });
}

if (mobileQuickEntryRecurring) {
  mobileQuickEntryRecurring.addEventListener("change", () => {
    syncMobileQuickEntryRecurringDurationVisibility();
  });
}

if (mobileQuickEntryRecurringMonths) {
  mobileQuickEntryRecurringMonths.addEventListener("change", () => {
    if (!(mobileQuickEntryRecurringMonths instanceof HTMLSelectElement)) {
      return;
    }
    populateRecurringDurationOptions(mobileQuickEntryRecurringMonths, mobileQuickEntryRecurringMonths.value || "12");
  });
}

if (mobileQuickEntryAmountInput) {
  mobileQuickEntryAmountInput.addEventListener("input", () => {
    if (!(mobileQuickEntryAmountInput instanceof HTMLInputElement)) {
      return;
    }
    const parsed = parseCurrencyInput(mobileQuickEntryAmountInput.value || "");
    mobileQuickEntryAmount = parsed;
    mobileQuickEntryAmountInput.value = formatAmountNumber(parsed, { withSymbol: false });
    if (mobileQuickEntryAmountEl) {
      mobileQuickEntryAmountEl.textContent = money(parsed).replace("$ ", "$");
    }
  });
}

if (mobileQuickEntryScopeThisMonthBtn) {
  mobileQuickEntryScopeThisMonthBtn.addEventListener("click", () => {
    mobileQuickEntryScope = "thisMonth";
    updateMobileQuickEntryScopeSelection();
  });
}

if (mobileQuickEntryScopeAllMonthsBtn) {
  mobileQuickEntryScopeAllMonthsBtn.addEventListener("click", () => {
    mobileQuickEntryScope = "allMonths";
    updateMobileQuickEntryScopeSelection();
  });
}

if (mobileQuickEntrySaveBtn) {
  mobileQuickEntrySaveBtn.addEventListener("click", saveMobileQuickEntry);
}

if (closeExpenseModalBtn) {
  closeExpenseModalBtn.addEventListener("click", closeModal);
}

if (closeSalaryModalBtn) {
  closeSalaryModalBtn.addEventListener("click", closeSalaryModal);
}

if (cancelSalaryModalBtn) {
  cancelSalaryModalBtn.addEventListener("click", closeSalaryModal);
}

if (saveSalaryModalBtn) {
  saveSalaryModalBtn.addEventListener("click", saveSalaryModalValue);
}

if (expenseModal) {
  expenseModal.addEventListener("click", (event) => {
    const target = event.target;
    if (target.dataset.closeModal === "true") {
      closeModal();
    }
  });
}

if (mobilePrevMonthBtn) {
  mobilePrevMonthBtn.addEventListener("click", () => {
    moveActiveMonth(-1);
  });
}

if (mobileNextMonthBtn) {
  mobileNextMonthBtn.addEventListener("click", () => {
    moveActiveMonth(1);
  });
}

if (mobileMonthShortcut) {
  const jumpToCurrentMonth = () => {
    setActiveMonth(getCurrentMonthKey());
  };

  mobileMonthShortcut.addEventListener("click", jumpToCurrentMonth);
  mobileMonthShortcut.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }
    event.preventDefault();
    jumpToCurrentMonth();
  });
}

if (salaryModal) {
  salaryModal.addEventListener("click", (event) => {
    const target = event.target;
    if (target instanceof HTMLElement && target.dataset.closeSalaryModal === "true") {
      closeSalaryModal();
    }
  });
}

if (salaryModalInput) {
  salaryModalInput.addEventListener("input", () => {
    const parsed = parseCurrencyInput(salaryModalInput.value);
    salaryModalInput.value = formatAmountNumber(parsed, { withSymbol: false });
  });

  salaryModalInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      saveSalaryModalValue();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeSalaryModal();
    }
  });
}

expenseForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const didSave = saveMovementRecord({
    movementType: normalizeMovementType(typeInput?.value || pendingMovementType || "expense"),
    rawMovementDate: dateInput?.value || "",
    category: categoryInput?.value || getDefaultCategoryKeyForType("expense"),
    name: nameInput?.value || "",
    amount: parseCurrencyInput(amountInput?.value || ""),
    isRecurring: Boolean(recurringInput?.checked),
    recurringMonths: parseRecurringDurationSelection(recurringMonthsInput?.value || "12"),
    editScope: expenseEditScope
  });

  if (!didSave) {
    return;
  }
  closeModal();
});

if (categoryFilter) {
  categoryFilter.addEventListener("change", () => {
    renderByFilters();
  });
}

if (dateFilter) {
  dateFilter.addEventListener("change", () => {
    renderByFilters();
  });
}

if (statusFilter) {
  statusFilter.addEventListener("change", () => {
    renderByFilters();
  });
}

if (mobileCategoryFilterBtn) {
  mobileCategoryFilterBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    openMobileFilterSheet();
  });
}

if (categoryFilterMenu) {
  categoryFilterMenu.addEventListener("click", (event) => {
    event.stopPropagation();
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const optionBtn = target.closest(".category-filter-option");
    if (!optionBtn) {
      return;
    }

    const filterValue = optionBtn.dataset.categoryValue || "all";
    categoryFilter.value = filterValue;
    updateCategoryFilterMenuSelection();
    renderByFilters();
    hideCategoryFilterMenu();
  });

  categoryFilterMenu.addEventListener("input", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || !target.classList.contains("category-filter-search-input")) {
      return;
    }

    filterCategoryFilterMenuOptions(target.value);
  });
}

if (mobileDateFilterBtn) {
  mobileDateFilterBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    openMobileFilterSheet();
  });
}

if (closeMobileFilterSheetBtn) {
  closeMobileFilterSheetBtn.addEventListener("click", closeMobileFilterSheet);
}

if (mobileFilterSheet) {
  mobileFilterSheet.addEventListener("click", (event) => {
    const target = event.target;
    if (target instanceof HTMLElement && target.dataset.closeMobileFilter === "true") {
      closeMobileFilterSheet();
    }
  });
}

if (mobileFilterSearchInput) {
  mobileFilterSearchInput.addEventListener("input", () => {
    renderMobileFilterCategoryOptions(mobileFilterSearchInput.value);
  });
}

if (mobileClearFilterSearchBtn) {
  mobileClearFilterSearchBtn.addEventListener("click", () => {
    if (mobileFilterSearchInput) {
      mobileFilterSearchInput.value = "";
    }
    renderMobileFilterCategoryOptions("");
  });
}

if (mobileFilterDateOptions) {
  mobileFilterDateOptions.addEventListener("click", (event) => {
    const target = event.target;
    const button = target instanceof HTMLElement ? target.closest("[data-mobile-date-value]") : null;
    if (!(button instanceof HTMLButtonElement) || !dateFilter) {
      return;
    }
    dateFilter.value = normalizeDateFilterValue(button.dataset.mobileDateValue || "all");
    renderMobileFilterDateOptions();
  });
}

if (mobileFilterStatusOptions) {
  mobileFilterStatusOptions.addEventListener("click", (event) => {
    const target = event.target;
    const button = target instanceof HTMLElement ? target.closest("[data-mobile-status-value]") : null;
    if (!(button instanceof HTMLButtonElement) || !statusFilter) {
      return;
    }
    statusFilter.value = normalizeStatusFilterValue(button.dataset.mobileStatusValue || "all");
    renderMobileFilterStatusOptions();
  });
}

if (mobileFilterCategoryOptions) {
  mobileFilterCategoryOptions.addEventListener("click", (event) => {
    const target = event.target;
    const button = target instanceof HTMLElement ? target.closest("[data-mobile-category-value]") : null;
    if (!(button instanceof HTMLButtonElement) || !categoryFilter) {
      return;
    }
    categoryFilter.value = String(button.dataset.mobileCategoryValue || "all");
    renderMobileFilterCategoryOptions(mobileFilterSearchInput?.value || "");
  });
}

if (mobileClearFiltersBtn) {
  mobileClearFiltersBtn.addEventListener("click", () => {
    if (categoryFilter) {
      categoryFilter.value = "all";
    }
    if (dateFilter) {
      dateFilter.value = "all";
    }
    if (statusFilter) {
      statusFilter.value = "all";
    }
    if (mobileFilterSearchInput) {
      mobileFilterSearchInput.value = "";
    }
    renderMobileFilterDateOptions();
    renderMobileFilterStatusOptions();
    renderMobileFilterCategoryOptions("");
    renderByFilters();
    closeMobileFilterSheet();
  });
}

if (mobileApplyFiltersBtn) {
  mobileApplyFiltersBtn.addEventListener("click", () => {
    renderByFilters();
    closeMobileFilterSheet();
  });
}

if (clearMovementFiltersBtn) {
  clearMovementFiltersBtn.addEventListener("click", () => {
    if (categoryFilter) {
      categoryFilter.value = "all";
    }
    if (dateFilter) {
      dateFilter.value = "all";
    }
    if (statusFilter) {
      statusFilter.value = "all";
    }
    renderByFilters();
    hideCategoryFilterMenu();
    hideDateFilterMenu();
  });
}

if (dateFilterMenu) {
  dateFilterMenu.addEventListener("click", (event) => {
    event.stopPropagation();
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const optionBtn = target.closest(".date-filter-option");
    if (!optionBtn) {
      return;
    }

    const filterValue = normalizeDateFilterValue(optionBtn.dataset.dateValue || "all");
    if (dateFilter) {
      dateFilter.value = filterValue;
    }
    updateDateFilterMenuSelection();
    renderByFilters();
    hideDateFilterMenu();
  });
}

for (const optionBtn of addTypeOptionButtons) {
  optionBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    const target = event.currentTarget;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const type = normalizeMovementType(target.dataset.movementType || "expense");
    pendingMovementType = type;
    hideAddMovementMenu();
    hideMobileAddMovementMenu();
    const trigger = target.closest("#mobileAddMovementMenu") ? mobileAddFabBtn : openExpenseModalBtn;
    openExpenseModalForCreate(trigger, type);
  });
}

if (budgetPeriodSelect) {
  budgetPeriodSelect.addEventListener("change", () => {
    applyBudgetPeriodSelection(budgetPeriodSelect.value);
  });
}

if (budgetPeriodBtn) {
  budgetPeriodBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleBudgetPeriodMenu();
  });
}

if (mobileBudgetPeriodBtn) {
  mobileBudgetPeriodBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleMobileBudgetPeriodMenu();
  });
}

if (budgetPeriodMenu) {
  budgetPeriodMenu.addEventListener("click", (event) => {
    event.stopPropagation();
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const optionBtn = target.closest(".budget-period-option");
    if (!optionBtn) {
      return;
    }

    applyBudgetPeriodSelection(optionBtn.dataset.budgetPeriod || "daily");
    hideBudgetPeriodMenu();
  });
}

for (const button of mobileBudgetPeriodButtons) {
  button.addEventListener("click", () => {
    applyBudgetPeriodSelection(button.dataset.mobileBudgetPeriod || "daily");
  });
}

if (sidebarToggleBtn) {
  sidebarToggleBtn.addEventListener("click", () => {
    if (isSidebarMobileLayout()) {
      return;
    }
    state.sidebarCollapsed = !Boolean(state.sidebarCollapsed);
    saveState();
    applySidebarState();
  });
}

window.addEventListener("resize", () => {
  if (sidebarResizeTimer) {
    clearTimeout(sidebarResizeTimer);
  }
  sidebarResizeTimer = window.setTimeout(() => {
    sidebarResizeTimer = null;
    applySidebarState();
    updateMonthContextCopyWidth();
  }, 80);
});

if (openOnboardingBtn) {
  openOnboardingBtn.addEventListener("click", () => {
    openOnboarding({ force: true, trigger: openOnboardingBtn });
  });
}

if (helpOnboardingBtn) {
  helpOnboardingBtn.addEventListener("click", () => {
    openOnboarding({ force: true, trigger: helpOnboardingBtn });
  });
}

if (openFeedbackModalBtn) {
  openFeedbackModalBtn.addEventListener("click", () => {
    openFeedbackModal(openFeedbackModalBtn);
  });
}

if (profileFeedbackBtn) {
  profileFeedbackBtn.addEventListener("click", () => {
    closeProfileDropdown();
    openFeedbackModal(profileFeedbackBtn);
  });
}

if (startWalkthroughBtn) {
  startWalkthroughBtn.addEventListener("click", () => {
    closeProfileDropdown();
    startWalkthrough(startWalkthroughBtn);
  });
}

if (downloadMenuBtn) {
  downloadMenuBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleDownloadMenu();
  });
}

if (downloadMenu) {
  downloadMenu.addEventListener("click", (event) => {
    event.stopPropagation();
  });
}

if (resetAllDataBtn) {
  resetAllDataBtn.addEventListener("click", () => {
    openResetAllConfirmModal(resetAllDataBtn);
  });
}

if (profileResetBtn) {
  profileResetBtn.addEventListener("click", () => {
    closeProfileDropdown();
    openResetAllConfirmModal(profileResetBtn);
  });
}

for (const chartModeBtn of [chartModeExpenseBtn, chartModeIncomeBtn]) {
  if (!chartModeBtn) {
    continue;
  }

  chartModeBtn.addEventListener("click", () => {
    const nextMode = normalizeChartMode(chartModeBtn.dataset.chartMode);
    if (state.chartMode === nextMode) {
      return;
    }
    state.chartMode = nextMode;
    saveState();
    renderDonut();
  });
}

if (closeOnboardingBtn) {
  closeOnboardingBtn.addEventListener("click", () => {
    closeOnboarding(true);
  });
}

if (onboardingModal) {
  onboardingModal.addEventListener("click", (event) => {
    const target = event.target;
    if (target instanceof HTMLElement && target.dataset.closeOnboarding === "true") {
      closeOnboarding(true);
    }
  });
}

if (onboardingPrevBtn) {
  onboardingPrevBtn.addEventListener("click", () => {
    setOnboardingStep(onboardingStep - 1);
  });
}

if (onboardingNextBtn) {
  onboardingNextBtn.addEventListener("click", () => {
    setOnboardingStep(onboardingStep + 1);
  });
}

if (onboardingDoneBtn) {
  onboardingDoneBtn.addEventListener("click", () => {
    closeOnboarding(true);
  });
}

if (onboardingSkipBtn) {
  onboardingSkipBtn.addEventListener("click", () => {
    closeOnboarding(true);
  });
}

if (onboardingGestureSurface) {
  onboardingGestureSurface.addEventListener("pointerdown", handleOnboardingPointerDown);
  onboardingGestureSurface.addEventListener("pointermove", handleOnboardingPointerMove);
  onboardingGestureSurface.addEventListener("pointerup", handleOnboardingPointerEnd);
  onboardingGestureSurface.addEventListener("pointercancel", handleOnboardingPointerCancel);
  onboardingGestureSurface.addEventListener("lostpointercapture", handleOnboardingPointerCancel);
}

if (walkthroughOverlay) {
  walkthroughOverlay.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    if (target.dataset.closeWalkthrough === "true" || target === walkthroughOverlay) {
      finishWalkthrough();
    }
  });
}

if (closeWalkthroughBtn) {
  closeWalkthroughBtn.addEventListener("click", () => {
    finishWalkthrough();
  });
}

if (walkthroughSkipBtn) {
  walkthroughSkipBtn.addEventListener("click", () => {
    finishWalkthrough();
  });
}

if (walkthroughPrevBtn) {
  walkthroughPrevBtn.addEventListener("click", () => {
    setWalkthroughStep(walkthroughStepIndex - 1);
  });
}

if (walkthroughNextBtn) {
  walkthroughNextBtn.addEventListener("click", () => {
    if (walkthroughStepIndex >= WALKTHROUGH_STEPS.length - 1) {
      finishWalkthrough();
      return;
    }

    setWalkthroughStep(walkthroughStepIndex + 1);
  });
}

if (openAuthModalBtn) {
  openAuthModalBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleProfileDropdown();
  });
}

const sidebarProfileTriggers = Array.from(document.querySelectorAll('[data-open-profile="true"]'));
for (const trigger of sidebarProfileTriggers) {
  trigger.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleProfileDropdown();
  });
}

if (profileDropdown) {
  profileDropdown.addEventListener("click", (event) => {
    event.stopPropagation();
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await performLogout();
  });
}

if (closeAuthModalBtn) {
  closeAuthModalBtn.addEventListener("click", closeAuthModal);
}

if (authModal) {
  authModal.addEventListener("click", (event) => {
    const target = event.target;
    if (target instanceof HTMLElement && target.dataset.closeAuth === "true") {
      closeAuthModal();
    }
  });
}

if (closeFeedbackModalBtn) {
  closeFeedbackModalBtn.addEventListener("click", closeFeedbackModal);
}

if (feedbackModal) {
  feedbackModal.addEventListener("click", (event) => {
    const target = event.target;
    if (target instanceof HTMLElement && target.dataset.closeFeedbackModal === "true") {
      closeFeedbackModal();
    }
  });
}

if (feedbackForm) {
  feedbackForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await submitFeedback();
  });
}

if (saveCloudConfigBtn) {
  saveCloudConfigBtn.addEventListener("click", async () => {
    const url = String(supabaseUrlInput?.value || "").trim();
    const anonKey = String(supabaseAnonKeyInput?.value || "").trim();

    if (!url || !anonKey) {
      showToast("Completa URL y Anon Key de Supabase.", true);
      return;
    }

    if (!/^https?:\/\/.+/i.test(url)) {
      showToast("La URL de Supabase no es valida.", true);
      return;
    }

    cloudConfig.url = url;
    cloudConfig.anonKey = anonKey;
    persistCloudConfig();
    showToast("Configuracion cloud guardada.");

    const initialized = await initializeCloudAuthClient({ forceRecreate: true });
    if (!initialized) {
      showToast("No pudimos conectar con Supabase. Revisa URL/Key.", true);
      return;
    }

    updateAuthUi();
  });
}

if (clearCloudConfigBtn) {
  clearCloudConfigBtn.addEventListener("click", () => {
    const confirmed = window.confirm("Se borrara la configuracion cloud guardada en este dispositivo. Deseas continuar?");
    if (!confirmed) {
      return;
    }

    cloudConfig.url = "";
    cloudConfig.anonKey = "";
    persistCloudConfig();
    hydrateCloudConfigInputs();

    if (authStateSubscription && typeof authStateSubscription.unsubscribe === "function") {
      authStateSubscription.unsubscribe();
    }

    authStateSubscription = null;
    supabaseClient = null;
    feedbackClient = null;
    authUser = null;
    lastCloudSignature = "";
    stopCloudAutoSync();
    if (pendingCloudSyncTimer) {
      clearTimeout(pendingCloudSyncTimer);
      pendingCloudSyncTimer = null;
    }
    setCloudStatus("local", "Sin sincronizacion");
    updateAuthUi();
    showToast("Configuracion cloud eliminada.");
  });
}

if (signInGoogleBtn) {
  signInGoogleBtn.addEventListener("click", async () => {
    await signInWithGoogle();
  });
}

if (syncNowBtn) {
  syncNowBtn.addEventListener("click", async () => {
    if (!authUser) {
      showToast("Primero inicia sesion con Google.", true);
      return;
    }

    if (cloudPullInFlight) {
      showToast("Sincronizacion ya en curso...");
      return;
    }

    const initialHtml = syncNowBtn.innerHTML;
    syncNowBtn.disabled = true;
    syncNowBtn.innerHTML = '<i class="bi bi-arrow-repeat spin"></i> Sincronizando...';
    showToast("Sincronizando...");

    try {
      const ok = await pullStateFromCloud({ showToastOnSuccess: true, silentErrors: false });
      if (!ok) {
        showToast("No pudimos sincronizar ahora. Revisa tu conexion o configuracion.", true);
      }
    } finally {
      syncNowBtn.disabled = false;
      syncNowBtn.innerHTML = initialHtml;
    }
  });
}

if (logoutModalBtn) {
  logoutModalBtn.addEventListener("click", async () => {
    await performLogout();
  });
}

if (deleteConfirmModal) {
  deleteConfirmModal.addEventListener("click", (event) => {
    const target = event.target;
    if (target instanceof HTMLElement && target.dataset.closeDeleteModal === "true") {
      closeDeleteConfirmModal();
    }
  });
}

if (closeDeleteConfirmBtn) {
  closeDeleteConfirmBtn.addEventListener("click", closeDeleteConfirmModal);
}

if (cancelDeleteBtn) {
  cancelDeleteBtn.addEventListener("click", closeDeleteConfirmModal);
}

if (confirmDeleteBtn) {
  confirmDeleteBtn.addEventListener("click", () => {
    if (pendingDeleteKind === "all") {
      state.items = [];
      state.salary = 0;
      state.monthlySalaries = {};
      state.activeMonth = getCurrentMonthKey();
      state.recurringSkips = [];
      state.budgetPeriod = "monthly";
      if (categoryFilter) {
        categoryFilter.value = "all";
      }
      if (dateFilter) {
        dateFilter.value = "all";
      }
      pendingMovementType = "expense";
      populateCategoryControls();
      saveState();
      render();
      closeDeleteConfirmModal();
      showToast("Datos reiniciados.");
      return;
    }

    if (pendingDeleteRecurringContext) {
      const didDeleteRecurring = deleteRecurringThisMonth(pendingDeleteRecurringContext);
      pendingDeleteRecurringContext = null;
      pendingDeleteProjection = null;
      pendingDeleteItemId = null;
      if (!didDeleteRecurring) {
        closeDeleteConfirmModal();
        return;
      }
      saveState();
      render();
      closeDeleteConfirmModal();
      return;
    }

    if (pendingDeleteProjection?.seriesId && pendingDeleteProjection?.monthKey) {
      if (!Array.isArray(state.recurringSkips)) {
        state.recurringSkips = [];
      }
      const alreadySkipped = state.recurringSkips.some((entry) => entry?.seriesId === pendingDeleteProjection.seriesId && entry?.month === pendingDeleteProjection.monthKey);
      if (!alreadySkipped) {
        state.recurringSkips.push({
          seriesId: pendingDeleteProjection.seriesId,
          month: pendingDeleteProjection.monthKey
        });
      }
      const deletedMonthLabel = formatMonthLabel(pendingDeleteProjection.monthKey);
      pendingDeleteProjection = null;
      saveState();
      render();
      closeDeleteConfirmModal();
      showToast(`Movimiento omitido en ${deletedMonthLabel}.`);
      return;
    }

    if (!pendingDeleteItemId) {
      closeDeleteConfirmModal();
      return;
    }

    state.items = state.items.filter((entry) => entry.id !== pendingDeleteItemId);
    pendingDeleteItemId = null;
    saveState();
    render();
    closeDeleteConfirmModal();
    showToast("Movimiento eliminado.");
  });
}

window.addEventListener("focus", () => {
  if (!authUser) {
    return;
  }
  pullStateFromCloud({ showToastOnSuccess: false, silentErrors: true }).catch(() => {
    // Keep app usable even if cloud pull fails while refocusing.
  });
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState !== "visible" || !authUser) {
    return;
  }
  pullStateFromCloud({ showToastOnSuccess: false, silentErrors: true }).catch(() => {
    // Keep app usable even if cloud pull fails while returning to the tab.
  });
});

for (const dot of onboardingStepDots) {
  dot.addEventListener("click", () => {
    const index = Number(dot.dataset.stepJump || 0);
    setOnboardingStep(index);
  });
}

document.addEventListener("click", (event) => {
  const target = event.target;
  const desktopBudgetMenuOpen = Boolean(budgetPeriodMenu && !budgetPeriodMenu.classList.contains("is-hidden"));
  const mobileBudgetMenuOpen = Boolean(mobileBudgetPeriodMenu && !mobileBudgetPeriodMenu.classList.contains("is-hidden"));
  const clickedDesktopBudgetMenu = Boolean(
    target instanceof Node
      && ((budgetPeriodMenu && budgetPeriodMenu.contains(target)) || (budgetPeriodBtn && budgetPeriodBtn.contains(target)))
  );
  const clickedMobileBudgetMenu = Boolean(
    target instanceof Node
      && ((mobileBudgetPeriodMenu && mobileBudgetPeriodMenu.contains(target)) || (mobileBudgetPeriodBtn && mobileBudgetPeriodBtn.contains(target)))
  );

  if ((desktopBudgetMenuOpen && !clickedDesktopBudgetMenu) || (mobileBudgetMenuOpen && !clickedMobileBudgetMenu)) {
    event.preventDefault();
    event.stopPropagation();
    hideBudgetPeriodMenu();
    hideMobileBudgetPeriodMenu();
    return;
  }
}, true);

document.addEventListener("click", () => {
  hideDownloadMenu();
  hideCategoryFilterMenu();
  hideDateFilterMenu();
  hideBudgetPeriodMenu();
  hideMobileBudgetPeriodMenu();
  hideAddMovementMenu();
  hideMobileAddMovementMenu();
  closeProfileDropdown();
});

if (overlayInteractionBlocker) {
  overlayInteractionBlocker.addEventListener("click", () => {
    closeActiveOverlayState();
  });
}

if (exportCsvBtn) {
  exportCsvBtn.addEventListener("click", () => {
    hideDownloadMenu();
    exportCsv();
  });
}

if (profileExportCsvBtn) {
  profileExportCsvBtn.addEventListener("click", () => {
    closeProfileDropdown();
    exportCsv();
  });
}

if (exportPdfBtn) {
  exportPdfBtn.addEventListener("click", () => {
    hideDownloadMenu();
    exportPdf();
  });
}

if (profileExportPdfBtn) {
  profileExportPdfBtn.addEventListener("click", () => {
    closeProfileDropdown();
    exportPdf();
  });
}

for (const navButton of mobileBottomNavButtons) {
  navButton.addEventListener("click", () => {
    const targetId = String(navButton.dataset.mobileNavTarget || "").trim();
    if (!targetId) {
      return;
    }
    const target = document.getElementById(targetId);
    if (!(target instanceof HTMLElement)) {
      return;
    }
    setActiveMobileNavButton(targetId);
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

if (installAppBtn) {
  installAppBtn.addEventListener("click", async () => {
    const installContext = getInstallAvailabilityContext();

    if (!installContext.isMobile || installContext.isInstalled) {
      return;
    }

    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      syncInstallAvailability();
      return;
    }

    if (installContext.isIOS && installContext.isSafari) {
      showToast("En Safari toca Compartir y luego 'Agregar a pantalla de inicio'.");
      return;
    }

    if (installContext.isIOS) {
      showToast("Abre este link en Safari y luego usa 'Agregar a pantalla de inicio'.", true);
      return;
    }

    if (installContext.isInAppBrowser) {
      showToast("Abre este link en Chrome para instalar la app.", true);
      return;
    }

    if (installContext.isAndroid) {
      showToast("En Chrome abre el menu y toca 'Instalar app' o 'Agregar a pantalla principal'.");
      return;
    }

    showToast("Abre este link en el navegador de tu telefono para instalar la app.", true);
  });
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  syncInstallAvailability();
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  syncInstallAvailability();
});

if (mobileViewportMedia?.addEventListener) {
  mobileViewportMedia.addEventListener("change", () => {
    syncInstallAvailability();
    applyAppVariantUi();
  });
}

window.addEventListener("pageshow", syncInstallAvailability);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    syncInstallAvailability();
  }
});

if (systemThemeMedia?.addEventListener) {
  systemThemeMedia.addEventListener("change", () => {
    if (state.theme === "system") {
      applyTheme();
    }
  });
}

function hideLaunchSplash() {
  if (!launchSplash || launchSplashHidden) {
    return;
  }

  launchSplashHidden = true;
  launchSplash.classList.add("is-hidden");
  window.setTimeout(() => {
    launchSplash.remove();
  }, 320);
}

window.addEventListener("load", hideLaunchSplash);
window.setTimeout(hideLaunchSplash, 1800);

if ("serviceWorker" in navigator && window.location.protocol !== "file:") {
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("./sw.js", { updateViaCache: "none" });

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

  finishWalkthrough();
  closeModal();
  closeDeleteConfirmModal();
  closeOnboarding(false);
  closeAuthModal();
  closeFeedbackModal();
  closeProfileDropdown();
  closeMobileQuickAddSheet();
  closeMobileAmountScreen();
  closeMobileFilterSheet();
  hideDownloadMenu();
  hideCategoryFilterMenu();
  hideDateFilterMenu();
  hideBudgetPeriodMenu();
  hideMobileBudgetPeriodMenu();
  hideAddMovementMenu();
  hideMobileAddMovementMenu();
});

window.addEventListener("popstate", () => {
  if (ignoreOverlayBackPopstate) {
    ignoreOverlayBackPopstate = false;
    return;
  }

  if (hasOpenOverlayState()) {
    overlayBackStateActive = false;
    closeActiveOverlayState();
    return;
  }

  overlayBackStateActive = false;

  const historyMonth = getMonthHistoryState();
  if (historyMonth && historyMonth !== normalizeMonthKey(state.activeMonth)) {
    setActiveMonth(historyMonth, { syncHistory: false });
    return;
  }

  if (!historyMonth && normalizeMonthKey(state.activeMonth) !== getCurrentMonthKey()) {
    setActiveMonth(getCurrentMonthKey(), { syncHistory: false });
  }
});

function createItemId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `item_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

function normalizeCategoryKey(rawCategory) {
  const value = String(rawCategory || "").trim().toLowerCase();
  if (CATEGORY_CONFIG[value]) {
    return value;
  }
  if (LEGACY_CATEGORY_MAP[value] && CATEGORY_CONFIG[LEGACY_CATEGORY_MAP[value]]) {
    return LEGACY_CATEGORY_MAP[value];
  }
  return FALLBACK_CATEGORY_KEY;
}

function normalizeMovementType(rawType) {
  const value = String(rawType || "").trim().toLowerCase();
  if (value === "income" || value === "ingreso") {
    return "income";
  }
  return "expense";
}

function openMovementCreateFlow(trigger = null, movementType = "expense") {
  if (isViewingPastMonth()) {
    return;
  }

  const nextType = normalizeMovementType(movementType);
  openExpenseModalForCreate(trigger, nextType);
}

function normalizeBudgetPeriod(rawPeriod) {
  const value = String(rawPeriod || "").trim().toLowerCase();
  if (value === "daily" || value === "monthly") {
    return value;
  }
  return "monthly";
}

function normalizeEditScope(rawScope) {
  const value = String(rawScope || "").trim().toLowerCase();
  if (value === "allmonths") {
    return "allMonths";
  }
  if (value === "thismonth") {
    return "thisMonth";
  }
  return "";
}

function shouldShowRecurringEditScope(item = null, { isProjected = Boolean(editingProjectedItem) } = {}) {
  return Boolean(isProjected || item?.isRecurring);
}

function isRecurringEditContext(item = null, { isProjected = Boolean(editingProjectedItem) } = {}) {
  return Boolean(isProjected || item?.isRecurring);
}

function applyExpenseRecurringEditRestrictions({ isRecurringEdit = false } = {}) {
  movementTypeTabButtons.forEach((button) => {
    if (button instanceof HTMLButtonElement) {
      button.disabled = isRecurringEdit;
    }
  });

  if (dateInput instanceof HTMLInputElement) {
    dateInput.disabled = isRecurringEdit;
    if (isRecurringEdit) {
      dateInput.setAttribute("aria-readonly", "true");
    } else {
      dateInput.removeAttribute("aria-readonly");
    }
  }

  const recurringLabel = recurringInput instanceof HTMLInputElement
    ? recurringInput.closest(".recurring-toggle")
    : null;

  if (recurringInput instanceof HTMLInputElement) {
    if (isRecurringEdit) {
      recurringInput.checked = true;
    }
    recurringInput.disabled = isRecurringEdit;
  }

  if (recurringLabel instanceof HTMLElement) {
    recurringLabel.classList.toggle("is-hidden", isRecurringEdit);
  }

  if (recurringMonthsWrap) {
    const shouldShowDuration = isRecurringEdit || Boolean(recurringInput?.checked);
    recurringMonthsWrap.classList.toggle("is-hidden", !shouldShowDuration);
  }

  if (recurringMonthsInput instanceof HTMLSelectElement) {
    recurringMonthsInput.disabled = isRecurringEdit || !Boolean(recurringInput?.checked);
  }
}

function applyMobileRecurringEditRestrictions({ isRecurringEdit = false } = {}) {
  if (mobileQuickEntryDate instanceof HTMLInputElement) {
    mobileQuickEntryDate.disabled = isRecurringEdit;
    if (isRecurringEdit) {
      mobileQuickEntryDate.setAttribute("aria-readonly", "true");
    } else {
      mobileQuickEntryDate.removeAttribute("aria-readonly");
    }
  }

  if (mobileQuickEntryRecurring instanceof HTMLInputElement) {
    if (isRecurringEdit) {
      mobileQuickEntryRecurring.checked = true;
    }
    mobileQuickEntryRecurring.disabled = isRecurringEdit;
  }

  if (mobileQuickEntryRecurringWrap) {
    mobileQuickEntryRecurringWrap.classList.toggle("is-hidden", isRecurringEdit);
  }

  if (mobileQuickEntryRecurringMonthsWrap) {
    const shouldShowDuration = isRecurringEdit || Boolean(mobileQuickEntryRecurring?.checked);
    mobileQuickEntryRecurringMonthsWrap.classList.toggle("is-hidden", !shouldShowDuration);
  }

  if (mobileQuickEntryRecurringMonths instanceof HTMLSelectElement) {
    mobileQuickEntryRecurringMonths.disabled = isRecurringEdit || !Boolean(mobileQuickEntryRecurring?.checked);
  }
}

function getRecurringDeleteContext(item) {
  if (item?.isProjectedRecurring) {
    const seriesId = getRecurringSeriesId(item);
    const monthKey = getMonthKeyFromItem(item);
    const sourceItem = findLatestRecurringSourceItem(seriesId, monthKey);
    if (!seriesId) {
      return null;
    }

    return {
      kind: "projected",
      seriesId,
      monthKey,
      sourceItemId: sourceItem?.id || "",
      sourceMonthKey: sourceItem ? getRecurringSeriesSourceMonth(sourceItem) : monthKey
    };
  }

  if (item?.isRecurring) {
    const seriesId = getRecurringSeriesId(item);
    if (!seriesId) {
      return null;
    }

    return {
      kind: "stored",
      seriesId,
      monthKey: getMonthKeyFromItem(item),
      sourceItemId: item.id,
      sourceMonthKey: getRecurringSeriesSourceMonth(item)
    };
  }

  return null;
}

function deleteRecurringThisMonth(context) {
  const monthLabel = formatMonthLabel(context?.monthKey);
  if (!context?.seriesId || !context?.monthKey) {
    return false;
  }

  if (context.kind === "projected") {
    addRecurringSkip(context.seriesId, context.monthKey);
    showToast(`Movimiento omitido en ${monthLabel}.`);
    return true;
  }

  const sourceItem = state.items.find((entry) => entry.id === context.sourceItemId);
  if (!sourceItem?.isRecurring) {
    return false;
  }

  const continuationMonthKey = shiftMonthKey(context.monthKey, 1);
  const continuationItem = createRecurringContinuationItem(sourceItem, context.seriesId, continuationMonthKey);
  state.items = state.items.filter((entry) => entry.id !== sourceItem.id);
  addRecurringSkip(context.seriesId, context.monthKey);

  if (continuationItem) {
    state.items.push(continuationItem);
    limitRecurringSeriesBeforeMonth(context.seriesId, continuationMonthKey);
    removeRecurringSkip(context.seriesId, continuationMonthKey);
  }

  showToast(`Movimiento omitido en ${monthLabel}.`);
  return true;
}

function deleteRecurringFromMonthForward(context) {
  if (!context?.seriesId || !context?.monthKey) {
    return false;
  }

  state.items = state.items.filter((entry) => {
    if (getRecurringSeriesId(entry) !== context.seriesId) {
      return true;
    }

    return compareMonthKeys(getMonthKeyFromItem(entry), context.monthKey) < 0;
  });

  limitRecurringSeriesBeforeMonth(context.seriesId, context.monthKey);
  state.recurringSkips = Array.isArray(state.recurringSkips)
    ? state.recurringSkips.filter((entry) => !(entry?.seriesId === context.seriesId && compareMonthKeys(entry?.month, context.monthKey) >= 0))
    : [];

  showToast(`Serie eliminada desde ${formatMonthLabel(context.monthKey)}.`);
  return true;
}

function createRecurringContinuationItem(sourceItem, seriesId, startMonthKey) {
  const normalizedStartMonth = normalizeMonthKey(startMonthKey);
  const normalizedSeriesId = String(seriesId || getRecurringSeriesId(sourceItem)).trim();
  const endMonth = getRecurringEndMonth(sourceItem);
  const sourceMonth = getRecurringSeriesSourceMonth(sourceItem);
  if (!normalizedSeriesId) {
    return null;
  }

  if (endMonth && compareMonthKeys(normalizedStartMonth, endMonth) > 0) {
    return null;
  }

  const continuationItem = sanitizeItem({
    id: createItemId(),
    type: normalizeMovementType(sourceItem?.type),
    date: buildDateForMonth(normalizeItemDate(sourceItem?.date), normalizedStartMonth),
    category: normalizeCategoryKeyForType(sourceItem?.category, sourceItem?.type),
    name: String(sourceItem?.name || "").trim(),
    amount: Math.max(0, Number(sourceItem?.amount || 0)),
    isRecurring: true,
    recurringSeriesId: normalizedSeriesId,
    recurringSourceMonth: sourceMonth,
    sortAnchorId: String(sourceItem?.sortAnchorId || sourceItem?.id || "").trim() || undefined,
    createdAt: new Date().toISOString()
  });

  if (!continuationItem) {
    return null;
  }

  const continuationDuration = getRecurringDurationSelectionForItem(sourceItem, normalizedStartMonth);
  if (continuationDuration === "always") {
    clearRecurringWindow(continuationItem);
  } else {
    setRecurringWindow(continuationItem, normalizedStartMonth, continuationDuration);
  }

  return continuationItem;
}

function getHistoryStateObject() {
  return history.state && typeof history.state === "object" ? history.state : {};
}

function normalizeChartMode(rawMode) {
  return String(rawMode || "").trim().toLowerCase() === "income" ? "income" : "expense";
}

function isMobileViewport() {
  return mobileViewportMedia ? mobileViewportMedia.matches : window.innerWidth <= 767;
}

function isStandaloneDisplayMode() {
  const standaloneMatch = window.matchMedia ? window.matchMedia("(display-mode: standalone)").matches : false;
  return standaloneMatch || window.navigator.standalone === true;
}

function getInstallAvailabilityContext() {
  const userAgent = String(window.navigator.userAgent || "");
  const isIOS = /iPad|iPhone|iPod/i.test(userAgent);
  const isAndroid = /Android/i.test(userAgent);
  const isSafari = isIOS && /Safari/i.test(userAgent) && !/(CriOS|FxiOS|EdgiOS|OPiOS|Instagram|FBAN|FBAV)/i.test(userAgent);
  const isInAppBrowser = /(FBAN|FBAV|Instagram|Line\/|; wv\)| wv\b|TikTok|Snapchat|Twitter)/i.test(userAgent);
  const isMobile = isMobileViewport() || isIOS || isAndroid;
  const isInstalled = isStandaloneDisplayMode();

  return {
    isMobile,
    isIOS,
    isAndroid,
    isSafari,
    isInAppBrowser,
    isInstalled,
    canPrompt: Boolean(deferredInstallPrompt)
  };
}

function updateInstallButtonCopy(installContext = getInstallAvailabilityContext()) {
  if (!installAppBtn) {
    return;
  }

  const iconName = installContext.isIOS ? "bi-share" : "bi-download";
  installAppBtn.innerHTML = `<i class="bi ${iconName}"></i> Instalar app`;
}

function toDateInputValue(date) {
  const d = date instanceof Date ? date : new Date();
  if (Number.isNaN(d.getTime())) {
    return "";
  }
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function parseDateParts(rawDate) {
  const value = String(rawDate || "").trim();
  if (!value) {
    return null;
  }

  let year = "";
  let month = "";
  let day = "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    [year, month, day] = value.split("-");
  } else {
    const normalized = value.replace(/[.\-]/g, "/");
    const match = normalized.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!match) {
      return null;
    }
    [, day, month, year] = match;
  }

  const parsedYear = Number(year);
  const parsedMonth = Number(month);
  const parsedDay = Number(day);
  if (!Number.isInteger(parsedYear) || !Number.isInteger(parsedMonth) || !Number.isInteger(parsedDay)) {
    return null;
  }

  const date = new Date(parsedYear, parsedMonth - 1, parsedDay);
  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== parsedYear ||
    date.getMonth() !== parsedMonth - 1 ||
    date.getDate() !== parsedDay
  ) {
    return null;
  }

  return {
    year: parsedYear,
    month: parsedMonth,
    day: parsedDay
  };
}

function formatDateFromParts(parts) {
  if (!parts) {
    return "";
  }

  return `${String(parts.day).padStart(2, "0")}/${String(parts.month).padStart(2, "0")}/${String(parts.year).padStart(4, "0")}`;
}

function formatDateForForm(rawDate, fallback = formatDateFromParts(parseDateParts(toDateInputValue(new Date())))) {
  const parts = parseDateParts(rawDate);
  return parts ? formatDateFromParts(parts) : fallback;
}

function formatDateInputTyping(rawValue) {
  const digits = String(rawValue || "").replace(/\D/g, "").slice(0, 8);
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);
  const parts = [day, month, year].filter(Boolean);
  return parts.join("/");
}

function hasValidItemDate(rawDate) {
  return Boolean(parseDateParts(rawDate));
}

function getCurrentMonthKey(dateLike = new Date()) {
  const date = dateLike instanceof Date ? dateLike : new Date(dateLike);
  if (Number.isNaN(date.getTime())) {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function normalizeMonthKey(rawMonth) {
  const value = String(rawMonth || "").trim();
  const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(value);
  return match ? `${match[1]}-${match[2]}` : getCurrentMonthKey();
}

function getMonthHistoryState() {
  const value = String(getHistoryStateObject().dinariaMonth || "").trim();
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(value) ? value : "";
}

function syncMonthHistoryState(monthKey = state.activeMonth, { replace = false } = {}) {
  const normalizedMonth = normalizeMonthKey(monthKey);
  const nextState = {
    ...getHistoryStateObject(),
    dinariaMonth: normalizedMonth
  };

  if (replace) {
    history.replaceState(nextState, "", location.href);
    return;
  }

  history.pushState(nextState, "", location.href);
}

function compareMonthKeys(monthA, monthB) {
  return normalizeMonthKey(monthA).localeCompare(normalizeMonthKey(monthB));
}

function shiftMonthKey(monthKey, offset) {
  const [year, month] = normalizeMonthKey(monthKey).split("-").map(Number);
  const shifted = new Date(year, (month - 1) + Number(offset || 0), 1);
  return getCurrentMonthKey(shifted);
}

function getMonthKeyFromItem(itemOrDate) {
  const rawDate = typeof itemOrDate === "string" ? itemOrDate : itemOrDate?.date;
  return normalizeItemDate(rawDate).slice(0, 7);
}

function formatMonthLabel(monthKey) {
  const [year, month] = normalizeMonthKey(monthKey).split("-").map(Number);
  const date = new Date(year, month - 1, 1);
  const label = date.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function getMonthStatusLabel(monthKey) {
  const currentMonthKey = getCurrentMonthKey();
  const comparison = compareMonthKeys(monthKey, currentMonthKey);
  if (comparison === 0) {
    return "Mes actual";
  }
  return comparison < 0 ? "Historial" : "Proyeccion";
}

function getDayFromDate(rawDate) {
  const parts = parseDateParts(rawDate);
  return parts ? parts.day : 1;
}

function buildDateForMonth(rawDate, monthKey) {
  const day = getDayFromDate(rawDate);
  const [year, month] = normalizeMonthKey(monthKey).split("-").map(Number);
  const maxDay = new Date(year, month, 0).getDate();
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(Math.min(day, maxDay)).padStart(2, "0")}`;
}

function getMonthReferenceDate(monthKey = state.activeMonth) {
  const normalizedMonth = normalizeMonthKey(monthKey);
  const [year, month] = normalizedMonth.split("-").map(Number);
  const today = new Date();
  const maxDay = new Date(year, month, 0).getDate();
  const day = normalizedMonth === getCurrentMonthKey(today)
    ? today.getDate()
    : Math.min(today.getDate(), maxDay);
  return new Date(year, month - 1, Math.min(day, maxDay));
}

function isActiveMonthCurrent() {
  return normalizeMonthKey(state.activeMonth) === getCurrentMonthKey();
}

function isViewingPastMonth(monthKey = state.activeMonth) {
  return compareMonthKeys(normalizeMonthKey(monthKey), getCurrentMonthKey()) < 0;
}

function getEarliestHistoryMonth() {
  const monthCandidates = [];

  for (const item of state.items || []) {
    const itemMonth = getMonthKeyFromItem(item);
    if (itemMonth) {
      monthCandidates.push(itemMonth);
    }
  }

  for (const monthKey of Object.keys(state.monthlySalaries || {})) {
    const amount = Number((state.monthlySalaries || {})[monthKey] || 0);
    if (Number.isFinite(amount) && amount > 0) {
      monthCandidates.push(normalizeMonthKey(monthKey));
    }
  }

  if (!monthCandidates.length) {
    return getCurrentMonthKey();
  }

  return monthCandidates.sort()[0];
}

function getMonthNavigationBounds() {
  const currentMonth = getCurrentMonthKey();
  return {
    minMonth: getEarliestHistoryMonth(),
    maxMonth: shiftMonthKey(currentMonth, 24)
  };
}

function clampNavigableMonth(monthKey) {
  const normalizedMonth = normalizeMonthKey(monthKey);
  const { minMonth, maxMonth } = getMonthNavigationBounds();
  if (compareMonthKeys(normalizedMonth, minMonth) < 0) {
    return minMonth;
  }
  if (compareMonthKeys(normalizedMonth, maxMonth) > 0) {
    return maxMonth;
  }
  return normalizedMonth;
}

function normalizeItemDate(rawDate) {
  const parts = parseDateParts(rawDate);
  if (parts) {
    return `${String(parts.year).padStart(4, "0")}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
  }
  return toDateInputValue(new Date());
}

function normalizeDateFilterValue(rawValue) {
  const value = String(rawValue || "").trim();
  const valid = new Set(["all", "today", "last7", "last30", "thisMonth", "lastMonth"]);
  return valid.has(value) ? value : "all";
}

function getStartOfDay(dateLike) {
  const date = dateLike instanceof Date ? new Date(dateLike.getTime()) : new Date(dateLike);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  date.setHours(0, 0, 0, 0);
  return date;
}

function passesDateFilter(itemDateRaw, filterRaw) {
  const filter = normalizeDateFilterValue(filterRaw);
  if (filter === "all") {
    return true;
  }

  const itemDate = getStartOfDay(`${normalizeItemDate(itemDateRaw)}T00:00:00`);
  if (!isActiveMonthCurrent()) {
    return true;
  }

  const today = getStartOfDay(getMonthReferenceDate(state.activeMonth));
  if (!itemDate || !today) {
    return false;
  }

  if (filter === "today") {
    return itemDate.getTime() === today.getTime();
  }

  if (filter === "last7") {
    const from = new Date(today.getTime());
    from.setDate(from.getDate() - 6);
    return itemDate >= from && itemDate <= today;
  }

  if (filter === "last30") {
    const from = new Date(today.getTime());
    from.setDate(from.getDate() - 29);
    return itemDate >= from && itemDate <= today;
  }

  if (filter === "thisMonth") {
    return itemDate.getFullYear() === today.getFullYear() && itemDate.getMonth() === today.getMonth();
  }

  if (filter === "lastMonth") {
    const lastMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    return (
      itemDate.getFullYear() === lastMonthDate.getFullYear() &&
      itemDate.getMonth() === lastMonthDate.getMonth()
    );
  }

  return true;
}

function formatItemDate(rawDate) {
  const normalized = normalizeItemDate(rawDate);
  const parsed = new Date(`${normalized}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return normalized;
  }
  return parsed.toLocaleDateString("es-AR");
}

function normalizeItemCreatedAt(rawValue, fallbackDate = "") {
  const value = String(rawValue || "").trim();
  if (value) {
    const parsedValue = new Date(value);
    if (!Number.isNaN(parsedValue.getTime())) {
      return parsedValue.toISOString();
    }
  }

  const normalizedFallbackDate = String(fallbackDate || "").trim();
  if (!normalizedFallbackDate) {
    return "";
  }

  const parsedFallback = new Date(`${normalizeItemDate(normalizedFallbackDate)}T12:00:00`);
  return Number.isNaN(parsedFallback.getTime()) ? "" : parsedFallback.toISOString();
}

function formatItemCreatedTime(rawValue, fallbackDate = "") {
  const normalizedValue = normalizeItemCreatedAt(rawValue, fallbackDate);
  if (!normalizedValue) {
    return "";
  }

  const parsed = new Date(normalizedValue);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function getCategoryConfig(categoryKey) {
  const key = normalizeCategoryKey(categoryKey);
  return CATEGORY_CONFIG[key] || CATEGORY_CONFIG[FALLBACK_CATEGORY_KEY];
}

function getCategorySymbol(categoryKey, movementType = "expense") {
  const normalizedType = normalizeMovementType(movementType);
  const normalizedKey = normalizeCategoryKeyForType(categoryKey, normalizedType);
  const iconMap = {
    vivienda: "home_work",
    servicios: "bolt",
    alimentacion: "shopping_cart",
    transporte: "directions_car",
    salud: "health_and_safety",
    finanzas: "account_balance_wallet",
    educacion: "menu_book",
    compras: "shopping_bag",
    ocio: "sports_esports",
    ahorro: "savings",
    impuestos: "receipt_long",
    otros: "inventory_2",
    sueldo: "payments",
    freelance: "work",
    ventas: "storefront",
    bonos: "trending_up",
    inversiones: "show_chart",
    reintegros: "replay",
    regalos: "redeem",
    otros_ingresos: "attach_money"
  };

  return iconMap[normalizedKey] || (normalizedType === "income" ? "payments" : "receipt_long");
}

function getRecurringSeriesId(item) {
  if (!item) {
    return "";
  }
  return String(item.recurringSeriesId || item.id || "").trim();
}

function getRecurringSeriesSourceMonth(item) {
  const fallbackMonth = normalizeMonthKey(item?.recurringSourceMonth || getMonthKeyFromItem(item));
  const seriesId = getRecurringSeriesId(item);
  if (!seriesId || !Array.isArray(state?.items)) {
    return fallbackMonth;
  }

  let earliestMonth = fallbackMonth;
  for (const entry of state.items) {
    if (getRecurringSeriesId(entry) !== seriesId) {
      continue;
    }

    const entryMonth = normalizeMonthKey(entry?.recurringSourceMonth || getMonthKeyFromItem(entry));
    if (!earliestMonth || compareMonthKeys(entryMonth, earliestMonth) < 0) {
      earliestMonth = entryMonth;
    }
  }

  return earliestMonth || fallbackMonth;
}

function getRecurringSeriesTerminalMonth(item) {
  const seriesId = getRecurringSeriesId(item);
  const fallbackEndMonth = (() => {
    const directEndMonth = getRecurringEndMonth(item);
    if (directEndMonth) {
      return directEndMonth;
    }

    const storedMonths = getRecurringSeriesMonths(item);
    return storedMonths ? shiftMonthKey(getMonthKeyFromItem(item), storedMonths - 1) : "";
  })();

  if (!seriesId || !Array.isArray(state?.items)) {
    return fallbackEndMonth;
  }

  let latestEndMonth = fallbackEndMonth;
  for (const entry of state.items) {
    if (!entry?.isRecurring || getRecurringSeriesId(entry) !== seriesId) {
      continue;
    }

    const entryEndMonth = (() => {
      const directEndMonth = getRecurringEndMonth(entry);
      if (directEndMonth) {
        return directEndMonth;
      }

      const storedMonths = getRecurringSeriesMonths(entry);
      return storedMonths ? shiftMonthKey(getMonthKeyFromItem(entry), storedMonths - 1) : "";
    })();

    if (!entryEndMonth) {
      return "";
    }

    if (!latestEndMonth || compareMonthKeys(entryEndMonth, latestEndMonth) > 0) {
      latestEndMonth = entryEndMonth;
    }
  }

  return latestEndMonth;
}

function getItemInsertionOrderMap() {
  const itemOrder = new Map();

  state.items.forEach((item, index) => {
    const itemId = String(item?.id || "").trim();
    if (itemId) {
      itemOrder.set(itemId, index);
    }

    const seriesId = String(item?.recurringSeriesId || "").trim();
    if (seriesId) {
      itemOrder.set(seriesId, index);
    }
  });

  return itemOrder;
}

function getItemInsertionOrder(item, itemOrder = getItemInsertionOrderMap()) {
  const sortAnchorId = String(item?.sortAnchorId || "").trim();
  if (sortAnchorId && itemOrder.has(sortAnchorId)) {
    return itemOrder.get(sortAnchorId);
  }

  const itemId = String(item?.id || "").trim();
  if (itemId && itemOrder.has(itemId)) {
    return itemOrder.get(itemId);
  }

  const seriesId = getRecurringSeriesId(item);
  if (seriesId && itemOrder.has(seriesId)) {
    return itemOrder.get(seriesId);
  }

  return -1;
}

function compareItemsByNewestFirst(a, b, itemOrder = getItemInsertionOrderMap()) {
  return getItemInsertionOrder(b, itemOrder) - getItemInsertionOrder(a, itemOrder);
}

function clampRecurringMonths(rawValue, { min = 1, max = 24, fallback = 12 } = {}) {
  const numericValue = Math.round(Number(rawValue));
  if (!Number.isFinite(numericValue)) {
    return fallback;
  }
  return Math.max(min, Math.min(max, numericValue));
}

function getStandardRecurringDurationValues() {
  return [3, 6, 12, 24];
}

function normalizeRecurringDurationSelectionValue(rawValue) {
  const value = String(rawValue || "").trim().toLowerCase();
  if (value === "always") {
    return "always";
  }
  return String(clampRecurringMonths(value));
}

function parseRecurringDurationSelection(rawValue) {
  const normalizedValue = normalizeRecurringDurationSelectionValue(rawValue);
  return normalizedValue === "always" ? "always" : clampRecurringMonths(normalizedValue);
}

function buildRecurringDurationOptionsMarkup(selectedValue = "12") {
  const normalizedValue = normalizeRecurringDurationSelectionValue(selectedValue);
  const numericValue = normalizedValue === "always" ? null : Number(normalizedValue);
  const values = [...getStandardRecurringDurationValues()];

  if (numericValue && !values.includes(numericValue)) {
    values.push(numericValue);
    values.sort((a, b) => a - b);
  }

  const finiteOptions = values.map((months) => {
    const label = months === 1 ? "1 mes" : `${months} meses`;
    const selected = numericValue === months ? " selected" : "";
    return `<option value="${months}"${selected}>${label}</option>`;
  });

  const alwaysSelected = normalizedValue === "always" ? " selected" : "";
  finiteOptions.push(`<option value="always"${alwaysSelected}>Hasta cancelarlo</option>`);
  return finiteOptions.join("");
}

function populateRecurringDurationOptions(select, selectedValue = "12") {
  if (!(select instanceof HTMLSelectElement)) {
    return;
  }

  const normalizedValue = normalizeRecurringDurationSelectionValue(selectedValue);
  select.innerHTML = buildRecurringDurationOptionsMarkup(normalizedValue);
  select.value = normalizedValue;
}

function normalizeStatusFilterValue(rawValue) {
  const value = String(rawValue || "").trim();
  return value === "recurring" || value === "oneTime" ? value : "all";
}

function normalizeRecurringEndMonth(rawMonth) {
  const value = String(rawMonth || "").trim();
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(value) ? normalizeMonthKey(value) : "";
}

function getMonthOffsetBetween(startMonth, endMonth) {
  const [startYear, startMonthNumber] = normalizeMonthKey(startMonth).split("-").map(Number);
  const [endYear, endMonthNumber] = normalizeMonthKey(endMonth).split("-").map(Number);
  return ((endYear - startYear) * 12) + (endMonthNumber - startMonthNumber);
}

function getRecurringEndMonth(item) {
  return normalizeRecurringEndMonth(item?.recurringEndMonth);
}

function getRecurringSeriesMonths(item) {
  const rawValue = Number(item?.recurringMonths);
  return Number.isFinite(rawValue) ? clampRecurringMonths(rawValue, { min: 1, fallback: 1 }) : null;
}

function getRecurringRemainingMonths(item, fromMonthKey = getMonthKeyFromItem(item)) {
  const endMonth = getRecurringEndMonth(item);
  if (endMonth) {
    return Math.max(1, getMonthOffsetBetween(fromMonthKey, endMonth) + 1);
  }

  const storedMonths = getRecurringSeriesMonths(item);
  return storedMonths ?? 12;
}

function getRecurringDurationSelectionForItem(item, fromMonthKey = getMonthKeyFromItem(item)) {
  if (!getRecurringEndMonth(item) && !getRecurringSeriesMonths(item)) {
    return "always";
  }

  return String(clampRecurringMonths(getRecurringRemainingMonths(item, fromMonthKey)));
}

function setRecurringWindow(item, startMonthKey, months) {
  const normalizedMonths = clampRecurringMonths(months, { min: 1, fallback: 1 });
  item.recurringMonths = normalizedMonths;
  item.recurringEndMonth = shiftMonthKey(startMonthKey, normalizedMonths - 1);
}

function clearRecurringWindow(item) {
  delete item.recurringMonths;
  delete item.recurringEndMonth;
}

function populateMobileRecurringDurationOptions() {
  populateRecurringDurationOptions(mobileQuickEntryRecurringMonths, mobileQuickEntryRecurringMonths?.value || "12");
}

function syncRecurringDurationVisibility({ isProjected = Boolean(editingProjectedItem) } = {}) {
  if (
    !recurringMonthsWrap
    || !(recurringInput instanceof HTMLInputElement)
    || !(recurringMonthsInput instanceof HTMLSelectElement)
  ) {
    return;
  }

  const shouldShow = !isProjected && recurringInput.checked;
  recurringMonthsWrap.classList.toggle("is-hidden", !shouldShow);
  recurringMonthsInput.disabled = !shouldShow;
}

function getRecurringDisplayMeta(item, monthKey = getMonthKeyFromItem(item)) {
  if (!item?.isRecurring) {
    return {
      label: "Puntual",
      title: "Movimiento puntual del mes"
    };
  }

  const sourceMonth = getRecurringSeriesSourceMonth(item);
  const selectedMonth = normalizeMonthKey(monthKey);
  const endMonth = getRecurringSeriesTerminalMonth(item);
  const totalMonths = endMonth
    ? Math.max(1, getMonthOffsetBetween(sourceMonth, endMonth) + 1)
    : getRecurringSeriesMonths(item);

  if (!totalMonths) {
    return {
      label: "Mensual",
      title: "Se repite cada mes hasta cancelarlo"
    };
  }

  const currentOccurrence = Math.max(1, Math.min(totalMonths, getMonthOffsetBetween(sourceMonth, selectedMonth) + 1));
  return {
    label: `${currentOccurrence}/${totalMonths}`,
    title: `Se repite cada mes · ${currentOccurrence} de ${totalMonths}`
  };
}

function isRecurringItemActiveForMonth(item, monthKey) {
  if (!item?.isRecurring) {
    return false;
  }

  const selectedMonth = normalizeMonthKey(monthKey);
  const startMonth = getMonthKeyFromItem(item);
  if (compareMonthKeys(startMonth, selectedMonth) > 0) {
    return false;
  }

  const endMonth = getRecurringEndMonth(item);
  return !endMonth || compareMonthKeys(selectedMonth, endMonth) <= 0;
}

function limitRecurringSeriesBeforeMonth(seriesId, monthKey) {
  const normalizedSeriesId = String(seriesId || "").trim();
  const normalizedMonth = normalizeMonthKey(monthKey);
  if (!normalizedSeriesId) {
    return;
  }

  const cutoffMonth = shiftMonthKey(normalizedMonth, -1);
  state.items.forEach((entry) => {
    if (!entry?.isRecurring || getRecurringSeriesId(entry) !== normalizedSeriesId) {
      return;
    }

    if (compareMonthKeys(getMonthKeyFromItem(entry), normalizedMonth) >= 0) {
      return;
    }

    const currentEndMonth = getRecurringEndMonth(entry);
    if (!currentEndMonth || compareMonthKeys(currentEndMonth, cutoffMonth) > 0) {
      entry.recurringEndMonth = cutoffMonth;
    }
  });
}

function passesStatusFilter(item, filterRaw) {
  const filter = normalizeStatusFilterValue(filterRaw);
  if (filter === "all") {
    return true;
  }

  return filter === "recurring" ? Boolean(item?.isRecurring) : !item?.isRecurring;
}

function isRecurringSkippedForMonth(seriesId, monthKey) {
  return Array.isArray(state.recurringSkips)
    && state.recurringSkips.some((entry) => entry?.seriesId === seriesId && entry?.month === normalizeMonthKey(monthKey));
}

function addRecurringSkip(seriesId, monthKey) {
  const normalizedSeriesId = String(seriesId || "").trim();
  const normalizedMonth = normalizeMonthKey(monthKey);
  if (!normalizedSeriesId) {
    return;
  }

  if (!Array.isArray(state.recurringSkips)) {
    state.recurringSkips = [];
  }

  const alreadySkipped = state.recurringSkips.some((entry) => entry?.seriesId === normalizedSeriesId && entry?.month === normalizedMonth);
  if (!alreadySkipped) {
    state.recurringSkips.push({
      seriesId: normalizedSeriesId,
      month: normalizedMonth
    });
  }
}

function removeRecurringSkip(seriesId, monthKey) {
  const normalizedSeriesId = String(seriesId || "").trim();
  const normalizedMonth = normalizeMonthKey(monthKey);
  if (!normalizedSeriesId) {
    return;
  }

  state.recurringSkips = Array.isArray(state.recurringSkips)
    ? state.recurringSkips.filter((entry) => !(entry?.seriesId === normalizedSeriesId && entry?.month === normalizedMonth))
    : [];
}

function findLatestRecurringSourceItem(seriesId, monthKey) {
  const normalizedSeriesId = String(seriesId || "").trim();
  const normalizedMonth = normalizeMonthKey(monthKey);
  let latest = null;

  if (!normalizedSeriesId) {
    return null;
  }

  for (const entry of state.items) {
    if (!entry?.isRecurring || getRecurringSeriesId(entry) !== normalizedSeriesId) {
      continue;
    }

    if (!isRecurringItemActiveForMonth(entry, normalizedMonth)) {
      continue;
    }

    const entryMonth = getMonthKeyFromItem(entry);
    if (!latest || compareMonthKeys(getMonthKeyFromItem(latest), entryMonth) < 0) {
      latest = entry;
    }
  }

  return latest;
}

function getMonthSalary(monthKey = state.activeMonth) {
  const normalizedMonth = normalizeMonthKey(monthKey);
  const currentMonthKey = getCurrentMonthKey();
  const monthlySalaries = { ...(state.monthlySalaries || {}) };

  if (
    !Object.prototype.hasOwnProperty.call(monthlySalaries, currentMonthKey) &&
    Number(state.salary || 0) > 0
  ) {
    monthlySalaries[currentMonthKey] = Math.max(0, Number(state.salary || 0));
  }

  if (Object.prototype.hasOwnProperty.call(monthlySalaries, normalizedMonth)) {
    return Math.max(0, Number(monthlySalaries[normalizedMonth] || 0));
  }

  return 0;
}

function setMonthSalary(monthKey, amount) {
  const normalizedMonth = normalizeMonthKey(monthKey);
  if (!state.monthlySalaries || typeof state.monthlySalaries !== "object") {
    state.monthlySalaries = {};
  }
  state.monthlySalaries[normalizedMonth] = Math.max(0, Number(amount || 0));
  if (normalizedMonth === getCurrentMonthKey()) {
    state.salary = state.monthlySalaries[normalizedMonth];
  }
}

function getMonthScopedExpenseItems(monthKey = state.activeMonth) {
  const selectedMonth = normalizeMonthKey(monthKey);
  const visibleItems = [];
  const latestRecurringBySeries = new Map();
  const actualRecurringSeries = new Set();
  const allowProjectedRecurring = compareMonthKeys(selectedMonth, getCurrentMonthKey()) >= 0;

  for (const item of state.items) {
    if (normalizeMovementType(item.type) !== "expense") {
      continue;
    }

    const itemMonth = getMonthKeyFromItem(item);
    const seriesId = item.isRecurring ? getRecurringSeriesId(item) : "";

    if (isRecurringItemActiveForMonth(item, selectedMonth)) {
      const latest = latestRecurringBySeries.get(seriesId);
      if (!latest || compareMonthKeys(getMonthKeyFromItem(latest), itemMonth) < 0) {
        latestRecurringBySeries.set(seriesId, item);
      }
    }

    if (itemMonth === selectedMonth) {
      visibleItems.push({ ...item, isProjectedRecurring: false });
      if (item.isRecurring && seriesId) {
        actualRecurringSeries.add(seriesId);
      }
    }
  }

  for (const [seriesId, sourceItem] of latestRecurringBySeries.entries()) {
    if (!allowProjectedRecurring) {
      continue;
    }
    const sourceItemMonth = getMonthKeyFromItem(sourceItem);
    const sourceMonth = getRecurringSeriesSourceMonth(sourceItem);
    if (compareMonthKeys(sourceItemMonth, selectedMonth) >= 0) {
      continue;
    }
    if (actualRecurringSeries.has(seriesId) || isRecurringSkippedForMonth(seriesId, selectedMonth)) {
      continue;
    }

    visibleItems.push({
      ...sourceItem,
      id: `projection:${seriesId}:${selectedMonth}`,
      date: buildDateForMonth(sourceItem.date, selectedMonth),
      recurringSourceMonth: sourceMonth,
      recurringSeriesId: seriesId,
      isProjectedRecurring: true
    });
  }

  const itemOrder = getItemInsertionOrderMap();
  return visibleItems.sort((a, b) => compareItemsByNewestFirst(a, b, itemOrder));
}

function getVisibleMonthExpenseItems(monthKey = state.activeMonth) {
  return getMonthScopedExpenseItems(monthKey);
}

function getVisibleMonthIncomeItems(monthKey = state.activeMonth) {
  const selectedMonth = normalizeMonthKey(monthKey);
  const visibleItems = [];
  const latestRecurringBySeries = new Map();
  const actualRecurringSeries = new Set();
  const allowProjectedRecurring = compareMonthKeys(selectedMonth, getCurrentMonthKey()) >= 0;

  for (const item of state.items) {
    if (normalizeMovementType(item.type) !== "income") {
      continue;
    }

    const itemMonth = getMonthKeyFromItem(item);
    const seriesId = item.isRecurring ? getRecurringSeriesId(item) : "";

    if (isRecurringItemActiveForMonth(item, selectedMonth)) {
      const latest = latestRecurringBySeries.get(seriesId);
      if (!latest || compareMonthKeys(getMonthKeyFromItem(latest), itemMonth) < 0) {
        latestRecurringBySeries.set(seriesId, item);
      }
    }

    if (itemMonth === selectedMonth) {
      visibleItems.push({ ...item, isProjectedRecurring: false });
      if (item.isRecurring && seriesId) {
        actualRecurringSeries.add(seriesId);
      }
    }
  }

  for (const [seriesId, sourceItem] of latestRecurringBySeries.entries()) {
    if (!allowProjectedRecurring) {
      continue;
    }
    const sourceItemMonth = getMonthKeyFromItem(sourceItem);
    const sourceMonth = getRecurringSeriesSourceMonth(sourceItem);
    if (compareMonthKeys(sourceItemMonth, selectedMonth) >= 0) {
      continue;
    }
    if (actualRecurringSeries.has(seriesId) || isRecurringSkippedForMonth(seriesId, selectedMonth)) {
      continue;
    }

    visibleItems.push({
      ...sourceItem,
      id: `projection:${seriesId}:${selectedMonth}`,
      date: buildDateForMonth(sourceItem.date, selectedMonth),
      recurringSourceMonth: sourceMonth,
      recurringSeriesId: seriesId,
      isProjectedRecurring: true
    });
  }

  const itemOrder = getItemInsertionOrderMap();
  return visibleItems.sort((a, b) => compareItemsByNewestFirst(a, b, itemOrder));
}

function getMonthExpenseSummary(monthKey = state.activeMonth) {
  const monthItems = getVisibleMonthExpenseItems(monthKey);
  const recurringCount = monthItems.filter((item) => item.isRecurring).length;
  const oneTimeCount = monthItems.filter((item) => !item.isRecurring).length;
  const projectedRecurringCount = monthItems.filter((item) => item.isProjectedRecurring).length;
  const hasSalary = getMonthSalary(monthKey) > 0;

  return {
    monthItems,
    recurringCount,
    oneTimeCount,
    projectedRecurringCount,
    hasSalary
  };
}

function getCategoryKeysForType(movementType) {
  return normalizeMovementType(movementType) === "income" ? INCOME_CATEGORY_KEYS : EXPENSE_CATEGORY_KEYS;
}

function getDefaultCategoryKeyForType(movementType) {
  return normalizeMovementType(movementType) === "income"
    ? DEFAULT_INCOME_CATEGORY_KEY
    : DEFAULT_EXPENSE_CATEGORY_KEY;
}

function normalizeCategoryKeyForType(rawCategory, movementType) {
  const normalized = normalizeCategoryKey(rawCategory);
  if (normalizeMovementType(movementType) === "income") {
    return INCOME_CATEGORY_CONFIG[normalized] ? normalized : DEFAULT_INCOME_CATEGORY_KEY;
  }
  return EXPENSE_CATEGORY_CONFIG[normalized] ? normalized : DEFAULT_EXPENSE_CATEGORY_KEY;
}

function parseHexColor(hexColor) {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(String(hexColor || "").trim());
  if (!match) {
    return null;
  }
  return {
    r: parseInt(match[1], 16),
    g: parseInt(match[2], 16),
    b: parseInt(match[3], 16)
  };
}

function rgbToHex({ r, g, b }) {
  const toHex = (value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function mixHexColors(sourceHex, targetHex, targetWeight) {
  const source = parseHexColor(sourceHex);
  const target = parseHexColor(targetHex);
  if (!source || !target) {
    return sourceHex;
  }
  const w = Math.max(0, Math.min(1, Number(targetWeight) || 0));
  return rgbToHex({
    r: source.r * (1 - w) + target.r * w,
    g: source.g * (1 - w) + target.g * w,
    b: source.b * (1 - w) + target.b * w
  });
}

function getRelativeLuminance(hexColor) {
  const rgb = parseHexColor(hexColor);
  if (!rgb) {
    return 0;
  }
  const normalize = (value) => {
    const channel = value / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  };
  const r = normalize(rgb.r);
  const g = normalize(rgb.g);
  const b = normalize(rgb.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getContrastRatio(hexA, hexB) {
  const l1 = getRelativeLuminance(hexA);
  const l2 = getRelativeLuminance(hexB);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function buildCategoryChipPalette(baseHexColor) {
  const base = parseHexColor(baseHexColor) ? baseHexColor : "#2563eb";
  const background = mixHexColors(base, "#ffffff", 0.84);
  let border = mixHexColors(base, "#0f172a", 0.18);
  let text = mixHexColors(base, "#0f172a", 0.36);

  let attempts = 0;
  while (getContrastRatio(text, background) < 4.5 && attempts < 6) {
    text = mixHexColors(text, "#0f172a", 0.24);
    attempts += 1;
  }

  if (getContrastRatio(border, background) < 2.2) {
    border = mixHexColors(base, "#0f172a", 0.28);
  }

  return {
    background,
    border,
    text
  };
}

function styleCategoryChip(chip, categoryKey) {
  if (!(chip instanceof HTMLElement)) {
    return;
  }
  const category = getCategoryConfig(categoryKey);
  const palette = buildCategoryChipPalette(category.color);
  chip.style.setProperty("background", palette.background, "important");
  chip.style.setProperty("border", `1px solid ${palette.border}`, "important");
  chip.style.setProperty("color", palette.text, "important");
}

function populateCategoryControls() {
  if (!categoryInput || !categoryFilter || !categoryFilterMenu) {
    return;
  }

  const movementType = normalizeMovementType(typeInput?.value || pendingMovementType || "expense");
  const inputCategoryKeys = getCategoryKeysForType(movementType);
  const selectedInputRaw = normalizeCategoryKey(categoryInput.value || getDefaultCategoryKeyForType(movementType));
  const selectedInput = inputCategoryKeys.includes(selectedInputRaw)
    ? selectedInputRaw
    : getDefaultCategoryKeyForType(movementType);
  const selectedFilterRaw = String(categoryFilter.value || "all").trim().toLowerCase();
  const selectedFilter = selectedFilterRaw === "all" || CATEGORY_CONFIG[selectedFilterRaw] ? selectedFilterRaw : "all";

  categoryInput.innerHTML = "";
  categoryFilter.innerHTML = "";
  categoryFilterMenu.innerHTML = "";

  const searchWrap = document.createElement("div");
  searchWrap.className = "menu-search-wrap";

  const searchInput = document.createElement("input");
  searchInput.className = "menu-search-input category-filter-search-input";
  searchInput.type = "search";
  searchInput.placeholder = "Buscar categoria";
  searchInput.autocomplete = "off";
  searchInput.setAttribute("aria-label", "Buscar categoria");
  searchWrap.appendChild(searchInput);

  const optionsWrap = document.createElement("div");
  optionsWrap.className = "category-filter-options";

  const emptyState = document.createElement("p");
  emptyState.className = "category-filter-empty is-hidden";
  emptyState.textContent = "No encontramos categorias.";

  categoryFilterMenu.appendChild(searchWrap);
  categoryFilterMenu.appendChild(optionsWrap);
  categoryFilterMenu.appendChild(emptyState);

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "Todas";
  categoryFilter.appendChild(allOption);

  const allMenuItem = document.createElement("button");
  allMenuItem.className = "menu-item category-filter-option";
  allMenuItem.type = "button";
  allMenuItem.dataset.categoryValue = "all";
  allMenuItem.setAttribute("role", "menuitem");
  allMenuItem.textContent = "Todas";
  optionsWrap.appendChild(allMenuItem);

  for (const key of inputCategoryKeys) {
    const config = CATEGORY_CONFIG[key];

    const formOption = document.createElement("option");
    formOption.value = key;
    formOption.textContent = config.label;
    categoryInput.appendChild(formOption);
  }

  for (const key of CATEGORY_KEYS) {
    const config = CATEGORY_CONFIG[key];

    const filterOption = document.createElement("option");
    filterOption.value = key;
    filterOption.textContent = config.label;
    categoryFilter.appendChild(filterOption);

    const menuItem = document.createElement("button");
    menuItem.className = "menu-item category-filter-option";
    menuItem.type = "button";
    menuItem.dataset.categoryValue = key;
    menuItem.setAttribute("role", "menuitem");
    menuItem.textContent = config.label;
    optionsWrap.appendChild(menuItem);
  }

  categoryInput.value = CATEGORY_CONFIG[selectedInput] ? selectedInput : DEFAULT_CATEGORY_KEY;
  categoryFilter.value = selectedFilter;
  updateCategoryFilterMenuSelection();
  filterCategoryFilterMenuOptions("");
}

function closeModal() {
  const wasOpen = expenseModal.classList.contains("show");
  expenseModal.classList.remove("show");
  expenseModal.setAttribute("aria-hidden", "true");
  editingItemId = null;
  editingProjectedItem = null;
  expenseForm.reset();
  if (typeInput) {
    typeInput.value = "expense";
  }
  pendingMovementType = "expense";
  if (dateInput) {
    dateInput.value = formatDateForForm(toDateInputValue(new Date()));
  }
  populateCategoryControls();
  if (categoryInput) {
    categoryInput.value = getDefaultCategoryKeyForType("expense");
  }
  if (recurringInput) {
    recurringInput.checked = false;
  }
  if (recurringMonthsInput) {
    populateRecurringDurationOptions(recurringMonthsInput, "12");
  }
  syncRecurringDurationVisibility({ isProjected: false });
  applyExpenseRecurringEditRestrictions({ isRecurringEdit: false });
  expenseEditScope = "thisMonth";
  if (expenseEditScopeWrap) {
    expenseEditScopeWrap.classList.add("is-hidden");
  }
  updateExpenseEditScopeSelection();
  setExpenseFormMode("create");
  syncMovementTypeTabs("expense");
  updateOverlayScrollLock();

  if (wasOpen && modalTrigger) {
    modalTrigger.focus();
  }

  modalTrigger = null;
}

function setExpenseFormMode(mode) {
  const isEdit = mode === "edit";
  const movementType = normalizeMovementType(typeInput?.value || pendingMovementType || "expense");
  const movementLabel = movementType === "income" ? "ingreso" : "gasto";

  if (modalTitle) {
    modalTitle.textContent = isEdit ? `Editar ${movementLabel}` : `Agregar ${movementLabel}`;
  }

  if (expenseSubmitBtn) {
    expenseSubmitBtn.innerHTML = isEdit
      ? '<i class="bi bi-check2-circle"></i> Guardar cambios'
      : `<i class="bi bi-check2-circle"></i> Guardar ${movementLabel}`;
  }

  if (recurringInput) {
    const recurringLabel = recurringInput.closest(".recurring-toggle");
    if (recurringLabel instanceof HTMLElement) {
      recurringLabel.classList.remove("is-hidden");
    }
    recurringInput.disabled = false;
  }

  if (dateInput instanceof HTMLInputElement) {
    dateInput.disabled = false;
    dateInput.removeAttribute("aria-readonly");
  }

  if (recurringMonthsInput instanceof HTMLSelectElement) {
    recurringMonthsInput.disabled = !Boolean(recurringInput?.checked);
  }
}

function syncMovementTypeTabs(movementType) {
  const normalizedType = normalizeMovementType(movementType);
  movementTypeTabButtons.forEach((button) => {
    const isSelected = normalizeMovementType(button.dataset.addType || "expense") === normalizedType;
    button.classList.toggle("is-active", isSelected);
    button.setAttribute("aria-selected", String(isSelected));
  });
}

if (confirmDeleteSeriesBtn) {
  confirmDeleteSeriesBtn.addEventListener("click", () => {
    if (pendingDeleteRecurringContext) {
      const didDeleteRecurring = deleteRecurringFromMonthForward(pendingDeleteRecurringContext);
      pendingDeleteRecurringContext = null;
      pendingDeleteProjection = null;
      pendingDeleteItemId = null;
      if (!didDeleteRecurring) {
        closeDeleteConfirmModal();
        return;
      }
      saveState();
      render();
      closeDeleteConfirmModal();
      return;
    }

    if (!pendingDeleteProjection?.seriesId) {
      closeDeleteConfirmModal();
      return;
    }

    const seriesId = pendingDeleteProjection.seriesId;
    state.items = state.items.filter((entry) => getRecurringSeriesId(entry) !== seriesId);
    state.recurringSkips = Array.isArray(state.recurringSkips)
      ? state.recurringSkips.filter((entry) => entry?.seriesId !== seriesId)
      : [];
    pendingDeleteProjection = null;
    saveState();
    render();
    closeDeleteConfirmModal();
    showToast("Serie recurrente eliminada.");
  });
}

function setMobileAmountMode(movementType) {
  mobileAmountMode = normalizeMovementType(movementType);
  if (mobileAmountExpenseTab) {
    const active = mobileAmountMode === "expense";
    mobileAmountExpenseTab.classList.toggle("is-active", active);
    mobileAmountExpenseTab.setAttribute("aria-selected", String(active));
  }
  if (mobileAmountIncomeTab) {
    const active = mobileAmountMode === "income";
    mobileAmountIncomeTab.classList.toggle("is-active", active);
    mobileAmountIncomeTab.setAttribute("aria-selected", String(active));
  }
}

function renderMobileAmountDisplay() {
  if (!mobileAmountInput) {
    return;
  }
  const numericValue = Number(mobileAmountValue || 0);
  mobileAmountInput.value = formatAmountNumber(numericValue, { withSymbol: false }) || "0";
}

function updateMobileAmountValue(key) {
  const action = String(key || "").trim();
  if (!action) {
    return;
  }

  if (action === "backspace") {
    mobileAmountValue = mobileAmountValue.slice(0, -1);
    renderMobileAmountDisplay();
    return;
  }

  if (!/^\d+$/.test(action)) {
    return;
  }

  const nextRaw = `${mobileAmountValue}${action}`.replace(/^0+(?=\d)/, "");
  const nextNumber = Number(nextRaw || 0);
  if (!Number.isFinite(nextNumber) || nextNumber > 999999999999) {
    return;
  }

  mobileAmountValue = String(Math.trunc(nextNumber));
  renderMobileAmountDisplay();
}

function openMobileQuickAddSheet() {
  if (!mobileQuickAddSheet) {
    return;
  }
  closeMobileAmountScreen();
  closeMobileQuickEntrySheet();
  closeProfileDropdown();
  mobileQuickAddOpen = true;
  mobileQuickAddSheet.classList.remove("is-hidden");
  mobileQuickAddSheet.setAttribute("aria-hidden", "false");
  updateOverlayScrollLock();
}

function closeMobileQuickAddSheet() {
  if (!mobileQuickAddSheet) {
    return;
  }
  mobileQuickAddOpen = false;
  mobileQuickAddSheet.classList.add("is-hidden");
  mobileQuickAddSheet.setAttribute("aria-hidden", "true");
  updateOverlayScrollLock();
}

function openMobileAmountScreen(movementType = "expense") {
  if (!mobileAmountScreen) {
    return;
  }
  closeMobileQuickAddSheet();
  closeMobileQuickEntrySheet();
  mobileAmountScreenOpen = true;
  mobileAmountScreen.classList.remove("is-hidden");
  mobileAmountScreen.setAttribute("aria-hidden", "false");
  mobileAmountValue = "";
  setMobileAmountMode(movementType);
  renderMobileAmountDisplay();
  updateOverlayScrollLock();
  window.setTimeout(() => {
    mobileAmountInput?.focus();
  }, 40);
}

function closeMobileAmountScreen() {
  if (!mobileAmountScreen) {
    return;
  }
  mobileAmountScreenOpen = false;
  mobileAmountScreen.classList.add("is-hidden");
  mobileAmountScreen.setAttribute("aria-hidden", "true");
  mobileAmountValue = "";
  renderMobileAmountDisplay();
  mobileAmountInput?.blur();
  updateOverlayScrollLock();
}

function getDefaultItemDateForMonth(monthKey = state.activeMonth) {
  const today = new Date();
  const targetMonth = normalizeMonthKey(monthKey);
  return normalizeItemDate(buildDateForMonth(today, targetMonth));
}

function populateMobileQuickEntryCategories(movementType = "expense") {
  if (!(mobileQuickEntryCategory instanceof HTMLSelectElement)) {
    return;
  }

  const normalizedType = normalizeMovementType(movementType);
  const categoryKeys = getCategoryKeysForType(normalizedType);
  const selectedCategory = normalizeCategoryKeyForType(
    mobileQuickEntryCategory.value || getDefaultCategoryKeyForType(normalizedType),
    normalizedType
  );

  mobileQuickEntryCategory.innerHTML = categoryKeys
    .map((key) => {
      const config = getCategoryConfig(key);
      return `<option value="${key}">${config.label}</option>`;
    })
    .join("");

  mobileQuickEntryCategory.value = categoryKeys.includes(selectedCategory)
    ? selectedCategory
    : getDefaultCategoryKeyForType(normalizedType);
}

function updateMobileQuickEntryScopeSelection() {
  const selectedScope = normalizeEditScope(mobileQuickEntryScope);
  const scopeButtons = [
    [mobileQuickEntryScopeThisMonthBtn, "thisMonth"],
    [mobileQuickEntryScopeAllMonthsBtn, "allMonths"]
  ];

  scopeButtons.forEach(([button, scopeValue]) => {
    if (!(button instanceof HTMLElement)) {
      return;
    }

    const isSelected = scopeValue === selectedScope;
    button.classList.toggle("is-active", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });
}

function updateExpenseEditScopeSelection() {
  const selectedScope = normalizeEditScope(expenseEditScope);
  const scopeButtons = [
    [expenseEditScopeThisMonthBtn, "thisMonth"],
    [expenseEditScopeAllMonthsBtn, "allMonths"]
  ];

  scopeButtons.forEach(([button, scopeValue]) => {
    if (!(button instanceof HTMLElement)) {
      return;
    }

    const isSelected = scopeValue === selectedScope;
    button.classList.toggle("is-active", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });
}

function syncMobileQuickEntryRecurringDurationVisibility({ isProjected = Boolean(editingProjectedItem) } = {}) {
  if (
    !mobileQuickEntryRecurringMonthsWrap
    || !(mobileQuickEntryRecurring instanceof HTMLInputElement)
    || !(mobileQuickEntryRecurringMonths instanceof HTMLSelectElement)
  ) {
    return;
  }

  const shouldShow = !isProjected && mobileQuickEntryRecurring.checked;
  mobileQuickEntryRecurringMonthsWrap.classList.toggle("is-hidden", !shouldShow);
  mobileQuickEntryRecurringMonths.disabled = !shouldShow;
}

function bindSheetHeaderSwipeClose(header, onClose) {
  if (!(header instanceof HTMLElement) || typeof onClose !== "function") {
    return;
  }

  let startY = 0;
  let currentDeltaY = 0;
  let tracking = false;

  header.addEventListener("touchstart", (event) => {
    if (event.touches.length !== 1) {
      tracking = false;
      currentDeltaY = 0;
      return;
    }

    tracking = true;
    startY = event.touches[0].clientY;
    currentDeltaY = 0;
  }, { passive: true });

  header.addEventListener("touchmove", (event) => {
    if (!tracking || event.touches.length !== 1) {
      return;
    }

    currentDeltaY = event.touches[0].clientY - startY;
  }, { passive: true });

  header.addEventListener("touchend", () => {
    if (!tracking) {
      return;
    }

    const shouldClose = currentDeltaY > 56;
    tracking = false;
    currentDeltaY = 0;

    if (shouldClose) {
      onClose();
    }
  });

  header.addEventListener("touchcancel", () => {
    tracking = false;
    currentDeltaY = 0;
  });
}

function openMobileQuickEntrySheet(movementType = "expense", amount = 0, item = null) {
  if (!mobileQuickEntrySheet) {
    return;
  }

  const editableItem = item || null;
  const isProjectedItem = Boolean(item?.isProjectedRecurring);
  const projectionSeriesId = item?.isProjectedRecurring ? getRecurringSeriesId(item) : "";
  const projectionMonthKey = item?.isProjectedRecurring ? getMonthKeyFromItem(item) : "";
  const projectionSourceItem = item?.isProjectedRecurring
    ? findLatestRecurringSourceItem(projectionSeriesId, projectionMonthKey)
    : null;
  const isEditingExistingItem = Boolean(editableItem);
  mobileQuickEntryOpen = true;
  mobileQuickEntryAmount = editableItem
    ? Math.max(0, Number(editableItem.amount || 0))
    : (Number.isFinite(Number(amount)) ? Math.max(0, Number(amount)) : 0);
  const normalizedType = normalizeMovementType(editableItem?.type || movementType);
  pendingMovementType = normalizedType;
  editingProjectedItem = item?.isProjectedRecurring
    ? {
      seriesId: projectionSeriesId,
      monthKey: projectionMonthKey,
      sourceItemId: projectionSourceItem?.id || "",
      sourceMonthKey: projectionSourceItem ? getRecurringSeriesSourceMonth(projectionSourceItem) : "",
      endMonth: projectionSourceItem ? getRecurringSeriesTerminalMonth(projectionSourceItem) : "",
      type: normalizedType,
      date: normalizeItemDate(editableItem?.date),
      category: normalizeCategoryKeyForType(editableItem?.category, normalizedType),
      name: String(editableItem?.name || "").trim(),
      amount: Math.max(0, Number(editableItem?.amount || 0))
    }
    : null;
  editingItemId = item?.isProjectedRecurring ? null : editableItem?.id || null;

  populateMobileQuickEntryCategories(normalizedType);

  if (mobileQuickEntryTypePill) {
    mobileQuickEntryTypePill.textContent = normalizedType === "income" ? "Ingreso" : "Gasto";
    mobileQuickEntryTypePill.dataset.type = normalizedType;
  }

  if (mobileQuickEntryAmountEl) {
    mobileQuickEntryAmountEl.textContent = money(mobileQuickEntryAmount).replace("$ ", "$");
  }
  if (mobileQuickEntryAmountInput instanceof HTMLInputElement) {
    mobileQuickEntryAmountInput.value = formatAmountNumber(mobileQuickEntryAmount, { withSymbol: false });
  }
  if (mobileQuickEntryAmountWrap) {
    mobileQuickEntryAmountWrap.classList.toggle("is-hidden", !isEditingExistingItem);
  }

  if (mobileQuickEntryName instanceof HTMLInputElement) {
    mobileQuickEntryName.value = editableItem ? editableItem.name : "";
  }

  if (mobileQuickEntryDate instanceof HTMLInputElement) {
    mobileQuickEntryDate.value = editableItem
      ? normalizeItemDate(editableItem.date)
      : normalizeItemDate(getDefaultItemDateForMonth(state.activeMonth));
  }

  if (mobileQuickEntryRecurring instanceof HTMLInputElement) {
    mobileQuickEntryRecurring.checked = editableItem ? Boolean(editableItem.isRecurring) : false;
  }

  if (mobileQuickEntryRecurringWrap) {
    mobileQuickEntryRecurringWrap.classList.remove("is-hidden");
  }
  if (mobileQuickEntryRecurringMonths instanceof HTMLSelectElement) {
    const defaultDuration = editableItem
      ? getRecurringDurationSelectionForItem(editableItem, getMonthKeyFromItem(editableItem))
      : "12";
    populateRecurringDurationOptions(mobileQuickEntryRecurringMonths, defaultDuration);
    mobileQuickEntryRecurringMonths.disabled = !mobileQuickEntryRecurring?.checked || isProjectedItem;
  }
  syncMobileQuickEntryRecurringDurationVisibility({ isProjected: isProjectedItem });
  const isRecurringEdit = isRecurringEditContext(editableItem, { isProjected: isProjectedItem });
  applyMobileRecurringEditRestrictions({ isRecurringEdit });
  mobileQuickEntryScope = isRecurringEdit ? "" : "thisMonth";
  const shouldShowScopeChoice = shouldShowRecurringEditScope(editableItem, { isProjected: isProjectedItem });
  if (mobileQuickEntryScopeWrap) {
    mobileQuickEntryScopeWrap.classList.toggle("is-hidden", !shouldShowScopeChoice);
  }
  updateMobileQuickEntryScopeSelection();

  if (mobileQuickEntryCategory instanceof HTMLSelectElement) {
    mobileQuickEntryCategory.value = editableItem
      ? normalizeCategoryKeyForType(editableItem.category, normalizedType)
      : getDefaultCategoryKeyForType(normalizedType);
  }

  if (mobileQuickEntrySaveBtn) {
    mobileQuickEntrySaveBtn.textContent = editableItem ? "Guardar cambios" : "Guardar movimiento";
  }

  if (mobileQuickEntryDeleteBtn) {
    mobileQuickEntryDeleteBtn.classList.toggle("is-hidden", !editableItem);
    mobileQuickEntryDeleteBtn.onclick = editableItem
      ? () => {
        closeMobileQuickEntrySheet();
        openDeleteConfirmModal(item, mobileQuickEntryDeleteBtn);
      }
      : null;
  }
  if (backMobileQuickEntryBtn) {
    backMobileQuickEntryBtn.classList.add("is-hidden");
  }

  closeMobileAmountScreen();
  closeMobileQuickAddSheet();
  closeProfileDropdown();
  mobileQuickEntrySheet.classList.remove("is-hidden");
  mobileQuickEntrySheet.setAttribute("aria-hidden", "false");
  updateOverlayScrollLock();

  window.setTimeout(() => {
    if (isEditingExistingItem && mobileQuickEntryAmountInput instanceof HTMLInputElement) {
      mobileQuickEntryAmountInput.focus();
      mobileQuickEntryAmountInput.select();
      return;
    }
    mobileQuickEntryName?.focus();
  }, 40);
}

function closeMobileQuickEntrySheet() {
  if (!mobileQuickEntrySheet) {
    return;
  }
  mobileQuickEntryOpen = false;
  mobileQuickEntrySheet.classList.add("is-hidden");
  mobileQuickEntrySheet.setAttribute("aria-hidden", "true");
  editingItemId = null;
  editingProjectedItem = null;
  pendingMovementType = "expense";
  if (mobileQuickEntryDeleteBtn) {
    mobileQuickEntryDeleteBtn.classList.add("is-hidden");
    mobileQuickEntryDeleteBtn.onclick = null;
  }
  if (mobileQuickEntryAmountWrap) {
    mobileQuickEntryAmountWrap.classList.add("is-hidden");
  }
  if (mobileQuickEntryAmountInput instanceof HTMLInputElement) {
    mobileQuickEntryAmountInput.value = "";
  }
  if (mobileQuickEntryRecurringMonths instanceof HTMLSelectElement) {
    populateRecurringDurationOptions(mobileQuickEntryRecurringMonths, "12");
    mobileQuickEntryRecurringMonths.disabled = true;
  }
  if (mobileQuickEntryRecurringMonthsWrap) {
    mobileQuickEntryRecurringMonthsWrap.classList.add("is-hidden");
  }
  applyMobileRecurringEditRestrictions({ isRecurringEdit: false });
  mobileQuickEntryScope = "thisMonth";
  if (mobileQuickEntryScopeWrap) {
    mobileQuickEntryScopeWrap.classList.add("is-hidden");
  }
  updateMobileQuickEntryScopeSelection();
  if (backMobileQuickEntryBtn) {
    backMobileQuickEntryBtn.classList.add("is-hidden");
  }
  if (mobileQuickEntrySaveBtn) {
    mobileQuickEntrySaveBtn.textContent = "Guardar movimiento";
  }
  updateOverlayScrollLock();
}

function saveMovementRecord({
  movementType = "expense",
  rawMovementDate = "",
  category = "",
  name = "",
  amount = 0,
  isRecurring = false,
  recurringMonths = null,
  editScope = "thisMonth"
}) {
  const normalizedType = normalizeMovementType(movementType);
  const movementDate = normalizeItemDate(rawMovementDate);
  const normalizedCategory = normalizeCategoryKeyForType(category, normalizedType);
  const trimmedName = String(name || "").trim();
  const numericAmount = Number(amount || 0);
  const recurring = Boolean(isRecurring);
  const requestedRecurringMonths = recurringMonths == null ? null : parseRecurringDurationSelection(recurringMonths);
  const normalizedEditScope = normalizeEditScope(editScope);

  if (!trimmedName || numericAmount < 0 || !CATEGORY_CONFIG[normalizedCategory] || !hasValidItemDate(rawMovementDate)) {
    showToast("Revisa los campos: descripcion, fecha y monto validos.", true);
    return false;
  }

  let didMutate = false;
  let nextActiveMonthAfterSave = "";
  const viewedMonthAtSave = normalizeMonthKey(state.activeMonth);

  if (editingItemId) {
    const item = state.items.find((entry) => entry.id === editingItemId);
    if (!item) {
      showToast("No pudimos encontrar el movimiento para editar.", true);
      return false;
    }

    const previousMonthKey = getMonthKeyFromItem(item);
    const previousSeriesId = item.isRecurring || item.recurringSeriesId
      ? getRecurringSeriesId(item)
      : "";
    const originalItemSnapshot = {
      type: normalizeMovementType(item.type),
      date: normalizeItemDate(item.date),
      category: normalizeCategoryKeyForType(item.category, item.type),
      name: String(item.name || "").trim(),
      amount: Math.max(0, Number(item.amount || 0)),
      isRecurring: Boolean(item.isRecurring),
      recurringSeriesId: previousSeriesId,
      recurringEndMonth: getRecurringEndMonth(item),
      recurringDuration: previousSeriesId ? getRecurringDurationSelectionForItem(item, previousMonthKey) : null
    };
    const isRecurringSourceEdit = Boolean(originalItemSnapshot.isRecurring && previousSeriesId);
    if (isRecurringSourceEdit && !normalizedEditScope) {
      showToast("Elige como aplicar los cambios recurrentes.", true);
      return false;
    }

    const effectiveRecurring = isRecurringSourceEdit ? true : recurring;
    const nextMovementDate = isRecurringSourceEdit
      ? buildDateForMonth(movementDate, previousMonthKey)
      : movementDate;
    const scopedOccurrenceIsUnchanged = isRecurringSourceEdit
      && normalizedType === originalItemSnapshot.type
      && nextMovementDate === originalItemSnapshot.date
      && normalizedCategory === originalItemSnapshot.category
      && trimmedName === originalItemSnapshot.name
      && numericAmount === originalItemSnapshot.amount;

    if (isRecurringSourceEdit && normalizedEditScope === "thisMonth") {
      if (!scopedOccurrenceIsUnchanged) {
        const continuationMonthKey = shiftMonthKey(previousMonthKey, 1);
        const continuationItem = createRecurringContinuationItem({
          type: originalItemSnapshot.type,
          date: originalItemSnapshot.date,
          category: originalItemSnapshot.category,
          name: originalItemSnapshot.name,
          amount: originalItemSnapshot.amount,
          isRecurring: true,
          recurringSeriesId: originalItemSnapshot.recurringSeriesId,
          recurringEndMonth: originalItemSnapshot.recurringEndMonth,
          recurringMonths: originalItemSnapshot.recurringDuration === "always"
            ? undefined
            : originalItemSnapshot.recurringDuration
        }, previousSeriesId, continuationMonthKey);

        item.type = normalizedType;
        item.date = nextMovementDate;
        item.category = normalizedCategory;
        item.name = trimmedName;
        item.amount = numericAmount;
        item.isRecurring = false;
        item.recurringSeriesId = previousSeriesId;
        item.createdAt = normalizeItemCreatedAt(item.createdAt, item.date);
        clearRecurringWindow(item);
        removeRecurringSkip(previousSeriesId, previousMonthKey);

        if (continuationItem) {
          state.items.push(continuationItem);
          limitRecurringSeriesBeforeMonth(previousSeriesId, continuationMonthKey);
          removeRecurringSkip(previousSeriesId, continuationMonthKey);
        }

        didMutate = true;
        showToast(normalizedType === "income" ? "Ingreso actualizado correctamente." : "Gasto actualizado correctamente.");
      }
    } else {
      item.type = normalizedType;
      item.date = nextMovementDate;
      item.category = normalizedCategory;
      item.name = trimmedName;
      item.amount = numericAmount;
      item.isRecurring = effectiveRecurring;
      item.createdAt = normalizeItemCreatedAt(item.createdAt, item.date);

      const nextMonthKey = getMonthKeyFromItem(item);
      if (previousSeriesId && previousMonthKey !== nextMonthKey) {
        removeRecurringSkip(previousSeriesId, previousMonthKey);
      }
      if (nextMonthKey !== viewedMonthAtSave) {
        nextActiveMonthAfterSave = nextMonthKey;
      }

      if (effectiveRecurring) {
        item.recurringSeriesId = previousSeriesId || String(item.recurringSeriesId || item.id || createItemId()).trim();
        const nextRecurringDuration = requestedRecurringMonths == null
          ? getRecurringDurationSelectionForItem(item, nextMonthKey)
          : requestedRecurringMonths;
        if (nextRecurringDuration === "always") {
          clearRecurringWindow(item);
        } else {
          setRecurringWindow(item, nextMonthKey, nextRecurringDuration);
        }
        removeRecurringSkip(item.recurringSeriesId, nextMonthKey);
      } else if (previousSeriesId) {
        item.recurringSeriesId = previousSeriesId;
        clearRecurringWindow(item);
        addRecurringSkip(previousSeriesId, nextMonthKey);
        limitRecurringSeriesBeforeMonth(previousSeriesId, nextMonthKey);
      } else {
        delete item.recurringSeriesId;
        clearRecurringWindow(item);
      }

      didMutate = true;
      showToast(normalizedType === "income" ? "Ingreso actualizado correctamente." : "Gasto actualizado correctamente.");
    }
  } else if (editingProjectedItem?.seriesId && editingProjectedItem?.monthKey) {
    const projectionContext = editingProjectedItem;
    const projectionDate = buildDateForMonth(movementDate, projectionContext.monthKey);
    if (!normalizedEditScope) {
      showToast("Elige como aplicar los cambios recurrentes.", true);
      return false;
    }

    const projectedItemIsUnchanged = normalizedType === projectionContext.type
      && projectionDate === projectionContext.date
      && normalizedCategory === projectionContext.category
      && trimmedName === projectionContext.name
      && numericAmount === projectionContext.amount;

    if (!projectedItemIsUnchanged && normalizedEditScope === "allMonths") {
      const seriesItems = state.items.filter((entry) => entry.isRecurring && getRecurringSeriesId(entry) === projectionContext.seriesId);
      if (!seriesItems.length) {
        showToast("No pudimos encontrar la serie recurrente para editar.", true);
        return false;
      }

      limitRecurringSeriesBeforeMonth(projectionContext.seriesId, projectionContext.monthKey);
      const seriesSourceItem = sanitizeItem({
        id: createItemId(),
        type: normalizedType,
          date: projectionDate,
          category: normalizedCategory,
          name: trimmedName,
        amount: numericAmount,
        isRecurring: true,
        recurringSeriesId: projectionContext.seriesId,
        recurringSourceMonth: projectionContext.sourceMonthKey || projectionContext.monthKey,
        sortAnchorId: String(projectionContext.sourceItemId || "").trim() || undefined,
        createdAt: new Date().toISOString(),
        recurringMonths: projectionContext.endMonth
          ? Math.max(1, getMonthOffsetBetween(projectionContext.monthKey, projectionContext.endMonth) + 1)
          : undefined,
        recurringEndMonth: projectionContext.endMonth || undefined
      });

      if (!seriesSourceItem) {
        showToast("No pudimos actualizar esta serie.", true);
        return false;
      }

      state.items.push(seriesSourceItem);
      removeRecurringSkip(projectionContext.seriesId, projectionContext.monthKey);

      didMutate = true;
    } else if (!projectedItemIsUnchanged) {
        const materializedItem = sanitizeItem({
          id: createItemId(),
          type: normalizedType,
          date: projectionDate,
          category: normalizedCategory,
          name: trimmedName,
          amount: numericAmount,
          isRecurring: false,
          createdAt: new Date().toISOString(),
          recurringSeriesId: projectionContext.seriesId,
          sortAnchorId: String(projectionContext.sourceItemId || "").trim() || undefined
        });

      if (!materializedItem) {
        showToast("No pudimos actualizar este movimiento.", true);
        return false;
      }

      state.items.push(materializedItem);

      const materializedMonthKey = getMonthKeyFromItem(materializedItem);
      addRecurringSkip(projectionContext.seriesId, materializedMonthKey);

      didMutate = true;
    }

    showToast(normalizedType === "income" ? "Ingreso actualizado correctamente." : "Gasto actualizado correctamente.");
  } else {
    const newItemId = createItemId();
    const newRecurringDuration = requestedRecurringMonths == null ? 12 : requestedRecurringMonths;
      state.items.push({
        id: newItemId,
        type: normalizedType,
        date: movementDate,
        category: normalizedCategory,
        name: trimmedName,
        amount: numericAmount,
        isRecurring: recurring,
        createdAt: new Date().toISOString(),
        recurringSeriesId: recurring ? newItemId : undefined,
        recurringMonths: recurring && newRecurringDuration !== "always" ? newRecurringDuration : undefined,
        recurringEndMonth: recurring && newRecurringDuration !== "always"
          ? shiftMonthKey(getMonthKeyFromItem(movementDate), newRecurringDuration - 1)
          : undefined
    });
    didMutate = true;
    showToast(normalizedType === "income" ? "Ingreso guardado correctamente." : "Gasto guardado correctamente.");
  }

  if (didMutate) {
    saveState();
    if (nextActiveMonthAfterSave && nextActiveMonthAfterSave !== normalizeMonthKey(state.activeMonth)) {
      queueMicrotask(() => {
        setActiveMonth(nextActiveMonthAfterSave);
      });
    } else {
      render();
    }
  }
  return true;
}

function commitMobileAmountFlow() {
  const parsedAmount = Number(mobileAmountValue || 0);
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    showToast("Ingresa un monto valido para continuar.", true);
    return;
  }
  openMobileQuickEntrySheet(mobileAmountMode, parsedAmount);
}

function saveMobileQuickEntry() {
  if (!(mobileQuickEntryCategory instanceof HTMLSelectElement)
    || !(mobileQuickEntryName instanceof HTMLInputElement)
    || !(mobileQuickEntryDate instanceof HTMLInputElement)
    || !(mobileQuickEntryRecurring instanceof HTMLInputElement)) {
    return;
  }

  const didSave = saveMovementRecord({
    movementType: pendingMovementType,
    rawMovementDate: mobileQuickEntryDate.value,
    category: mobileQuickEntryCategory.value,
    name: mobileQuickEntryName.value,
    amount: mobileQuickEntryAmountWrap?.classList.contains("is-hidden")
      ? mobileQuickEntryAmount
      : parseCurrencyInput(mobileQuickEntryAmountInput?.value || ""),
    isRecurring: mobileQuickEntryRecurring.checked,
    recurringMonths: parseRecurringDurationSelection(mobileQuickEntryRecurringMonths?.value || "12"),
    editScope: mobileQuickEntryScope
  });

  if (!didSave) {
    return;
  }

  closeMobileQuickEntrySheet();
}

function renderMobileFilterDateOptions() {
  if (!mobileFilterDateOptions || !dateFilter) {
    return;
  }
  const selectedDate = normalizeDateFilterValue(dateFilter.value || "all");
  const allowDateFilter = isActiveMonthCurrent();

  mobileFilterDateOptions.querySelectorAll("[data-mobile-date-value]").forEach((button) => {
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }
    const value = normalizeDateFilterValue(button.dataset.mobileDateValue || "all");
    const isSelected = value === selectedDate;
    button.classList.toggle("is-active", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
    button.disabled = !allowDateFilter && value !== "all";
  });
}

function renderMobileFilterStatusOptions() {
  if (!mobileFilterStatusOptions || !statusFilter) {
    return;
  }

  const selectedStatus = normalizeStatusFilterValue(statusFilter.value || "all");
  mobileFilterStatusOptions.querySelectorAll("[data-mobile-status-value]").forEach((button) => {
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }

    const value = normalizeStatusFilterValue(button.dataset.mobileStatusValue || "all");
    const isSelected = value === selectedStatus;
    button.classList.toggle("is-active", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });
}

function renderMobileFilterCategoryOptions(query = "") {
  if (!mobileFilterCategoryOptions || !categoryFilter) {
    return;
  }

  const selectedCategory = String(categoryFilter.value || "all").trim().toLowerCase();
  const normalizedQuery = String(query || "").trim().toLowerCase();
  const options = [
    { value: "all", label: "Todas" },
    ...CATEGORY_KEYS.map((key) => ({ value: key, label: CATEGORY_CONFIG[key].label }))
  ].filter((option) => !normalizedQuery || option.label.toLowerCase().includes(normalizedQuery));

  mobileFilterCategoryOptions.innerHTML = options.map((option) => `
    <button
      type="button"
      class="mobile-filter-category-btn${selectedCategory === option.value ? " is-active" : ""}"
      data-mobile-category-value="${option.value}"
      aria-pressed="${selectedCategory === option.value ? "true" : "false"}"
    >
      ${option.label}
    </button>
  `).join("");

  if (mobileFilterEmptyState) {
    mobileFilterEmptyState.classList.toggle("is-hidden", options.length > 0);
  }
  if (mobileClearFilterSearchBtn) {
    mobileClearFilterSearchBtn.classList.toggle("is-hidden", !normalizedQuery);
  }
}

function openMobileFilterSheet() {
  if (!mobileFilterSheet) {
    return;
  }
  closeProfileDropdown();
  closeMobileQuickEntrySheet();
  hideCategoryFilterMenu();
  hideDateFilterMenu();
  mobileFilterSheetOpen = true;
  mobileFilterSheet.classList.remove("is-hidden");
  mobileFilterSheet.setAttribute("aria-hidden", "false");
  if (mobileFilterSearchInput) {
    mobileFilterSearchInput.value = "";
  }
  renderMobileFilterDateOptions();
  renderMobileFilterStatusOptions();
  renderMobileFilterCategoryOptions("");
  updateOverlayScrollLock();
}

function closeMobileFilterSheet() {
  if (!mobileFilterSheet) {
    return;
  }
  mobileFilterSheetOpen = false;
  mobileFilterSheet.classList.add("is-hidden");
  mobileFilterSheet.setAttribute("aria-hidden", "true");
  updateOverlayScrollLock();
}

function updateMobileStickySummaryVisibility() {
  if (!mobileStickySummary || !isMobileViewport()) {
    return;
  }

  const heroBottom = mobileHomeExperience?.getBoundingClientRect().bottom ?? 0;
  const shouldShow = heroBottom <= 40;
  mobileStickySummary.classList.toggle("is-hidden", !shouldShow);
  mobileStickySummary.setAttribute("aria-hidden", String(!shouldShow));
}

function openExpenseModal(trigger = null) {
  hideAddMovementMenu();
  hideDateFilterMenu();
  modalTrigger = trigger instanceof HTMLElement ? trigger : document.activeElement instanceof HTMLElement ? document.activeElement : null;
  expenseModal.classList.add("show");
  expenseModal.setAttribute("aria-hidden", "false");
  updateOverlayScrollLock();

  requestAnimationFrame(() => {
    nameInput.focus();
  });
}

function openExpenseModalForCreate(trigger = null, movementType = "expense", options = {}) {
  editingItemId = null;
  editingProjectedItem = null;
  expenseForm.reset();
  const normalizedType = normalizeMovementType(movementType);
  const prefilledAmount = Number(options?.prefilledAmount || 0);
  pendingMovementType = normalizedType;
  if (typeInput) {
    typeInput.value = normalizedType;
  }
  if (dateInput) {
    dateInput.value = formatDateForForm(buildDateForMonth(toDateInputValue(new Date()), state.activeMonth));
  }
  populateCategoryControls();
  categoryInput.value = getDefaultCategoryKeyForType(normalizedType);
  if (amountInput) {
    amountInput.value = prefilledAmount > 0
      ? formatAmountNumber(prefilledAmount, { withSymbol: false })
      : "";
  }
  if (recurringInput) {
    recurringInput.checked = false;
  }
  if (recurringMonthsInput) {
    populateRecurringDurationOptions(recurringMonthsInput, "12");
  }
  syncRecurringDurationVisibility({ isProjected: false });
  applyExpenseRecurringEditRestrictions({ isRecurringEdit: false });
  expenseEditScope = "thisMonth";
  if (expenseEditScopeWrap) {
    expenseEditScopeWrap.classList.add("is-hidden");
  }
  updateExpenseEditScopeSelection();
  setExpenseFormMode("create");
  syncMovementTypeTabs(normalizedType);
  openExpenseModal(trigger);
}

function openSalaryModal(trigger = null) {
  if (!salaryModal || !salaryModalInput) {
    return;
  }

  modalTrigger = trigger instanceof HTMLElement ? trigger : document.activeElement instanceof HTMLElement ? document.activeElement : null;
  salaryModalInput.value = formatAmountNumber(getMonthSalary(state.activeMonth), { withSymbol: false });
  salaryModal.classList.add("show");
  salaryModal.setAttribute("aria-hidden", "false");
  updateOverlayScrollLock();

  requestAnimationFrame(() => {
    salaryModalInput.focus();
    salaryModalInput.select();
  });
}

if (mobileBudgetPeriodMenu) {
  mobileBudgetPeriodMenu.addEventListener("click", (event) => {
    event.stopPropagation();
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const optionBtn = target.closest("[data-mobile-budget-period]");
    if (!(optionBtn instanceof HTMLElement)) {
      return;
    }

    applyBudgetPeriodSelection(optionBtn.dataset.mobileBudgetPeriod || "daily");
    hideMobileBudgetPeriodMenu();
  });
}

function closeSalaryModal() {
  if (!salaryModal || !salaryModalInput) {
    return;
  }

  const wasOpen = salaryModal.classList.contains("show");
  salaryModal.classList.remove("show");
  salaryModal.setAttribute("aria-hidden", "true");
  salaryModalInput.value = formatAmountNumber(getMonthSalary(state.activeMonth), { withSymbol: false });
  updateOverlayScrollLock();

  if (wasOpen && modalTrigger instanceof HTMLElement) {
    modalTrigger.focus();
  }

  modalTrigger = null;
}

function saveSalaryModalValue() {
  if (!salaryModalInput) {
    return;
  }

  const parsedSalary = parseCurrencyInput(salaryModalInput.value);
  setMonthSalary(state.activeMonth, parsedSalary);
  saveState();
  render();
  showToast("Sueldo mensual actualizado.");
  closeSalaryModal();
}

function materializeProjectedRecurringItem(item) {
  if (!item?.isProjectedRecurring) {
    return item;
  }

  const seriesId = getRecurringSeriesId(item);
  const monthKey = getMonthKeyFromItem(item);
  const existingItem = state.items.find((entry) => {
    return Boolean(entry.isRecurring)
      && getRecurringSeriesId(entry) === seriesId
      && getMonthKeyFromItem(entry) === monthKey;
  });

  if (existingItem) {
    state.recurringSkips = Array.isArray(state.recurringSkips)
      ? state.recurringSkips.filter((entry) => !(entry?.seriesId === seriesId && entry?.month === monthKey))
      : [];
    return existingItem;
  }

  const materializedItem = sanitizeItem({
    ...item,
    id: createItemId(),
    date: buildDateForMonth(item.date, monthKey),
    recurringSeriesId: seriesId,
    isRecurring: true
  });

  if (!materializedItem) {
    return item;
  }

  state.items.push(materializedItem);
  state.recurringSkips = Array.isArray(state.recurringSkips)
    ? state.recurringSkips.filter((entry) => !(entry?.seriesId === seriesId && entry?.month === monthKey))
    : [];
  saveState();
  return materializedItem;
}

function openExpenseModalForEdit(item, trigger = null) {
  const editableItem = item;
  const projectionSeriesId = item?.isProjectedRecurring ? getRecurringSeriesId(item) : "";
  const projectionMonthKey = item?.isProjectedRecurring ? getMonthKeyFromItem(item) : "";
  const projectionSourceItem = item?.isProjectedRecurring
    ? findLatestRecurringSourceItem(projectionSeriesId, projectionMonthKey)
    : null;
  editingProjectedItem = item?.isProjectedRecurring
    ? {
      seriesId: projectionSeriesId,
      monthKey: projectionMonthKey,
      sourceItemId: projectionSourceItem?.id || "",
      sourceMonthKey: projectionSourceItem ? getRecurringSeriesSourceMonth(projectionSourceItem) : "",
      endMonth: projectionSourceItem ? getRecurringSeriesTerminalMonth(projectionSourceItem) : "",
      type: normalizeMovementType(editableItem.type),
      date: normalizeItemDate(editableItem.date),
      category: normalizeCategoryKeyForType(editableItem.category, editableItem.type),
      name: String(editableItem.name || "").trim(),
      amount: Math.max(0, Number(editableItem.amount || 0))
    }
    : null;
  editingItemId = item?.isProjectedRecurring ? null : editableItem.id;
  const movementType = normalizeMovementType(editableItem.type);
  pendingMovementType = movementType;
  if (typeInput) {
    typeInput.value = movementType;
  }
  if (dateInput) {
    dateInput.value = formatDateForForm(normalizeItemDate(editableItem.date));
  }
  populateCategoryControls();
  setExpenseFormMode("edit");
  categoryInput.value = normalizeCategoryKeyForType(editableItem.category, movementType);
  nameInput.value = editableItem.name;
  amountInput.value = formatAmountNumber(editableItem.amount, { withSymbol: false });
  if (recurringInput) {
    recurringInput.checked = Boolean(editableItem.isRecurring);
  }
  if (recurringMonthsInput) {
    const durationSource = projectionSourceItem || editableItem;
    const durationMonth = projectionSourceItem
      ? getMonthKeyFromItem(projectionSourceItem)
      : getMonthKeyFromItem(editableItem);
    populateRecurringDurationOptions(recurringMonthsInput, getRecurringDurationSelectionForItem(durationSource, durationMonth));
  }
  syncRecurringDurationVisibility({ isProjected: Boolean(editingProjectedItem) });
  const isRecurringEdit = isRecurringEditContext(editableItem, { isProjected: Boolean(editingProjectedItem) });
  applyExpenseRecurringEditRestrictions({ isRecurringEdit });
  expenseEditScope = isRecurringEdit ? "" : "thisMonth";
  if (expenseEditScopeWrap) {
    expenseEditScopeWrap.classList.toggle("is-hidden", !shouldShowRecurringEditScope(editableItem, { isProjected: Boolean(editingProjectedItem) }));
  }
  updateExpenseEditScopeSelection();
  syncMovementTypeTabs(movementType);
  openExpenseModal(trigger);
}

function resetOnboardingGesture() {
  if (onboardingGestureState?.surface && onboardingGestureState.pointerId !== undefined) {
    try {
      if (onboardingGestureState.surface.hasPointerCapture?.(onboardingGestureState.pointerId)) {
        onboardingGestureState.surface.releasePointerCapture(onboardingGestureState.pointerId);
      }
    } catch {}
  }

  onboardingGestureState = null;
}

function handleOnboardingPointerDown(event) {
  if (!onboardingModal?.classList.contains("show")) {
    return;
  }

  if (event.button !== undefined && event.button !== 0) {
    return;
  }

  const target = event.target;
  if (target instanceof HTMLElement && target.closest("button, a, input, select, textarea, label")) {
    return;
  }

  const surface = event.currentTarget instanceof HTMLElement ? event.currentTarget : null;
  onboardingGestureState = {
    pointerId: event.pointerId,
    surface,
    startX: event.clientX,
    startY: event.clientY,
    deltaX: 0,
    deltaY: 0,
    isHorizontal: null
  };

  if (surface?.setPointerCapture) {
    try {
      surface.setPointerCapture(event.pointerId);
    } catch {}
  }
}

function handleOnboardingPointerMove(event) {
  if (!onboardingGestureState || onboardingGestureState.pointerId !== event.pointerId) {
    return;
  }

  onboardingGestureState.deltaX = event.clientX - onboardingGestureState.startX;
  onboardingGestureState.deltaY = event.clientY - onboardingGestureState.startY;

  if (onboardingGestureState.isHorizontal === null) {
    const absX = Math.abs(onboardingGestureState.deltaX);
    const absY = Math.abs(onboardingGestureState.deltaY);

    if (absX < 8 && absY < 8) {
      return;
    }

    onboardingGestureState.isHorizontal = absX > absY;
  }

  if (onboardingGestureState.isHorizontal && event.cancelable) {
    event.preventDefault();
  }
}

function handleOnboardingPointerEnd(event) {
  if (!onboardingGestureState || onboardingGestureState.pointerId !== event.pointerId) {
    return;
  }

  onboardingGestureState.deltaX = event.clientX - onboardingGestureState.startX;
  onboardingGestureState.deltaY = event.clientY - onboardingGestureState.startY;
  const gesture = onboardingGestureState;
  resetOnboardingGesture();

  if (gesture.isHorizontal === null) {
    gesture.isHorizontal = Math.abs(gesture.deltaX) > Math.abs(gesture.deltaY);
  }

  if (!gesture.isHorizontal) {
    return;
  }

  const absX = Math.abs(gesture.deltaX);
  const absY = Math.abs(gesture.deltaY);
  if (absX < ONBOARDING_SWIPE_THRESHOLD || absY > ONBOARDING_SWIPE_VERTICAL_TOLERANCE) {
    return;
  }

  if (gesture.deltaX < 0 && onboardingStep < ONBOARDING_STEPS - 1) {
    setOnboardingStep(onboardingStep + 1);
    return;
  }

  if (gesture.deltaX > 0 && onboardingStep > 0) {
    setOnboardingStep(onboardingStep - 1);
  }
}

function handleOnboardingPointerCancel(event) {
  if (!onboardingGestureState) {
    return;
  }

  if (event.type !== "lostpointercapture" && onboardingGestureState.pointerId !== event.pointerId) {
    return;
  }

  resetOnboardingGesture();
}

function syncOnboardingStepUi(step) {
  for (const card of onboardingStepCards) {
    const cardStep = Number(card.dataset.step || 0);
    const isActive = cardStep === step;
    card.classList.toggle("is-active", isActive);
    card.hidden = !isActive;
  }

  for (const dot of onboardingStepDots) {
    const dotStep = Number(dot.dataset.stepJump || 0);
    const isActive = dotStep === step;
    dot.classList.toggle("is-active", isActive);
    dot.setAttribute("aria-selected", String(isActive));
  }

  if (onboardingPrevBtn) {
    onboardingPrevBtn.disabled = step === 0;
    onboardingPrevBtn.classList.toggle("is-hidden", step === 0);
  }

  if (onboardingNextBtn && onboardingDoneBtn) {
    const isLast = step === ONBOARDING_STEPS - 1;
    onboardingNextBtn.classList.toggle("is-hidden", isLast);
    onboardingDoneBtn.classList.toggle("is-hidden", !isLast);
  }
}

function animateOnboardingStepChange(fromStep, toStep) {
  const currentCard = onboardingStepCards.find((card) => Number(card.dataset.step || 0) === fromStep) || null;
  const nextCard = onboardingStepCards.find((card) => Number(card.dataset.step || 0) === toStep) || null;

  if (!currentCard || !nextCard || currentCard === nextCard || typeof currentCard.animate !== "function" || typeof nextCard.animate !== "function") {
    syncOnboardingStepUi(toStep);
    return;
  }

  const direction = toStep > fromStep ? 1 : -1;
  const distance = Math.max(28, Math.min(52, (onboardingViewport?.clientWidth || 320) * 0.12));
  const token = ++onboardingTransitionToken;

  for (const card of onboardingStepCards) {
    card.getAnimations?.().forEach((animation) => animation.cancel());
    card.hidden = card !== currentCard && card !== nextCard;
    card.classList.remove("is-active");
  }

  currentCard.hidden = false;
  nextCard.hidden = false;
  currentCard.classList.add("is-active");
  nextCard.classList.add("is-active");

  const animationOptions = {
    duration: ONBOARDING_TRANSITION_MS,
    easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    fill: "forwards"
  };

  const currentAnimation = currentCard.animate(
    [
      { opacity: 1, transform: "translateX(0px)" },
      { opacity: 0, transform: `translateX(${-direction * distance}px)` }
    ],
    animationOptions
  );

  const nextAnimation = nextCard.animate(
    [
      { opacity: 0, transform: `translateX(${direction * distance}px)` },
      { opacity: 1, transform: "translateX(0px)" }
    ],
    animationOptions
  );

  Promise.allSettled([currentAnimation.finished, nextAnimation.finished]).then(() => {
    if (token !== onboardingTransitionToken) {
      return;
    }

    currentCard.getAnimations?.().forEach((animation) => animation.cancel());
    nextCard.getAnimations?.().forEach((animation) => animation.cancel());
    syncOnboardingStepUi(toStep);
  });
}

function setOnboardingStep(nextStep) {
  if (!onboardingStepCards.length) {
    return;
  }

  const previousStep = onboardingStep;
  const clamped = Math.max(0, Math.min(ONBOARDING_STEPS - 1, Number(nextStep) || 0));
  onboardingStep = clamped;

  if (previousStep === clamped) {
    syncOnboardingStepUi(clamped);
    return;
  }

  animateOnboardingStepChange(previousStep, clamped);
}

function openOnboarding({ force = false, trigger = null } = {}) {
  if (!onboardingModal) {
    return;
  }

  if (!force && state.onboardingSeen) {
    return;
  }

  onboardingTrigger = trigger instanceof HTMLElement ? trigger : null;
  resetOnboardingGesture();
  onboardingModal.classList.add("show");
  onboardingModal.setAttribute("aria-hidden", "false");
  setOnboardingStep(0);
  updateOverlayScrollLock();

  requestAnimationFrame(() => {
    if (onboardingNextBtn) {
      onboardingNextBtn.focus();
    }
  });
}

function closeOnboarding(markAsSeen) {
  if (!onboardingModal) {
    return;
  }

  const wasOpen = onboardingModal.classList.contains("show");
  resetOnboardingGesture();
  onboardingModal.classList.remove("show");
  onboardingModal.setAttribute("aria-hidden", "true");
  updateOverlayScrollLock();

  if (wasOpen && markAsSeen && !state.onboardingSeen) {
    state.onboardingSeen = true;
    saveState();
  }

  if (wasOpen && onboardingTrigger) {
    onboardingTrigger.focus();
  }

  onboardingTrigger = null;
}

function getMovementCount(snapshotLike = state) {
  return Array.isArray(snapshotLike?.items) ? snapshotLike.items.length : 0;
}

function shouldAutoOpenOnboarding() {
  return !previewMode && getMovementCount(state) === 0 && !state.onboardingSeen;
}

function scheduleInitialOnboarding() {
  if (pendingOnboardingTimer) {
    window.clearTimeout(pendingOnboardingTimer);
    pendingOnboardingTimer = null;
  }

  if (!shouldAutoOpenOnboarding()) {
    return;
  }

  pendingOnboardingTimer = window.setTimeout(() => {
    pendingOnboardingTimer = null;

    if (!shouldAutoOpenOnboarding()) {
      return;
    }

    if (onboardingModal?.classList.contains("show")) {
      return;
    }

    openOnboarding({ force: true });
  }, 420);
}

function isDesktopWalkthroughViewport() {
  return globalThis.matchMedia ? globalThis.matchMedia("(min-width: 768px)").matches : globalThis.innerWidth >= 768;
}

function clearWalkthroughTarget() {
  if (!walkthroughActiveTarget) {
    return;
  }

  walkthroughActiveTarget.classList.remove("walkthrough-target-active");
  walkthroughActiveTarget = null;
}

function scheduleWalkthroughPosition() {
  if (!walkthroughOverlay || walkthroughOverlay.classList.contains("is-hidden")) {
    return;
  }

  if (walkthroughRepositionTimer) {
    clearTimeout(walkthroughRepositionTimer);
  }

  walkthroughRepositionTimer = setTimeout(() => {
    walkthroughRepositionTimer = null;
    positionWalkthrough();
  }, 60);
}

function getWalkthroughTarget(step) {
  const rawTargetId = typeof step?.targetId === "function" ? step.targetId() : step?.targetId;
  const targetId = String(rawTargetId || "").trim();
  if (!targetId) {
    return null;
  }
  return document.getElementById(targetId);
}

function updateWalkthroughCard(step, currentStep) {
  if (!walkthroughTitle || !walkthroughBody || !walkthroughStepCounter || !walkthroughNextBtn || !walkthroughPrevBtn) {
    return;
  }

  const title = typeof step.title === "function" ? step.title() : step.title;
  const body = typeof step.body === "function" ? step.body() : step.body;
  walkthroughTitle.textContent = title;
  walkthroughBody.textContent = body;
  walkthroughStepCounter.textContent = `Paso ${currentStep + 1} de ${WALKTHROUGH_STEPS.length}`;
  walkthroughPrevBtn.disabled = currentStep === 0;
  walkthroughNextBtn.innerHTML = currentStep === WALKTHROUGH_STEPS.length - 1
    ? '<i class="bi bi-check2-circle"></i> Listo'
    : 'Siguiente <i class="bi bi-arrow-right"></i>';

  walkthroughDots.forEach((dot, index) => {
    dot.classList.toggle("is-active", index === currentStep);
  });
}

function getWalkthroughPlacementOrder(preferredPlacement) {
  const preferred = String(preferredPlacement || "bottom-start");
  const order = [preferred];
  const fallbacks = ["bottom-start", "bottom-end", "top-start", "top-end", "left-start", "right-start"];

  for (const placement of fallbacks) {
    if (!order.includes(placement)) {
      order.push(placement);
    }
  }

  return order;
}

function resolveWalkthroughPosition(rect, cardRect, preferredPlacement) {
  const viewportWidth = globalThis.innerWidth;
  const viewportHeight = globalThis.innerHeight;
  const gap = 18;
  const margin = 16;
  const placementOrder = getWalkthroughPlacementOrder(preferredPlacement);

  const coordinatesFor = (placement) => {
    switch (placement) {
      case "bottom-end":
        return { left: rect.right - cardRect.width, top: rect.bottom + gap };
      case "top-start":
        return { left: rect.left, top: rect.top - cardRect.height - gap };
      case "top-end":
        return { left: rect.right - cardRect.width, top: rect.top - cardRect.height - gap };
      case "left-start":
        return { left: rect.left - cardRect.width - gap, top: rect.top };
      case "right-start":
        return { left: rect.right + gap, top: rect.top };
      case "bottom-start":
      default:
        return { left: rect.left, top: rect.bottom + gap };
    }
  };

  const fitsWithinViewport = (coords) => {
    return (
      coords.left >= margin &&
      coords.top >= margin &&
      coords.left + cardRect.width <= viewportWidth - margin &&
      coords.top + cardRect.height <= viewportHeight - margin
    );
  };

  for (const placement of placementOrder) {
    const coords = coordinatesFor(placement);
    if (fitsWithinViewport(coords)) {
      return coords;
    }
  }

  const fallback = coordinatesFor(preferredPlacement);
  return {
    left: Math.min(Math.max(margin, fallback.left), viewportWidth - cardRect.width - margin),
    top: Math.min(Math.max(margin, fallback.top), viewportHeight - cardRect.height - margin)
  };
}

function positionWalkthrough() {
  if (!walkthroughCard || !walkthroughSpotlight || !walkthroughActiveTarget) {
    return;
  }

  const targetRect = walkthroughActiveTarget.getBoundingClientRect();
  const spotlightPadding = ["movementsSection", "movementsTableArea", "expenseTableBody", "categoriesSection", "categoriesChartArea", "categoryDonut"].includes(walkthroughActiveTarget.id)
    ? 14
    : 10;
  const spotlightTop = Math.max(8, targetRect.top - spotlightPadding);
  const spotlightLeft = Math.max(8, targetRect.left - spotlightPadding);
  const spotlightWidth = Math.max(0, Math.min(globalThis.innerWidth - spotlightLeft - 8, targetRect.width + spotlightPadding * 2));
  const spotlightHeight = Math.max(0, Math.min(globalThis.innerHeight - spotlightTop - 8, targetRect.height + spotlightPadding * 2));
  walkthroughSpotlight.style.top = `${spotlightTop}px`;
  walkthroughSpotlight.style.left = `${spotlightLeft}px`;
  walkthroughSpotlight.style.width = `${spotlightWidth}px`;
  walkthroughSpotlight.style.height = `${spotlightHeight}px`;

  walkthroughCard.style.top = "24px";
  walkthroughCard.style.left = "16px";
  const cardRect = walkthroughCard.getBoundingClientRect();
  const step = WALKTHROUGH_STEPS[walkthroughStepIndex] || WALKTHROUGH_STEPS[0];
  const nextPosition = resolveWalkthroughPosition(targetRect, cardRect, step?.placement);
  walkthroughCard.style.left = `${nextPosition.left}px`;
  walkthroughCard.style.top = `${nextPosition.top}px`;
}

function setWalkthroughStep(nextStep) {
  if (!walkthroughOverlay || !walkthroughCard || !walkthroughSpotlight) {
    return;
  }

  const clamped = Math.max(0, Math.min(WALKTHROUGH_STEPS.length - 1, Number(nextStep) || 0));
  const step = WALKTHROUGH_STEPS[clamped];
  const target = getWalkthroughTarget(step);
  if (!(target instanceof HTMLElement)) {
    return;
  }

  walkthroughStepIndex = clamped;
  clearWalkthroughTarget();
  walkthroughActiveTarget = target;
  walkthroughActiveTarget.classList.add("walkthrough-target-active");
  updateWalkthroughCard(step, walkthroughStepIndex);

  target.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
  scheduleWalkthroughPosition();
}

function handleWalkthroughViewportChange() {
  if (!walkthroughOverlay || walkthroughOverlay.classList.contains("is-hidden")) {
    return;
  }

  if (!isDesktopWalkthroughViewport()) {
    finishWalkthrough({ returnFocus: false });
    showToast("El tutorial guiado queda disponible por ahora en desktop.", true);
    return;
  }

  scheduleWalkthroughPosition();
}

function startWalkthrough(trigger = null) {
  if (!walkthroughOverlay || !walkthroughCard || !walkthroughSpotlight) {
    return;
  }

  if (!isDesktopWalkthroughViewport()) {
    showToast("Por ahora el tutorial guiado esta disponible en desktop.", true);
    return;
  }

  walkthroughTrigger = trigger instanceof HTMLElement ? trigger : document.activeElement instanceof HTMLElement ? document.activeElement : null;
  hideDownloadMenu();
  hideCategoryFilterMenu();
  hideDateFilterMenu();
  hideBudgetPeriodMenu();
  hideAddMovementMenu();
  closeProfileDropdown();
  walkthroughOverlay.classList.remove("is-hidden");
  walkthroughOverlay.setAttribute("aria-hidden", "false");
  updateOverlayScrollLock();
  setWalkthroughStep(0);

  globalThis.addEventListener("resize", handleWalkthroughViewportChange);
  globalThis.addEventListener("scroll", scheduleWalkthroughPosition, true);

  requestAnimationFrame(() => {
    scheduleWalkthroughPosition();
    walkthroughCard?.focus({ preventScroll: true });
  });
}

function finishWalkthrough({ returnFocus = true } = {}) {
  if (!walkthroughOverlay || walkthroughOverlay.classList.contains("is-hidden")) {
    return;
  }

  walkthroughOverlay.classList.add("is-hidden");
  walkthroughOverlay.setAttribute("aria-hidden", "true");
  clearWalkthroughTarget();
  walkthroughStepIndex = -1;
  globalThis.removeEventListener("resize", handleWalkthroughViewportChange);
  globalThis.removeEventListener("scroll", scheduleWalkthroughPosition, true);

  if (walkthroughRepositionTimer) {
    clearTimeout(walkthroughRepositionTimer);
    walkthroughRepositionTimer = null;
  }

  updateOverlayScrollLock();

  if (returnFocus && walkthroughTrigger instanceof HTMLElement) {
    walkthroughTrigger.focus();
  }

  walkthroughTrigger = null;
}

function openAuthModal(trigger = null) {
  if (!authModal) {
    return;
  }

  authModalTrigger = trigger instanceof HTMLElement ? trigger : document.activeElement instanceof HTMLElement ? document.activeElement : null;
  authModal.classList.add("show");
  authModal.setAttribute("aria-hidden", "false");
  updateOverlayScrollLock();

  requestAnimationFrame(() => {
    if (authUser && syncNowBtn) {
      syncNowBtn.focus();
      return;
    }

    if (signInGoogleBtn && !signInGoogleBtn.classList.contains("is-hidden")) {
      signInGoogleBtn.focus();
    }
  });
}

function closeAuthModal() {
  if (!authModal) {
    return;
  }

  const wasOpen = authModal.classList.contains("show");
  authModal.classList.remove("show");
  authModal.setAttribute("aria-hidden", "true");
  updateOverlayScrollLock();

  if (wasOpen && authModalTrigger) {
    authModalTrigger.focus();
  }

  authModalTrigger = null;
}

function openFeedbackModal(trigger = null) {
  if (!feedbackModal) {
    return;
  }

  feedbackModalTrigger = trigger instanceof HTMLElement ? trigger : document.activeElement instanceof HTMLElement ? document.activeElement : null;
  feedbackModal.classList.add("show");
  feedbackModal.setAttribute("aria-hidden", "false");
  updateOverlayScrollLock();

  requestAnimationFrame(() => {
    feedbackMessageInput?.focus();
  });
}

function closeFeedbackModal() {
  if (!feedbackModal) {
    return;
  }

  const wasOpen = feedbackModal.classList.contains("show");
  feedbackModal.classList.remove("show");
  feedbackModal.setAttribute("aria-hidden", "true");
  if (feedbackForm) {
    feedbackForm.reset();
  }
  if (feedbackKindInput) {
    feedbackKindInput.value = "idea";
  }
  if (feedbackRatingInput) {
    feedbackRatingInput.value = "";
  }

  if (wasOpen && feedbackModalTrigger) {
    feedbackModalTrigger.focus();
  }

  feedbackModalTrigger = null;
  updateOverlayScrollLock();
}

async function getFeedbackSupabaseClient() {
  if (feedbackClient) {
    return feedbackClient;
  }

  if (supabaseClient) {
    feedbackClient = supabaseClient;
    return feedbackClient;
  }

  if (!hasCloudConfig()) {
    return null;
  }

  const factory = globalThis.supabase?.createClient;
  if (typeof factory !== "function") {
    return null;
  }

  try {
    feedbackClient = factory(cloudConfig.url, cloudConfig.anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });
    return feedbackClient;
  } catch {
    return null;
  }
}

async function submitFeedback() {
  if (feedbackSubmitting || !feedbackMessageInput || !feedbackKindInput) {
    return;
  }

  const message = String(feedbackMessageInput.value || "").trim();
  const kind = String(feedbackKindInput.value || "idea").trim().toLowerCase();
  const ratingRaw = String(feedbackRatingInput?.value || "").trim();
  const rating = ratingRaw ? Number(ratingRaw) : null;
  const email = String(feedbackEmailInput?.value || "").trim();

  if (message.length < 8) {
    showToast("Escribe un poco mas de detalle para poder ayudarte (minimo 8 caracteres).", true);
    feedbackMessageInput.focus();
    return;
  }

  const validKinds = new Set(["idea", "bug", "ux"]);
  if (!validKinds.has(kind)) {
    showToast("Tipo de feedback invalido.", true);
    return;
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast("El email no parece valido.", true);
    feedbackEmailInput?.focus();
    return;
  }

  if (rating !== null && (!Number.isFinite(rating) || rating < 1 || rating > 5)) {
    showToast("La valoracion debe ser entre 1 y 5.", true);
    feedbackRatingInput?.focus();
    return;
  }

  const client = await getFeedbackSupabaseClient();
  if (!client) {
    showToast("Feedback no disponible ahora. Falta configurar cloud en Supabase.", true);
    return;
  }

  feedbackSubmitting = true;
  if (feedbackSubmitBtn) {
    feedbackSubmitBtn.disabled = true;
    feedbackSubmitBtn.innerHTML = '<i class="bi bi-arrow-repeat spin"></i> Enviando...';
  }

  try {
    const payload = {
      kind,
      message,
      rating,
      email: email || null,
      user_id: authUser?.id || null,
      user_email: authUser?.email || null,
      app_version: APP_VERSION,
      page_url: globalThis.location?.href || null,
      user_agent: globalThis.navigator?.userAgent || null
    };

    const { error } = await withTimeout(client.from(FEEDBACK_TABLE_NAME).insert(payload), "feedback insert");

    if (error) {
      showToast(describeFeedbackError(error), true);
      return;
    }

    closeFeedbackModal();
    showToast("Gracias por tu feedback. Ya lo recibimos.");
  } catch (error) {
    const detail = error instanceof Error ? error.message : "";
    showToast(detail ? `No pudimos enviar feedback (${detail}).` : "No pudimos enviar feedback.", true);
  } finally {
    feedbackSubmitting = false;
    if (feedbackSubmitBtn) {
      feedbackSubmitBtn.disabled = false;
      feedbackSubmitBtn.innerHTML = '<i class="bi bi-send"></i> Enviar feedback';
    }
  }
}

function describeFeedbackError(error) {
  const message = String(error?.message || "").toLowerCase();
  if (message.includes("relation") && message.includes(FEEDBACK_TABLE_NAME)) {
    return "Falta crear la tabla de feedback en Supabase SQL Editor.";
  }
  if (message.includes("row-level security") || message.includes("permission denied")) {
    return "Faltan politicas RLS para permitir inserts anonimos de feedback.";
  }
  if (message.includes("invalid input syntax")) {
    return "Uno de los campos de feedback tiene un formato no valido.";
  }
  return "No pudimos guardar el feedback en la nube.";
}

function setSalaryEditable(isEditable) {
  if (!salaryInput) {
    return;
  }

  salaryEditMode = Boolean(isEditable);
  salaryInput.readOnly = !isEditable;
  salaryInput.tabIndex = isEditable ? 0 : -1;
  salaryInput.setAttribute("aria-readonly", String(!isEditable));
  salaryInput.classList.toggle("is-editable", isEditable);
  if (!isEditable) {
    salaryInput.value = formatAmountNumber(getMonthSalary(state.activeMonth), { withSymbol: false });
  }
  const wrapper = salaryInput.closest(".input-with-prefix");
  if (wrapper) {
    wrapper.classList.toggle("is-editable", isEditable);
  }
  const salaryCard = salaryInput.closest("#budgetMetricCard");
  if (salaryCard) {
    salaryCard.classList.toggle("is-salary-editing", isEditable);
  }

  if (toggleSalaryBtn) {
    toggleSalaryBtn.classList.toggle("is-editing", isEditable);
    toggleSalaryBtn.setAttribute("aria-label", isEditable ? `Guardar sueldo de ${formatMonthLabel(state.activeMonth)}` : `Editar sueldo de ${formatMonthLabel(state.activeMonth)}`);
    toggleSalaryBtn.setAttribute("title", isEditable ? `Guardar sueldo de ${formatMonthLabel(state.activeMonth)}` : `Editar sueldo de ${formatMonthLabel(state.activeMonth)}`);
  }

  if (isEditable) {
    requestAnimationFrame(() => {
      salaryInput.focus();
      salaryInput.select();
    });
  }
}

function applyTheme() {
  const resolvedTheme = getResolvedTheme();
  const isDark = resolvedTheme === "dark";
  document.body.classList.toggle("theme-dark", isDark);
  document.body.dataset.themePreference = state.theme;

  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta) {
    themeMeta.setAttribute("content", isDark ? "#0b1220" : "#213196");
  }

  if (themeToggleBtn) {
    themeToggleBtn.setAttribute("aria-pressed", String(isDark));
    themeToggleBtn.setAttribute("aria-label", isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
    themeToggleBtn.setAttribute(
      "title",
      state.theme === "system" ? `Tema del sistema (${isDark ? "oscuro" : "claro"})` : isDark ? "Modo claro" : "Modo oscuro"
    );
    themeToggleBtn.innerHTML = isDark
      ? '<i class="bi bi-sun"></i>'
      : '<i class="bi bi-moon-stars"></i>';
  }

  if (mobileThemeBtn) {
    mobileThemeBtn.setAttribute("aria-pressed", String(isDark));
    mobileThemeBtn.innerHTML = isDark
      ? '<i class="bi bi-sun"></i><span>Claro</span>'
      : '<i class="bi bi-moon-stars"></i><span>Oscuro</span>';
  }
}

function getResolvedTheme() {
  if (state.theme === "dark") {
    return "dark";
  }
  if (state.theme === "light") {
    return "light";
  }
  return systemThemeMedia?.matches ? "dark" : "light";
}

function toggleThemePreference() {
  const resolvedTheme = getResolvedTheme();
  state.theme = resolvedTheme === "dark" ? "light" : "dark";
  state.themeUserSet = true;
  saveState();
  applyTheme();
}

function syncInstallAvailability() {
  if (!installAppBtn) {
    return;
  }

  const installContext = getInstallAvailabilityContext();
  const canShow = installContext.isMobile && !installContext.isInstalled;

  updateInstallButtonCopy(installContext);
  installAppBtn.classList.toggle("is-hidden", !canShow);
}

function hideDownloadMenu() {
  if (!downloadMenu || !downloadMenuBtn) {
    return;
  }

  downloadMenu.classList.add("is-hidden");
  downloadMenuBtn.setAttribute("aria-expanded", "false");
  updateOverlayScrollLock();
}

function toggleDownloadMenu() {
  if (!downloadMenu || !downloadMenuBtn) {
    return;
  }

  hideCategoryFilterMenu();
  hideDateFilterMenu();
  hideBudgetPeriodMenu();
  hideAddMovementMenu();
  hideMobileAddMovementMenu();
  const willOpen = downloadMenu.classList.contains("is-hidden");
  downloadMenu.classList.toggle("is-hidden");
  downloadMenuBtn.setAttribute("aria-expanded", String(willOpen));
  updateOverlayScrollLock();
}

function hideCategoryFilterMenu() {
  if (!categoryFilterMenu || !mobileCategoryFilterBtn) {
    return;
  }

  categoryFilterMenu.classList.add("is-hidden");
  mobileCategoryFilterBtn.setAttribute("aria-expanded", "false");

  const searchInput = categoryFilterMenu.querySelector(".category-filter-search-input");
  if (searchInput instanceof HTMLInputElement) {
    searchInput.value = "";
    filterCategoryFilterMenuOptions("");
  }
  updateOverlayScrollLock();
}

function hideDateFilterMenu() {
  if (!dateFilterMenu || !mobileDateFilterBtn) {
    return;
  }

  dateFilterMenu.classList.add("is-hidden");
  mobileDateFilterBtn.setAttribute("aria-expanded", "false");
  updateOverlayScrollLock();
}

function hideBudgetPeriodMenu() {
  if (!budgetPeriodMenu || !budgetPeriodBtn) {
    return;
  }

  budgetPeriodMenu.classList.add("is-hidden");
  budgetPeriodBtn.setAttribute("aria-expanded", "false");
  syncBudgetPeriodMenuLayerState();
  updateOverlayScrollLock();
}

function hideMobileBudgetPeriodMenu() {
  if (!mobileBudgetPeriodMenu || !mobileBudgetPeriodBtn) {
    return;
  }

  mobileBudgetPeriodMenu.classList.add("is-hidden");
  mobileBudgetPeriodBtn.setAttribute("aria-expanded", "false");
  syncBudgetPeriodMenuLayerState();
  updateOverlayScrollLock();
}

function toggleCategoryFilterMenu() {
  if (!categoryFilterMenu || !mobileCategoryFilterBtn) {
    return;
  }

  hideDownloadMenu();
  hideDateFilterMenu();
  hideBudgetPeriodMenu();
  hideAddMovementMenu();
  hideMobileAddMovementMenu();
  const willOpen = categoryFilterMenu.classList.contains("is-hidden");
  categoryFilterMenu.classList.toggle("is-hidden");
  mobileCategoryFilterBtn.setAttribute("aria-expanded", String(willOpen));

  if (willOpen) {
    updateCategoryFilterMenuSelection();
    const searchInput = categoryFilterMenu.querySelector(".category-filter-search-input");
    if (searchInput instanceof HTMLInputElement) {
      searchInput.value = "";
      filterCategoryFilterMenuOptions("");
      requestAnimationFrame(() => searchInput.focus());
    }
  }
  updateOverlayScrollLock();
}

function updateCategoryFilterMenuSelection() {
  if (!categoryFilterMenu || !categoryFilter) {
    return;
  }

  const selectedValue = String(categoryFilter.value || "all").trim().toLowerCase();
  const optionButtons = categoryFilterMenu.querySelectorAll(".category-filter-option");
  optionButtons.forEach((button) => {
    if (!(button instanceof HTMLElement)) {
      return;
    }
    const buttonValue = String(button.dataset.categoryValue || "").trim().toLowerCase();
    const isSelected = buttonValue === selectedValue;
    setMenuItemSelected(button, isSelected);
  });
}

function filterCategoryFilterMenuOptions(query) {
  if (!categoryFilterMenu) {
    return;
  }

  const normalizedQuery = String(query || "").trim().toLowerCase();
  const optionButtons = [...categoryFilterMenu.querySelectorAll(".category-filter-option")];
  let visibleCount = 0;

  optionButtons.forEach((button) => {
    if (!(button instanceof HTMLElement)) {
      return;
    }

    const label = String(button.textContent || "").trim().toLowerCase();
    const isVisible = !normalizedQuery || label.includes(normalizedQuery);
    button.classList.toggle("is-hidden", !isVisible);
    if (isVisible) {
      visibleCount += 1;
    }
  });

  const emptyState = categoryFilterMenu.querySelector(".category-filter-empty");
  if (emptyState instanceof HTMLElement) {
    emptyState.classList.toggle("is-hidden", visibleCount > 0);
  }
}

function updateDateFilterMenuSelection() {
  if (!dateFilterMenu || !dateFilter) {
    return;
  }

  const selectedValue = normalizeDateFilterValue(dateFilter.value || "all");
  const optionButtons = dateFilterMenu.querySelectorAll(".date-filter-option");
  optionButtons.forEach((button) => {
    if (!(button instanceof HTMLElement)) {
      return;
    }
    const buttonValue = normalizeDateFilterValue(button.dataset.dateValue || "all");
    const isSelected = buttonValue === selectedValue;
    setMenuItemSelected(button, isSelected);
  });
}

function updateBudgetPeriodMenuSelection() {
  if (!budgetPeriodMenu) {
    return;
  }

  const selectedValue = normalizeBudgetPeriod(state.budgetPeriod || "monthly");
  const optionButtons = budgetPeriodMenu.querySelectorAll(".budget-period-option");
  optionButtons.forEach((button) => {
    if (!(button instanceof HTMLElement)) {
      return;
    }
    const buttonValue = normalizeBudgetPeriod(button.dataset.budgetPeriod || "daily");
    const isSelected = buttonValue === selectedValue;
    setMenuItemSelected(button, isSelected);
  });
}

function updateMobileBudgetPeriodSelection() {
  const selectedValue = normalizeBudgetPeriod(state.budgetPeriod || "monthly");

  if (mobileBudgetPeriodLabel) {
    const labels = {
      daily: "Disponible diario",
      monthly: "Disponible mensual"
    };
    mobileBudgetPeriodLabel.textContent = labels[selectedValue] || "Disponible mensual";
  }

  mobileBudgetPeriodButtons.forEach((button) => {
    const buttonValue = normalizeBudgetPeriod(button.dataset.mobileBudgetPeriod || "daily");
    const isSelected = buttonValue === selectedValue;
    setMenuItemSelected(button, isSelected);
    button.classList.toggle("is-active", isSelected);
    button.setAttribute("aria-checked", String(isSelected));
  });
}

function syncBudgetPeriodMenuLayerState() {
  const desktopMenuOpen = Boolean(budgetPeriodMenu && !budgetPeriodMenu.classList.contains("is-hidden"));
  const mobileMenuOpen = Boolean(mobileBudgetPeriodMenu && !mobileBudgetPeriodMenu.classList.contains("is-hidden"));
  const desktopWrap = budgetPeriodBtn instanceof HTMLElement ? budgetPeriodBtn.closest(".metric-period-dropdown") : null;
  const mobileWrap = mobileBudgetPeriodBtn instanceof HTMLElement ? mobileBudgetPeriodBtn.closest(".mobile-budget-period-wrap") : null;
  const mobilePanel = mobileBudgetPeriodBtn instanceof HTMLElement ? mobileBudgetPeriodBtn.closest(".mobile-primary-panel") : null;

  if (desktopWrap instanceof HTMLElement) {
    desktopWrap.classList.toggle("is-menu-open", desktopMenuOpen);
  }

  if (mobileWrap instanceof HTMLElement) {
    mobileWrap.classList.toggle("is-menu-open", mobileMenuOpen);
  }

  if (mobilePanel instanceof HTMLElement) {
    mobilePanel.classList.toggle("has-budget-period-menu-open", mobileMenuOpen);
  }
}

function applyBudgetPeriodSelection(period) {
  const normalizedPeriod = normalizeBudgetPeriod(period);
  state.budgetPeriod = normalizedPeriod;
  if (budgetPeriodSelect) {
    budgetPeriodSelect.value = normalizedPeriod;
  }
  updateBudgetPeriodMenuSelection();
  updateMobileBudgetPeriodSelection();
  saveState();
  renderSummary();
}

function ensureMenuItemSelectionIcon(button) {
  if (!(button instanceof HTMLElement)) {
    return null;
  }

  let icon = button.querySelector(".menu-item-selection-icon");
  if (icon instanceof HTMLElement) {
    return icon;
  }

  icon = document.createElement("span");
  icon.className = "menu-item-selection-icon material-symbols-rounded";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = "check";
  button.appendChild(icon);
  return icon;
}

function setMenuItemSelected(button, isSelected) {
  if (!(button instanceof HTMLElement)) {
    return;
  }

  const nextSelected = Boolean(isSelected);
  button.classList.toggle("is-selected", nextSelected);
  button.setAttribute("aria-pressed", String(nextSelected));
  const icon = ensureMenuItemSelectionIcon(button);
  if (icon instanceof HTMLElement) {
    icon.classList.toggle("is-hidden", !nextSelected);
    icon.style.display = nextSelected ? "inline-flex" : "none";
  }
}

function toggleDateFilterMenu() {
  if (!dateFilterMenu || !mobileDateFilterBtn) {
    return;
  }

  if (mobileDateFilterBtn.disabled || !isActiveMonthCurrent()) {
    return;
  }

  hideDownloadMenu();
  hideCategoryFilterMenu();
  hideBudgetPeriodMenu();
  hideAddMovementMenu();
  hideMobileAddMovementMenu();
  const willOpen = dateFilterMenu.classList.contains("is-hidden");
  dateFilterMenu.classList.toggle("is-hidden");
  mobileDateFilterBtn.setAttribute("aria-expanded", String(willOpen));
  if (willOpen) {
    updateDateFilterMenuSelection();
  }
  updateOverlayScrollLock();
}

function hideAddMovementMenu() {
  if (!addMovementMenu || !openExpenseModalBtn) {
    return;
  }

  addMovementMenu.classList.add("is-hidden");
  openExpenseModalBtn.setAttribute("aria-expanded", "false");
  updateOverlayScrollLock();
}

function hideMobileAddMovementMenu() {
  if (!mobileAddMovementMenu || !mobileAddFabBtn) {
    return;
  }

  mobileAddMovementMenu.classList.add("is-hidden");
  mobileAddFabBtn.setAttribute("aria-expanded", "false");
  updateOverlayScrollLock();
}

function toggleBudgetPeriodMenu() {
  if (!budgetPeriodMenu || !budgetPeriodBtn) {
    return;
  }

  hideDownloadMenu();
  hideCategoryFilterMenu();
  hideDateFilterMenu();
  hideAddMovementMenu();
  hideMobileAddMovementMenu();
  const willOpen = budgetPeriodMenu.classList.contains("is-hidden");
  budgetPeriodMenu.classList.toggle("is-hidden");
  budgetPeriodBtn.setAttribute("aria-expanded", String(willOpen));
  if (willOpen) {
    updateBudgetPeriodMenuSelection();
  }
  syncBudgetPeriodMenuLayerState();
  updateOverlayScrollLock();
}

function toggleMobileBudgetPeriodMenu() {
  if (!mobileBudgetPeriodMenu || !mobileBudgetPeriodBtn) {
    return;
  }

  hideDownloadMenu();
  hideCategoryFilterMenu();
  hideDateFilterMenu();
  hideBudgetPeriodMenu();
  hideAddMovementMenu();
  hideMobileAddMovementMenu();
  const willOpen = mobileBudgetPeriodMenu.classList.contains("is-hidden");
  mobileBudgetPeriodMenu.classList.toggle("is-hidden");
  mobileBudgetPeriodBtn.setAttribute("aria-expanded", String(willOpen));
  if (willOpen) {
    updateMobileBudgetPeriodSelection();
  }
  syncBudgetPeriodMenuLayerState();
  updateOverlayScrollLock();
}

function toggleAddMovementMenu() {
  if (!addMovementMenu || !openExpenseModalBtn) {
    return;
  }

  hideDownloadMenu();
  hideCategoryFilterMenu();
  hideDateFilterMenu();
  hideBudgetPeriodMenu();
  hideMobileAddMovementMenu();
  const willOpen = addMovementMenu.classList.contains("is-hidden");
  addMovementMenu.classList.toggle("is-hidden");
  openExpenseModalBtn.setAttribute("aria-expanded", String(willOpen));
  updateOverlayScrollLock();
}

function toggleMobileAddMovementMenu() {
  if (!mobileAddMovementMenu || !mobileAddFabBtn) {
    return;
  }

  hideDownloadMenu();
  hideCategoryFilterMenu();
  hideDateFilterMenu();
  hideBudgetPeriodMenu();
  hideAddMovementMenu();
  const willOpen = mobileAddMovementMenu.classList.contains("is-hidden");
  mobileAddMovementMenu.classList.toggle("is-hidden");
  mobileAddFabBtn.setAttribute("aria-expanded", String(willOpen));
  updateOverlayScrollLock();
}

function setActiveMobileNavButton(targetId) {
  const safeTarget = String(targetId || "").trim();
  mobileBottomNavButtons.forEach((button) => {
    const isActive = String(button.dataset.mobileNavTarget || "").trim() === safeTarget;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-current", isActive ? "page" : "false");
  });
}

function isSidebarMobileLayout() {
  if (!globalThis.matchMedia) {
    return false;
  }
  return globalThis.matchMedia("(max-width: 1023px)").matches;
}

function applySidebarState() {
  if (!appSidebar) {
    document.body.classList.remove("sidebar-collapsed", "sidebar-mobile");
    return;
  }

  const isMobileLayout = isSidebarMobileLayout();
  const isCollapsed = !isMobileLayout && Boolean(state.sidebarCollapsed);
  document.body.classList.toggle("sidebar-collapsed", isCollapsed);
  document.body.classList.toggle("sidebar-mobile", isMobileLayout);
  if (sidebarToggleBtn) {
    sidebarToggleBtn.setAttribute("aria-expanded", String(!isCollapsed));
    sidebarToggleBtn.classList.toggle("is-hidden", isMobileLayout);
    sidebarToggleBtn.disabled = isMobileLayout;
  }
  if (appSidebar) {
    appSidebar.setAttribute("data-collapsed", String(isCollapsed));
    appSidebar.setAttribute("data-mobile-layout", String(isMobileLayout));
  }
  if (profileDropdown && isMobileLayout) {
    profileDropdown.classList.add("is-hidden");
    if (openAuthModalBtn) {
      openAuthModalBtn.setAttribute("aria-expanded", "false");
    }
  }
}

function openProfileDropdown() {
  if (!profileDropdown || !openAuthModalBtn) {
    return;
  }

  syncProfileDropdownMount();

  closeMobileQuickAddSheet();
  closeMobileQuickEntrySheet();
  closeMobileFilterSheet();
  hideDownloadMenu();
  profileDropdown.classList.remove("is-hidden");
  openAuthModalBtn.setAttribute("aria-expanded", "true");
  mobileProfileBtn?.setAttribute("aria-expanded", "true");
  updateOverlayScrollLock();
}

function closeProfileDropdown() {
  if (!profileDropdown || !openAuthModalBtn) {
    return;
  }

  profileDropdown.classList.add("is-hidden");
  openAuthModalBtn.setAttribute("aria-expanded", "false");
  mobileProfileBtn?.setAttribute("aria-expanded", "false");
  updateOverlayScrollLock();
}

function toggleProfileDropdown() {
  if (!profileDropdown || !openAuthModalBtn) {
    return;
  }

  const willOpen = profileDropdown.classList.contains("is-hidden");
  if (willOpen) {
    openProfileDropdown();
    return;
  }

  closeProfileDropdown();
}

function closeDeleteConfirmModal() {
  if (!deleteConfirmModal) {
    return;
  }

  const wasOpen = deleteConfirmModal.classList.contains("show");
  deleteConfirmModal.classList.remove("show");
  deleteConfirmModal.setAttribute("aria-hidden", "true");
  pendingDeleteItemId = null;
  pendingDeleteProjection = null;
  pendingDeleteRecurringContext = null;
  pendingDeleteKind = "item";
  if (deleteConfirmTitle) {
    deleteConfirmTitle.textContent = "Eliminar movimiento";
  }
  if (deleteConfirmText) {
    deleteConfirmText.textContent = "Esta accion no se puede deshacer.";
  }
  if (confirmDeleteBtn) {
    confirmDeleteBtn.textContent = "Eliminar";
  }
  if (confirmDeleteSeriesBtn) {
    confirmDeleteSeriesBtn.textContent = "Eliminar en todos";
    confirmDeleteSeriesBtn.classList.add("is-hidden");
  }
  updateOverlayScrollLock();

  if (wasOpen && modalTrigger) {
    modalTrigger.focus();
  }
}

function openDeleteConfirmModal(item, trigger = null) {
  if (!deleteConfirmModal || !confirmDeleteBtn || !deleteConfirmText) {
    return;
  }

  modalTrigger = trigger instanceof HTMLElement ? trigger : null;
  pendingDeleteKind = "item";
  pendingDeleteRecurringContext = getRecurringDeleteContext(item);
  pendingDeleteProjection = item?.isProjectedRecurring
    ? { seriesId: getRecurringSeriesId(item), monthKey: getMonthKeyFromItem(item) }
    : null;
  pendingDeleteItemId = item?.isProjectedRecurring ? null : item.id;
  if (pendingDeleteRecurringContext) {
    const recurringMonthLabel = formatMonthLabel(pendingDeleteRecurringContext.monthKey);
    if (deleteConfirmTitle) {
      deleteConfirmTitle.textContent = "Eliminar movimiento recurrente";
    }
    deleteConfirmText.textContent = `Elige si quieres quitar "${item.name}" solo en ${recurringMonthLabel} o desde ${recurringMonthLabel} en adelante.`;
    confirmDeleteBtn.textContent = "Solo este mes";
    if (confirmDeleteSeriesBtn) {
      confirmDeleteSeriesBtn.textContent = "Desde este mes en adelante";
      confirmDeleteSeriesBtn.classList.remove("is-hidden");
    }
  } else {
    if (deleteConfirmTitle) {
      deleteConfirmTitle.textContent = item?.isProjectedRecurring ? "Omitir movimiento este mes" : "Eliminar movimiento";
    }
    deleteConfirmText.textContent = item?.isProjectedRecurring
      ? `Estas seguro de ocultar "${item.name}" solo en ${formatMonthLabel(getMonthKeyFromItem(item))}? En los meses siguientes seguira apareciendo porque es recurrente.`
      : `Estas seguro de eliminar "${item.name}"? Esta accion no se puede deshacer.`;
    confirmDeleteBtn.textContent = item?.isProjectedRecurring ? "Omitir este mes" : "Eliminar";
    if (confirmDeleteSeriesBtn) {
      confirmDeleteSeriesBtn.textContent = "Eliminar en todos";
      confirmDeleteSeriesBtn.classList.toggle("is-hidden", !item?.isProjectedRecurring);
    }
  }
  deleteConfirmModal.classList.add("show");
  deleteConfirmModal.setAttribute("aria-hidden", "false");
  updateOverlayScrollLock();

  requestAnimationFrame(() => {
    confirmDeleteBtn.focus();
  });
}

function openResetAllConfirmModal(trigger = null) {
  if (!deleteConfirmModal || !confirmDeleteBtn || !deleteConfirmText) {
    return;
  }

  modalTrigger = trigger instanceof HTMLElement ? trigger : null;
  pendingDeleteItemId = null;
  pendingDeleteProjection = null;
  pendingDeleteRecurringContext = null;
  pendingDeleteKind = "all";
  if (deleteConfirmTitle) {
    deleteConfirmTitle.textContent = "Reiniciar datos";
  }
  deleteConfirmText.textContent =
    "Se borraran todos tus ingresos y gastos guardados en este dispositivo. Esta accion no se puede deshacer.";
  confirmDeleteBtn.textContent = "Reiniciar";
  if (confirmDeleteSeriesBtn) {
    confirmDeleteSeriesBtn.classList.add("is-hidden");
  }
  deleteConfirmModal.classList.add("show");
  deleteConfirmModal.setAttribute("aria-hidden", "false");
  updateOverlayScrollLock();

  requestAnimationFrame(() => {
    confirmDeleteBtn.focus();
  });
}

function hasOpenOverlayState() {
  const onboardingIsOpen = onboardingModal ? onboardingModal.classList.contains("show") : false;
  const authIsOpen = authModal ? authModal.classList.contains("show") : false;
  const deleteIsOpen = deleteConfirmModal ? deleteConfirmModal.classList.contains("show") : false;
  const feedbackIsOpen = feedbackModal ? feedbackModal.classList.contains("show") : false;
  const salaryIsOpen = salaryModal ? salaryModal.classList.contains("show") : false;
  const walkthroughIsOpen = walkthroughOverlay ? !walkthroughOverlay.classList.contains("is-hidden") : false;
  const profileIsOpen = profileDropdown ? !profileDropdown.classList.contains("is-hidden") : false;
  const downloadIsOpen = downloadMenu ? !downloadMenu.classList.contains("is-hidden") : false;
  const categoryMenuIsOpen = categoryFilterMenu ? !categoryFilterMenu.classList.contains("is-hidden") : false;
  const dateMenuIsOpen = dateFilterMenu ? !dateFilterMenu.classList.contains("is-hidden") : false;
  const budgetMenuIsOpen = budgetPeriodMenu ? !budgetPeriodMenu.classList.contains("is-hidden") : false;
  const mobileBudgetMenuIsOpen = mobileBudgetPeriodMenu ? !mobileBudgetPeriodMenu.classList.contains("is-hidden") : false;
  const addMovementIsOpen = addMovementMenu ? !addMovementMenu.classList.contains("is-hidden") : false;
  const mobileAddMovementIsOpen = mobileAddMovementMenu ? !mobileAddMovementMenu.classList.contains("is-hidden") : false;
  return (
    expenseModal.classList.contains("show")
    || salaryIsOpen
    || onboardingIsOpen
    || authIsOpen
    || deleteIsOpen
    || feedbackIsOpen
    || walkthroughIsOpen
    || profileIsOpen
    || downloadIsOpen
    || categoryMenuIsOpen
    || dateMenuIsOpen
    || budgetMenuIsOpen
    || mobileBudgetMenuIsOpen
    || addMovementIsOpen
    || mobileAddMovementIsOpen
    || mobileQuickAddOpen
    || mobileAmountScreenOpen
    || mobileQuickEntryOpen
    || mobileFilterSheetOpen
  );
}

function closeActiveOverlayState() {
  if (mobileQuickEntryOpen) {
    closeMobileQuickEntrySheet();
    return true;
  }

  if (mobileAmountScreenOpen) {
    closeMobileAmountScreen();
    return true;
  }

  if (mobileQuickAddOpen) {
    closeMobileQuickAddSheet();
    return true;
  }

  if (mobileFilterSheetOpen) {
    closeMobileFilterSheet();
    return true;
  }

  if (mobileAddMovementMenu ? !mobileAddMovementMenu.classList.contains("is-hidden") : false) {
    hideMobileAddMovementMenu();
    return true;
  }

  if (addMovementMenu ? !addMovementMenu.classList.contains("is-hidden") : false) {
    hideAddMovementMenu();
    return true;
  }

  if (mobileBudgetPeriodMenu ? !mobileBudgetPeriodMenu.classList.contains("is-hidden") : false) {
    hideMobileBudgetPeriodMenu();
    return true;
  }

  if (budgetPeriodMenu ? !budgetPeriodMenu.classList.contains("is-hidden") : false) {
    hideBudgetPeriodMenu();
    return true;
  }

  if (dateFilterMenu ? !dateFilterMenu.classList.contains("is-hidden") : false) {
    hideDateFilterMenu();
    return true;
  }

  if (categoryFilterMenu ? !categoryFilterMenu.classList.contains("is-hidden") : false) {
    hideCategoryFilterMenu();
    return true;
  }

  if (downloadMenu ? !downloadMenu.classList.contains("is-hidden") : false) {
    hideDownloadMenu();
    return true;
  }

  if (deleteConfirmModal ? deleteConfirmModal.classList.contains("show") : false) {
    closeDeleteConfirmModal();
    return true;
  }

  if (expenseModal.classList.contains("show")) {
    closeModal();
    return true;
  }

  if (salaryModal ? salaryModal.classList.contains("show") : false) {
    closeSalaryModal();
    return true;
  }

  if (feedbackModal ? feedbackModal.classList.contains("show") : false) {
    closeFeedbackModal();
    return true;
  }

  if (authModal ? authModal.classList.contains("show") : false) {
    closeAuthModal();
    return true;
  }

  if (onboardingModal ? onboardingModal.classList.contains("show") : false) {
    closeOnboarding(false);
    return true;
  }

  if (walkthroughOverlay ? !walkthroughOverlay.classList.contains("is-hidden") : false) {
    finishWalkthrough({ returnFocus: false });
    return true;
  }

  if (profileDropdown ? !profileDropdown.classList.contains("is-hidden") : false) {
    closeProfileDropdown();
    return true;
  }

  return false;
}

function syncOverlayBackState(hasOpenOverlay = hasOpenOverlayState()) {
  if (hasOpenOverlay && !overlayBackStateActive) {
    const currentState = history.state && typeof history.state === "object" ? history.state : {};
    history.pushState({ ...currentState, dinariaOverlay: true }, "", location.href);
    overlayBackStateActive = true;
    return;
  }

  if (!hasOpenOverlay && overlayBackStateActive) {
    overlayBackStateActive = false;
    ignoreOverlayBackPopstate = true;
    history.back();
  }
}

function scheduleOverlayBackStateSync() {
  if (overlayBackStateSyncScheduled) {
    return;
  }

  overlayBackStateSyncScheduled = true;
  Promise.resolve().then(() => {
    overlayBackStateSyncScheduled = false;
    syncOverlayBackState(hasOpenOverlayState());
  });
}

function updateOverlayScrollLock() {
  const hasOpenOverlay = hasOpenOverlayState();
  const hasOpenMenuOverlay = hasOpenMenuOverlayState();
  document.body.classList.toggle("overflow-hidden", hasOpenOverlay);
  document.body.classList.toggle("has-menu-overlay", hasOpenMenuOverlay);
  document.documentElement.classList.toggle("overflow-hidden", hasOpenOverlay);
  if (overlayInteractionBlocker) {
    overlayInteractionBlocker.classList.toggle("is-hidden", !hasOpenMenuOverlay);
    overlayInteractionBlocker.setAttribute("aria-hidden", String(!hasOpenMenuOverlay));
  }
  scheduleOverlayBackStateSync();
}

function hasOpenMenuOverlayState() {
  return (
    (downloadMenu ? !downloadMenu.classList.contains("is-hidden") : false)
    || (categoryFilterMenu ? !categoryFilterMenu.classList.contains("is-hidden") : false)
    || (dateFilterMenu ? !dateFilterMenu.classList.contains("is-hidden") : false)
    || (addMovementMenu ? !addMovementMenu.classList.contains("is-hidden") : false)
    || (mobileAddMovementMenu ? !mobileAddMovementMenu.classList.contains("is-hidden") : false)
    || (profileDropdown ? !profileDropdown.classList.contains("is-hidden") : false)
  );
}

function syncProfileDropdownMount() {
  if (!profileDropdown || !profileDropdownOriginalParent) {
    return;
  }

  if (isMobileViewport()) {
    if (profileDropdown.parentElement !== document.body) {
      document.body.appendChild(profileDropdown);
    }
    return;
  }

  if (profileDropdown.parentElement === profileDropdownOriginalParent) {
    return;
  }

  if (profileDropdownOriginalNextSibling && profileDropdownOriginalNextSibling.parentNode === profileDropdownOriginalParent) {
    profileDropdownOriginalParent.insertBefore(profileDropdown, profileDropdownOriginalNextSibling);
  } else {
    profileDropdownOriginalParent.appendChild(profileDropdown);
  }
}

function sanitizeItem(item) {
  const name = String(item?.name || "").trim();
  if (!name) {
    return null;
  }

  const type = normalizeMovementType(item?.type || (item?.status === "ingreso" ? "income" : "expense"));
  const date = normalizeItemDate(item?.date);
  const category = normalizeCategoryKey(item?.category);
  const amount = Number.isFinite(Number(item?.amount)) ? Math.max(0, Number(item.amount)) : 0;
  const isRecurring = Boolean(item?.isRecurring || item?.isRecurringMonthly || false);
  const createdAt = normalizeItemCreatedAt(item?.createdAt, date);
  const recurringMonths = Number.isFinite(Number(item?.recurringMonths))
    ? clampRecurringMonths(item.recurringMonths, { min: 1, fallback: 1 })
    : undefined;
  const recurringEndMonth = normalizeRecurringEndMonth(item?.recurringEndMonth);
  const recurringSourceMonth = normalizeRecurringEndMonth(item?.recurringSourceMonth);

  return {
    id: String(item?.id || createItemId()),
    type,
    date,
    name,
    category,
    amount,
    isRecurring,
    createdAt: createdAt || undefined,
    recurringSeriesId: item?.recurringSeriesId ? String(item.recurringSeriesId) : undefined,
    sortAnchorId: item?.sortAnchorId ? String(item.sortAnchorId) : undefined,
    recurringSourceMonth: isRecurring && recurringSourceMonth ? recurringSourceMonth : undefined,
    recurringMonths: isRecurring && recurringMonths ? recurringMonths : undefined,
    recurringEndMonth: isRecurring && recurringEndMonth ? recurringEndMonth : undefined
  };
}

function normalizeLocalUiState(candidate) {
  const dismissedMonths = Array.isArray(candidate?.incomeMissingAlertDismissedMonths)
    ? [...new Set(candidate.incomeMissingAlertDismissedMonths.map((month) => normalizeMonthKey(month)).filter(Boolean))]
    : [];

  return {
    incomeMissingAlertDismissedMonths: dismissedMonths
  };
}

function loadLocalUiState() {
  try {
    const raw = localStorage.getItem(LOCAL_UI_STORAGE_KEY);
    return raw ? normalizeLocalUiState(JSON.parse(raw)) : normalizeLocalUiState();
  } catch {
    return normalizeLocalUiState();
  }
}

function saveLocalUiState() {
  try {
    localStorage.setItem(LOCAL_UI_STORAGE_KEY, JSON.stringify(normalizeLocalUiState(localUiState)));
  } catch {}
}

function isIncomeMissingAlertDismissed(monthKey = state.activeMonth) {
  return normalizeLocalUiState(localUiState).incomeMissingAlertDismissedMonths.includes(normalizeMonthKey(monthKey));
}

function setIncomeMissingAlertDismissed(monthKey = state.activeMonth, dismissed = true) {
  const normalizedMonth = normalizeMonthKey(monthKey);
  const dismissedMonths = new Set(normalizeLocalUiState(localUiState).incomeMissingAlertDismissedMonths);

  if (dismissed) {
    dismissedMonths.add(normalizedMonth);
  } else {
    dismissedMonths.delete(normalizedMonth);
  }

  localUiState = {
    ...normalizeLocalUiState(localUiState),
    incomeMissingAlertDismissedMonths: [...dismissedMonths]
  };
  saveLocalUiState();
}

function dismissIncomeMissingAlert(monthKey = state.activeMonth) {
  if (!isIncomeMissingAlertDismissed(monthKey)) {
    setIncomeMissingAlertDismissed(monthKey, true);
  }
}

function clearIncomeMissingAlertDismissal(monthKey = state.activeMonth) {
  if (isIncomeMissingAlertDismissed(monthKey)) {
    setIncomeMissingAlertDismissed(monthKey, false);
  }
}

function loadState() {
  const fallbackTimestamp = new Date().toISOString();
  const raw = localStorage.getItem(STATE_STORAGE_KEY);
  if (!raw) {
    return {
      salary: 0,
      monthlySalaries: {},
      activeMonth: getCurrentMonthKey(),
      recurringSkips: [],
      items: [],
      hideSalary: false,
      theme: "system",
      themeUserSet: false,
      budgetPeriod: "monthly",
      chartMode: "expense",
      sidebarCollapsed: false,
      onboardingSeen: false,
      lastModifiedAt: fallbackTimestamp
    };
  }

  try {
    const parsed = JSON.parse(raw);
    return normalizeStateSnapshot(parsed, fallbackTimestamp);
  } catch {
    return {
      salary: 0,
      monthlySalaries: {},
      activeMonth: getCurrentMonthKey(),
      recurringSkips: [],
      items: [],
      hideSalary: false,
      theme: "system",
      themeUserSet: false,
      budgetPeriod: "monthly",
      chartMode: "expense",
      sidebarCollapsed: false,
      onboardingSeen: false,
      lastModifiedAt: fallbackTimestamp
    };
  }
}

function normalizeStateSnapshot(candidate, fallbackTimestamp = new Date().toISOString()) {
  const items = Array.isArray(candidate?.items) ? candidate.items.map(sanitizeItem).filter(Boolean) : [];
  const currentMonthKey = getCurrentMonthKey();
  const monthlySalaries = Object.fromEntries(
    Object.entries(candidate?.monthlySalaries || {})
      .filter(([key]) => /^\d{4}-(0[1-9]|1[0-2])$/.test(String(key)))
      .map(([key, value]) => [normalizeMonthKey(key), Math.max(0, Number(value || 0))])
  );
  if (!Object.prototype.hasOwnProperty.call(monthlySalaries, currentMonthKey) && Number(candidate?.salary || 0) > 0) {
    monthlySalaries[currentMonthKey] = Math.max(0, Number(candidate.salary || 0));
  }
  const recurringSkips = Array.isArray(candidate?.recurringSkips)
    ? candidate.recurringSkips
      .map((entry) => ({
        seriesId: String(entry?.seriesId || "").trim(),
        month: normalizeMonthKey(entry?.month)
      }))
      .filter((entry) => entry.seriesId)
    : [];
  const parsedTimestamp = Date.parse(String(candidate?.lastModifiedAt || ""));
  const lastModifiedAt = Number.isFinite(parsedTimestamp)
    ? new Date(parsedTimestamp).toISOString()
    : fallbackTimestamp;
  const rawTheme = String(candidate?.theme || "").trim();
  const themeUserSet = typeof candidate?.themeUserSet === "boolean"
    ? candidate.themeUserSet
    : rawTheme === "dark";
  const normalizedTheme = rawTheme === "dark" || rawTheme === "light" || rawTheme === "system"
    ? rawTheme
    : "system";
  const theme = normalizedTheme === "light" && !themeUserSet ? "system" : normalizedTheme;

  return {
    salary: Object.prototype.hasOwnProperty.call(monthlySalaries, currentMonthKey)
      ? Number(monthlySalaries[currentMonthKey] || 0)
      : Number(candidate?.salary || 0),
    monthlySalaries,
    activeMonth: getCurrentMonthKey(),
    recurringSkips,
    items,
    hideSalary: Boolean(candidate?.hideSalary),
    theme,
    themeUserSet,
    budgetPeriod: normalizeBudgetPeriod(candidate?.budgetPeriod),
    chartMode: normalizeChartMode(candidate?.chartMode),
    sidebarCollapsed: Boolean(candidate?.sidebarCollapsed),
    onboardingSeen: Boolean(candidate?.onboardingSeen),
    lastModifiedAt
  };
}

function applySnapshotToState(snapshot) {
  const preservedActiveMonth = normalizeMonthKey(state?.activeMonth || getCurrentMonthKey());
  const preservedOnboardingSeen = Boolean(state?.onboardingSeen);
  const normalized = normalizeStateSnapshot(snapshot);
  state.salary = normalized.salary;
  state.monthlySalaries = normalized.monthlySalaries;
  state.activeMonth = preservedActiveMonth;
  state.recurringSkips = normalized.recurringSkips;
  state.items = normalized.items;
  state.hideSalary = normalized.hideSalary;
  state.theme = normalized.theme;
  state.themeUserSet = normalized.themeUserSet;
  state.budgetPeriod = normalized.budgetPeriod;
  state.chartMode = normalized.chartMode;
  state.sidebarCollapsed = normalized.sidebarCollapsed;
  // Onboarding belongs to the local installation, not the synced finance state.
  state.onboardingSeen = preservedOnboardingSeen;
  state.lastModifiedAt = normalized.lastModifiedAt;
}

function snapshotFromState() {
  const snapshot = normalizeStateSnapshot(state);
  snapshot.salary = getMonthSalary(getCurrentMonthKey());
  snapshot.activeMonth = getCurrentMonthKey();
  return snapshot;
}

function saveState({ preserveTimestamp = false, skipCloudSync = false } = {}) {
  if (!preserveTimestamp) {
    state.lastModifiedAt = new Date().toISOString();
  }

  localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(snapshotFromState()));

  if (!skipCloudSync) {
    scheduleCloudPush();
  }
}

function loadCloudConfig() {
  let saved = null;

  try {
    saved = JSON.parse(localStorage.getItem(ACTIVE_CLOUD_CONFIG_KEY) || "null");
  } catch {
    saved = null;
  }

  const fromWindow = globalThis.SUPABASE_CONFIG || {};
  const savedUrl = String(saved?.url || "").trim();
  const savedAnonKey = String(saved?.anonKey || "").trim();
  const windowUrl = String(fromWindow.url || "").trim();
  const windowAnonKey = String(fromWindow.anonKey || "").trim();
  let savedLooksValid = false;

  try {
    savedLooksValid = Boolean(savedUrl) && /\.supabase\.co$/i.test(new URL(savedUrl).hostname);
  } catch {
    savedLooksValid = false;
  }

  const preferWindowConfig =
    Boolean(windowUrl && windowAnonKey) &&
    (!savedUrl || !savedAnonKey || /localhost/i.test(savedUrl) || !savedLooksValid);

  return {
    url: preferWindowConfig ? windowUrl : savedUrl || windowUrl,
    anonKey: preferWindowConfig ? windowAnonKey : savedAnonKey || windowAnonKey
  };
}

function persistCloudConfig() {
  localStorage.setItem(
    ACTIVE_CLOUD_CONFIG_KEY,
    JSON.stringify({
      url: String(cloudConfig.url || "").trim(),
      anonKey: String(cloudConfig.anonKey || "").trim()
    })
  );
}

function hasCloudConfig() {
  return Boolean(String(cloudConfig.url || "").trim() && String(cloudConfig.anonKey || "").trim());
}

function hydrateCloudConfigInputs() {
  if (supabaseUrlInput) {
    supabaseUrlInput.value = cloudConfig.url || "";
  }
  if (supabaseAnonKeyInput) {
    supabaseAnonKeyInput.value = cloudConfig.anonKey || "";
  }
}

function parseCurrencyInput(value) {
  const raw = String(value ?? "").trim();
  if (!raw) {
    return 0;
  }

  const digitsOnly = raw.replace(/[^\d]/g, "");
  if (!digitsOnly) {
    return 0;
  }

  const parsed = Number(digitsOnly);
  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Math.max(0, parsed);
}

function formatAmountNumber(value, { withSymbol = false } = {}) {
  const num = Math.round(Number(value || 0));
  const safeNum = Number.isFinite(num) ? num : 0;
  const abs = Math.abs(safeNum);
  const formatted = new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(abs);
  const prefix = withSymbol ? "$ " : "";
  return safeNum < 0 ? `-${prefix}${formatted}` : `${prefix}${formatted}`;
}

function money(value) {
  return formatAmountNumber(value, { withSymbol: true });
}

function getTotals() {
  const expenseByCategory = Object.fromEntries(EXPENSE_CATEGORY_KEYS.map((key) => [key, 0]));
  const incomeByCategory = Object.fromEntries(INCOME_CATEGORY_KEYS.map((key) => [key, 0]));
  const expenseItems = getVisibleMonthExpenseItems(state.activeMonth);
  const incomeItems = getVisibleMonthIncomeItems(state.activeMonth);
  let monthlyIncome = 0;
  let monthlySpend = 0;

  for (const item of expenseItems) {
    const amount = Number(item.amount || 0);
    if (!Number.isFinite(amount) || amount <= 0) {
      continue;
    }

    const type = normalizeMovementType(item.type);
    if (type !== "expense") {
      continue;
    }

    monthlySpend += amount;
    const categoryKey = normalizeCategoryKeyForType(item.category, "expense");
    expenseByCategory[categoryKey] += amount;
  }

  for (const item of incomeItems) {
    const amount = Number(item.amount || 0);
    if (!Number.isFinite(amount) || amount <= 0) {
      continue;
    }

    monthlyIncome += amount;
    const categoryKey = normalizeCategoryKeyForType(item.category, "income");
    incomeByCategory[categoryKey] += amount;
  }

  return { expenseByCategory, incomeByCategory, monthlyIncome, monthlySpend };
}

function getRemainingDaysInMonth(monthKey = state.activeMonth) {
  const referenceDate = getMonthReferenceDate(monthKey);
  const normalizedMonth = normalizeMonthKey(monthKey);
  const end = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0);

  if (normalizedMonth !== getCurrentMonthKey()) {
    return Math.max(1, end.getDate());
  }

  const remaining = end.getDate() - referenceDate.getDate() + 1;
  return Math.max(1, remaining);
}

function getBudgetDaySpanForMonth(monthKey = state.activeMonth) {
  return getRemainingDaysInMonth(monthKey);
}

function getBudgetSuggestions(available, remainingDays) {
  const safeAvailable = Number.isFinite(available) ? available : 0;
  const safeRemainingDays = Math.max(1, Math.round(Number(remainingDays) || 0));
  const daily = safeAvailable / safeRemainingDays;

  return {
    daily,
    weekly: daily * 7,
    biweekly: daily * 15,
    monthly: safeAvailable
  };
}

function renderSummary() {
  const { monthlyIncome, monthlySpend } = getTotals();
  const { monthItems } = getMonthExpenseSummary(state.activeMonth);
  const monthIncomeItems = getVisibleMonthIncomeItems(state.activeMonth);
  const monthLabel = formatMonthLabel(state.activeMonth);
  const hasAnyData = monthItems.length > 0 || monthIncomeItems.length > 0;
  const available = monthlyIncome - monthlySpend;
  const budgetDaySpan = getBudgetDaySpanForMonth(state.activeMonth);
  const { daily, weekly, biweekly, monthly } = getBudgetSuggestions(available, budgetDaySpan);
  const selectedPeriod = normalizeBudgetPeriod(state.budgetPeriod);
  const periodLabel = selectedPeriod === "monthly" ? "Disponible mensual" : "Disponible diario";
  const periodValue = selectedPeriod === "monthly" ? monthly : daily;

  if (monthlyIncomeEl) {
    const incomeLabel = money(monthlyIncome);
    monthlyIncomeEl.textContent = incomeLabel;
    monthlyIncomeEl.setAttribute("title", incomeLabel);
  }
  if (mobileMonthlyIncomeEl) {
    const mobileIncomeLabel = money(monthlyIncome).replace("$ ", "$");
    mobileMonthlyIncomeEl.textContent = mobileIncomeLabel;
    mobileMonthlyIncomeEl.setAttribute("title", mobileIncomeLabel);
  }

  const spendLabel = money(monthlySpend);
  monthlySpendEl.textContent = spendLabel;
  monthlySpendEl.setAttribute("title", spendLabel);
  if (mobileMonthlySpendEl) {
    const mobileSpendLabel = spendLabel.replace("$ ", "$");
    mobileMonthlySpendEl.textContent = mobileSpendLabel;
    mobileMonthlySpendEl.setAttribute("title", mobileSpendLabel);
  }
  const availableLabel = money(available);
  availableBalanceEl.textContent = availableLabel;
  availableBalanceEl.setAttribute("title", availableLabel);
  availableBalanceEl.style.color = available >= 0 ? "var(--ok)" : "var(--bad)";

  if (weeklyBudgetEl) {
    const weeklyLabel = money(weekly);
    weeklyBudgetEl.textContent = weeklyLabel;
    weeklyBudgetEl.setAttribute("title", weeklyLabel);
    weeklyBudgetEl.style.color = weekly >= 0 ? "var(--ok)" : "var(--bad)";
  }

  if (budgetPeriodLabel) {
    budgetPeriodLabel.textContent = periodLabel;
  }
  if (budgetPeriodBtn) {
    budgetPeriodBtn.dataset.period = selectedPeriod;
  }
  updateBudgetPeriodMenuSelection();
  updateMobileBudgetPeriodSelection();
  if (budgetPeriodSelect && budgetPeriodSelect.value !== selectedPeriod) {
    budgetPeriodSelect.value = selectedPeriod;
  }

  if (dailyBudgetEl) {
    const periodValueLabel = money(periodValue);
    dailyBudgetEl.textContent = periodValueLabel;
    dailyBudgetEl.setAttribute("title", periodValueLabel);
    dailyBudgetEl.style.color = periodValue >= 0 ? "var(--ok)" : "var(--bad)";
    if (mobileAvailableBalanceEl) {
      const mobilePeriodValueLabel = periodValueLabel.replace("$ ", "$");
      mobileAvailableBalanceEl.textContent = mobilePeriodValueLabel;
      mobileAvailableBalanceEl.setAttribute("title", mobilePeriodValueLabel);
      mobileAvailableBalanceEl.style.color = "";
    }
  }

  if (mobileStickyIncome) {
    mobileStickyIncome.textContent = money(monthlyIncome).replace("$ ", "$");
  }
  if (mobileStickyIncomeLabel) {
    mobileStickyIncomeLabel.textContent = "Ingresos";
  }
  if (mobileStickyExpense) {
    mobileStickyExpense.textContent = money(monthlySpend).replace("$ ", "$");
  }
  if (mobileStickyExpenseLabel) {
    mobileStickyExpenseLabel.textContent = "Gastos";
  }
  const stickyAvailableLabel = periodLabel;
  const stickyAvailableValue = periodValue;
  if (mobileStickyAvailable) {
    mobileStickyAvailable.textContent = money(stickyAvailableValue).replace("$ ", "$");
    mobileStickyAvailable.classList.toggle("is-negative", stickyAvailableValue < 0);
  }
  if (mobileStickyAvailableLabel) {
    mobileStickyAvailableLabel.textContent = stickyAvailableLabel;
  }

  if (mobileBudgetHintEl) {
    if (!hasAnyData) {
      mobileBudgetHintEl.textContent = `Carga tu primer ingreso y tu primer gasto de ${monthLabel} para ver una sugerencia diaria o mensual.`;
    } else if (selectedPeriod === "monthly") {
      mobileBudgetHintEl.textContent = `Balance disponible estimado para ${monthLabel}: ${money(periodValue)}.`;
    } else {
      mobileBudgetHintEl.textContent = `Sugerencia diaria para ${monthLabel}: ${money(periodValue)} para cuidar tu balance.`;
    }
  }

  if (salaryInput && !salaryEditMode) {
    salaryInput.value = formatAmountNumber(getMonthSalary(state.activeMonth), { withSymbol: false });
  }

  [
    monthlyIncomeEl,
    monthlySpendEl,
    availableBalanceEl,
    dailyBudgetEl,
    mobileAvailableBalanceEl,
    mobileMonthlyIncomeEl,
    mobileMonthlySpendEl
  ].forEach(applyMetricValueDensity);

  scheduleMetricValueFit();
  renderInitialUsageState({
    totalIncome: monthlyIncome,
    totalExpenses: monthlySpend,
    hasIncome: monthlyIncome > 0,
    hasExpenses: monthlySpend > 0
  });
}

function getUsageStateForActiveMonth() {
  const { monthlyIncome: totalIncome, monthlySpend: totalExpenses } = getTotals();
  return {
    totalIncome,
    totalExpenses,
    hasIncome: totalIncome > 0,
    hasExpenses: totalExpenses > 0
  };
}

function isViewingFutureMonth(monthKey = state.activeMonth) {
  return compareMonthKeys(normalizeMonthKey(monthKey), getCurrentMonthKey()) > 0;
}

function shouldShowTopMonthEmptyState(usageState = getUsageStateForActiveMonth()) {
  return !isViewingPastMonth(state.activeMonth)
    && usageState.hasExpenses === true
    && usageState.hasIncome === false
    && !isIncomeMissingAlertDismissed(state.activeMonth);
}

function getMovementsEmptyStateConfig(usageState = getUsageStateForActiveMonth()) {
  if (isViewingPastMonth(state.activeMonth)) {
    return null;
  }

  if (usageState.hasIncome === false && usageState.hasExpenses === false) {
    if (isViewingFutureMonth(state.activeMonth)) {
      return {
        title: "Todavía no tenés movimientos para este mes",
        description: "Podés adelantarte y cargar gastos o ingresos para organizarte mejor.",
        ctaLabel: "Agregar movimiento",
        addType: "expense"
      };
    }

    return {
      title: "Empezá cargando tus ingresos y gastos",
      description: "Así vas a ver cuánto podés gastar este mes.",
      ctaLabel: "Agregar gasto",
      addType: "expense"
    };
  }

  return null;
}

function appendMovementsEmptyState(container, config) {
  if (!(container && config)) {
    return;
  }

  const icon = document.createElement("i");
  icon.className = "bi bi-inbox";
  icon.setAttribute("aria-hidden", "true");

  const copy = document.createElement("span");
  copy.className = "empty-state-copy";

  const title = document.createElement("strong");
  title.textContent = config.title;

  const description = document.createElement("span");
  description.textContent = config.description;

  copy.append(title, description);
  container.append(icon, copy);

  if (config.ctaLabel) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "primary-btn empty-state-action inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-white shadow-sm";
    button.textContent = config.ctaLabel;
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      openMovementCreateFlow(button, config.addType || "expense");
    });
    container.appendChild(button);
  }
}

function renderInitialUsageState({ totalIncome = 0, totalExpenses = 0, hasIncome = false, hasExpenses = false } = {}) {
  if (!(initialUsageState && initialUsageCard && initialUsageTitle && initialUsageDescription && initialUsageCtaBtn && initialUsageDismissBtn)) {
    return;
  }

  if (isViewingPastMonth(state.activeMonth)) {
    initialUsageState.classList.add("is-hidden");
    initialUsageState.setAttribute("aria-hidden", "true");
    return;
  }

  if (hasIncome || !hasExpenses) {
    clearIncomeMissingAlertDismissal(state.activeMonth);
  }

  const shouldShowIncomeAlert = hasExpenses === true
    && hasIncome === false
    && !isIncomeMissingAlertDismissed(state.activeMonth);

  if (!shouldShowIncomeAlert) {
    initialUsageState.classList.add("is-hidden");
    initialUsageState.setAttribute("aria-hidden", "true");
    return;
  }

  initialUsageState.classList.remove("is-hidden");
  initialUsageState.setAttribute("aria-hidden", "false");
  initialUsageCard.dataset.state = "missing-income";
  initialUsageTitle.textContent = "Te falta cargar un ingreso";
  initialUsageDescription.textContent = "Ya cargaste gastos. Sumá un ingreso para ver cuánto te queda este mes.";
  initialUsageDescription.classList.remove("is-hidden");
  initialUsageCtaBtn.classList.add("is-hidden");
  initialUsageDismissBtn.classList.remove("is-hidden");
}

function applyMetricValueDensity(element) {
  if (!(element instanceof HTMLElement)) {
    return;
  }

  element.classList.remove(
    "metric-value-compact",
    "metric-value-compact-md",
    "metric-value-compact-lg",
    "metric-value-compact-xl"
  );

  const valueLength = String(element.textContent || "").trim().length;
  if (valueLength >= 30) {
    element.classList.add("metric-value-compact-xl");
  } else if (valueLength >= 26) {
    element.classList.add("metric-value-compact-lg");
  } else if (valueLength >= 21) {
    element.classList.add("metric-value-compact-md");
  } else if (valueLength >= 17) {
    element.classList.add("metric-value-compact");
  }
}

function fitMetricValue(element) {
  if (!(element instanceof HTMLElement) || element.clientWidth <= 0) {
    return;
  }

  element.style.fontSize = "";
  element.classList.remove("metric-value-fitted", "metric-value-fitted-sm", "metric-value-fitted-xs");

  const computed = globalThis.getComputedStyle(element);
  const baseSize = Number.parseFloat(computed.fontSize) || 30;
  const minSize = Math.max(12, Math.round(baseSize * 0.42));
  let nextSize = Math.round(baseSize);
  const overflowWidth = element.scrollWidth;
  const visibleWidth = element.clientWidth;

  if (overflowWidth > visibleWidth + 1) {
    const ratio = visibleWidth / overflowWidth;
    nextSize = Math.max(minSize, Math.floor(baseSize * ratio * 0.985));
    element.style.fontSize = `${nextSize}px`;
  }

  while (nextSize > minSize && element.scrollWidth > element.clientWidth + 1) {
    nextSize -= 1;
    element.style.fontSize = `${nextSize}px`;
  }

  if (nextSize < baseSize) {
    element.classList.add("metric-value-fitted");
    if (nextSize <= baseSize - 4) {
      element.classList.add("metric-value-fitted-sm");
    }
    if (nextSize <= baseSize - 8) {
      element.classList.add("metric-value-fitted-xs");
    }
  }
}

function scheduleMetricValueFit() {
  const runFit = () => {
    [
      monthlyIncomeEl,
      monthlySpendEl,
      availableBalanceEl,
      dailyBudgetEl,
      mobileAvailableBalanceEl,
      mobileMonthlyIncomeEl,
      mobileMonthlySpendEl
    ].forEach(fitMetricValue);
  };

  if (metricFitFrame) {
    cancelAnimationFrame(metricFitFrame);
  }
  if (metricFitTimeoutId) {
    clearTimeout(metricFitTimeoutId);
    metricFitTimeoutId = null;
  }

  runFit();
  metricFitFrame = requestAnimationFrame(() => {
    metricFitFrame = null;
    runFit();
    metricFitTimeoutId = window.setTimeout(() => {
      metricFitTimeoutId = null;
      runFit();
    }, 48);
  });
}

function getFilteredItems() {
  const selectedCategory = categoryFilter ? categoryFilter.value : "all";
  const selectedDate = dateFilter ? normalizeDateFilterValue(dateFilter.value) : "all";
  const selectedStatus = statusFilter ? normalizeStatusFilterValue(statusFilter.value) : "all";
  const monthItems = getVisibleMonthExpenseItems(state.activeMonth);
  const itemOrder = getItemInsertionOrderMap();

  return monthItems
    .filter((item) => {
      const passType = normalizeMovementType(item.type) === "expense";
      const passCategory = selectedCategory === "all" || item.category === selectedCategory;
      const passDate = passesDateFilter(item.date, selectedDate);
      const passStatus = passesStatusFilter(item, selectedStatus);
      return passType && passCategory && passDate && passStatus;
    })
    .sort((a, b) => compareItemsByNewestFirst(a, b, itemOrder));
}

function getFilteredMobileItems() {
  const selectedCategory = categoryFilter ? categoryFilter.value : "all";
  const selectedDate = dateFilter ? normalizeDateFilterValue(dateFilter.value) : "all";
  const selectedStatus = statusFilter ? normalizeStatusFilterValue(statusFilter.value) : "all";
  const monthItems = [
    ...getVisibleMonthExpenseItems(state.activeMonth),
    ...getVisibleMonthIncomeItems(state.activeMonth)
  ];
  const itemOrder = getItemInsertionOrderMap();

  return monthItems
    .filter((item) => {
      const normalizedType = normalizeMovementType(item.type);
      const normalizedCategory = normalizeCategoryKeyForType(item.category, normalizedType);
      const passCategory = selectedCategory === "all" || normalizedCategory === selectedCategory;
      const passDate = passesDateFilter(item.date, selectedDate);
      const passStatus = passesStatusFilter(item, selectedStatus);
      return passCategory && passDate && passStatus;
    })
    .sort((a, b) => compareItemsByNewestFirst(a, b, itemOrder));
}

function renderExpenseTable() {
  const filteredItems = getFilteredItems();
  const monthItems = getVisibleMonthExpenseItems(state.activeMonth);
  const usageState = getUsageStateForActiveMonth();
  const monthEmptyConfig = !monthItems.length ? getMovementsEmptyStateConfig(usageState) : null;
  expenseTableBody.innerHTML = "";

  if (!filteredItems.length) {
    const monthLabel = formatMonthLabel(state.activeMonth);
    const row = document.createElement("tr");
    row.className = "is-empty-row";
    const cell = document.createElement("td");
    cell.colSpan = 6;
    cell.className = "table-empty";
    if (monthEmptyConfig) {
      appendMovementsEmptyState(cell, monthEmptyConfig);
    } else {
      cell.innerHTML = monthItems.length
        ? '<i class="bi bi-inbox"></i><span class="empty-state-copy"><strong>No encontramos gastos para este filtro</strong><span>Prueba otra fecha o cambia la categoria.</span></span>'
        : `<i class="bi bi-inbox"></i><span class="empty-state-copy"><strong>${monthLabel} todavia no tiene gastos visibles</strong><span>Los gastos puntuales quedan en su mes y los recurrentes apareceran aqui automaticamente.</span></span>`;
    }
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
  const filteredItems = getFilteredMobileItems();
  const monthItems = [
    ...getVisibleMonthExpenseItems(state.activeMonth),
    ...getVisibleMonthIncomeItems(state.activeMonth)
  ];
  const usageState = getUsageStateForActiveMonth();
  const monthEmptyConfig = !monthItems.length ? getMovementsEmptyStateConfig(usageState) : null;
  expenseMobileList.innerHTML = "";

  if (!filteredItems.length) {
    const monthLabel = formatMonthLabel(state.activeMonth);
    const empty = document.createElement("article");
    empty.className = "mobile-expense-card";
    const content = document.createElement("div");
    content.className = "table-empty";
    if (monthEmptyConfig) {
      appendMovementsEmptyState(content, monthEmptyConfig);
    } else {
      content.innerHTML = monthItems.length
        ? '<i class="bi bi-inbox"></i><span class="empty-state-copy"><strong>No encontramos movimientos para este filtro</strong><span>Prueba otra fecha o cambia la categoria.</span></span>'
        : `<i class="bi bi-inbox"></i><span class="empty-state-copy"><strong>${monthLabel} todavia no tiene movimientos</strong><span>Carga un gasto o ingreso para empezar a ver tu resumen del mes.</span></span>`;
    }
    empty.appendChild(content);
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
  const itemType = normalizeMovementType(item.type);
  const categoryKey = normalizeCategoryKeyForType(item.category, itemType);
  const config = getCategoryConfig(categoryKey);
  const isRecurring = Boolean(item.isRecurring);
  const isMobileRow = node.classList.contains("mobile-expense-row");
  node.setAttribute("data-type", itemType);
  node.setAttribute("data-category", categoryKey);
  node.setAttribute("data-frequency", isRecurring ? "recurring" : "one-time");

  const nameNode = node.querySelector(".item-name-text") || node.querySelector(".mobile-item-name");
  if (nameNode) {
    nameNode.textContent = item.name;
    nameNode.setAttribute("title", item.name);
  }

  const secondaryNode = node.querySelector(".mobile-item-secondary");
  if (secondaryNode) {
    secondaryNode.textContent = config.label;
    secondaryNode.setAttribute("title", config.label);
  }

  const dateNode = node.querySelector(".date-text");
  if (dateNode) {
    const dateLabel = isMobileRow
      ? formatItemCreatedTime(item.createdAt, item.date)
      : formatItemDate(item.date);
    dateNode.textContent = dateLabel;
    dateNode.setAttribute("title", dateLabel);
    dateNode.classList.toggle("is-hidden", !dateLabel);
  }

  const chip = node.querySelector(".category-chip");
  if (chip) {
    chip.textContent = config.label;
    chip.dataset.category = categoryKey;
    styleCategoryChip(chip, categoryKey);
  }

  const iconNode = node.querySelector(".mobile-item-icon");
  const iconWrapNode = node.querySelector(".mobile-item-icon-wrap");
  if (iconNode instanceof HTMLElement) {
    iconNode.textContent = getCategorySymbol(categoryKey, itemType);
  }
  if (iconWrapNode instanceof HTMLElement) {
    iconWrapNode.style.color = config.color;
    iconWrapNode.style.background = `${config.color}1A`;
  }

  const frequencyText = node.querySelector(".frequency-text");
  if (frequencyText) {
    const { label: frequencyLabel, title: frequencyTitle } = getRecurringDisplayMeta(item);
    if (isMobileRow) {
      frequencyText.textContent = isRecurring ? frequencyLabel : "";
      frequencyText.setAttribute("title", isRecurring ? frequencyTitle : "");
      frequencyText.classList.toggle("is-hidden", !isRecurring);
      if (isRecurring) {
        frequencyText.style.setProperty("display", "inline-block", "important");
      } else {
        frequencyText.style.setProperty("display", "none", "important");
      }
    } else {
      frequencyText.textContent = frequencyLabel;
      frequencyText.setAttribute("title", frequencyTitle);
      frequencyText.classList.remove("is-hidden");
      frequencyText.style.removeProperty("display");
    }
  }

  const recurringIndicator = node.querySelector(".mobile-item-recurring-indicator");
  if (recurringIndicator) {
    const { title: recurringTitle } = getRecurringDisplayMeta(item);
    recurringIndicator.classList.toggle("is-hidden", !isRecurring);
    recurringIndicator.setAttribute("title", recurringTitle);
  }

  const amountText = node.querySelector(".amount-text");
  if (amountText) {
    const amountLabel = money(item.amount);
    const isPositive = itemType === "income";
    const amountColor = isPositive ? "#067a31" : "#111827";
    if (isMobileRow) {
      const compactAmountLabel = amountLabel.replace("$ ", "$");
      const mobileAmountLabel = `${isPositive ? "+" : "-"}${compactAmountLabel}`;
      amountText.textContent = mobileAmountLabel;
      node.setAttribute("data-mobile-amount", mobileAmountLabel);
    } else {
      amountText.textContent = amountLabel;
    }
    amountText.classList.toggle("is-positive", isPositive);
    amountText.classList.toggle("is-negative", !isPositive);
    amountText.style.setProperty("color", amountColor, "important");
    amountText.setAttribute("title", amountLabel);
  }

  const amountWrap = node.querySelector(".mobile-item-amount-wrap");
  if (amountWrap) {
    amountWrap.style.setProperty("color", itemType === "income" ? "#067a31" : "#111827", "important");
  }

  const editItemBtn = node.querySelector(".edit-item-btn");
  const deleteItemBtn = node.querySelector(".delete-item-btn");

  if (editItemBtn) {
    editItemBtn.addEventListener("click", () => {
      openExpenseModalForEdit(item, editItemBtn);
    });
  }

  if (deleteItemBtn) {
    deleteItemBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      openDeleteConfirmModal(item, deleteItemBtn);
    });
  }

  if (isMobileRow) {
    node.addEventListener("click", () => {
      if (isMobileViewport()) {
        openMobileQuickEntrySheet(item.type, item.amount, item);
        return;
      }
      openExpenseModalForEdit(item, node);
    });
    node.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (isMobileViewport()) {
          openMobileQuickEntrySheet(item.type, item.amount, item);
          return;
        }
        openExpenseModalForEdit(item, node);
      }
    });
  }
}

function renderDonut() {
  const { expenseByCategory } = getTotals();
  const categoryKeys = EXPENSE_CATEGORY_KEYS;
  const categoryTotals = expenseByCategory;

  const series = categoryKeys.map((key) => ({
    key,
    label: CATEGORY_CONFIG[key].label,
    help: CATEGORY_CONFIG[key].help,
    color: CATEGORY_CONFIG[key].color,
    amount: Number(categoryTotals[key] || 0)
  })).filter((item) => item.amount > 0).sort((a, b) => b.amount - a.amount);

  if (!donutSvg) {
    return;
  }
  if (categoryDonut) {
    categoryDonut.setAttribute("aria-label", "Grafico de barras por categorias de gasto");
  }

  donutSvg.innerHTML = "";
  if (donutLegend) {
    donutLegend.innerHTML = "";
    donutLegend.classList.add("is-hidden");
  }
  if (donutHoverTooltip) {
    donutHoverTooltip.classList.add("is-hidden");
  }

  if (!series.length) {
    const monthLabel = formatMonthLabel(state.activeMonth);
    const hasItemsOfMode = getVisibleMonthExpenseItems(state.activeMonth).length > 0;
    const empty = document.createElement("p");
    empty.className = "bar-chart-empty";
    empty.innerHTML = hasItemsOfMode
      ? '<i class="bi bi-inbox"></i><span class="empty-state-copy"><strong>Aun no vemos categorias con monto</strong><span>Cuando registres gastos con importe, este panel te ayudara a detectar patrones.</span></span>'
      : `<i class="bi bi-inbox"></i><span class="empty-state-copy"><strong>${monthLabel} todavia no tiene categorias con gasto</strong><span>Cuando registres gastos del mes, aqui veras que categorias pesan mas.</span></span>`;
    donutSvg.appendChild(empty);
    return;
  }

  const maxValue = Math.max(...series.map((item) => item.amount), 1);

  for (const item of series) {
    const row = document.createElement("div");
    row.className = "bar-row";
    row.setAttribute("aria-label", `${item.label}: ${money(item.amount)}`);

    const head = document.createElement("div");
    head.className = "bar-row-head";

    const label = document.createElement("span");
    label.className = "bar-row-label";
    label.textContent = item.label;

    const amount = document.createElement("strong");
    amount.className = "bar-row-value";
    amount.textContent = money(item.amount);
    amount.setAttribute("title", money(item.amount));

    head.appendChild(label);
    head.appendChild(amount);

    const track = document.createElement("div");
    track.className = "bar-track";
    const fill = document.createElement("div");
    fill.className = "bar-fill";
    fill.style.background = item.color;
    fill.style.width = `${Math.max(6, Math.round((item.amount / maxValue) * 100))}%`;
    track.appendChild(fill);

    row.appendChild(head);
    row.appendChild(track);

    donutSvg.appendChild(row);
  }
}

function getCategoryFilterLabel() {
  if (!categoryFilter) {
    return "Todas";
  }
  const value = String(categoryFilter.value || "all").trim().toLowerCase();
  if (value !== "all" && CATEGORY_CONFIG[value]) {
    return CATEGORY_CONFIG[value].label;
  }
  return "Todas";
}

function getActiveMovementFilters() {
  const activeFilters = [];
  const selectedCategory = String(categoryFilter?.value || "all").trim().toLowerCase();
  const selectedDate = isActiveMonthCurrent() ? normalizeDateFilterValue(dateFilter?.value || "all") : "all";
  const selectedStatus = normalizeStatusFilterValue(statusFilter?.value || "all");

  if (selectedCategory !== "all" && CATEGORY_CONFIG[selectedCategory]) {
    activeFilters.push({
      key: "category",
      label: `Categoria: ${CATEGORY_CONFIG[selectedCategory].label}`
    });
  }

  if (selectedDate !== "all") {
    activeFilters.push({
      key: "date",
      label: `Fecha: ${getDateFilterLabel()}`
    });
  }

  if (selectedStatus !== "all") {
    activeFilters.push({
      key: "status",
      label: `Recurrencia: ${getStatusFilterLabel()}`
    });
  }

  return activeFilters;
}

function setFilterButtonState(button, { icon, label, active = false } = {}) {
  if (!(button instanceof HTMLElement)) {
    return;
  }

  button.classList.toggle("is-filter-active", Boolean(active));
  button.innerHTML = `
    <i class="bi bi-${icon}"></i>
    <span>${label}</span>
    ${active ? '<span class="filter-active-badge" aria-hidden="true"></span>' : ""}
  `;
}

function updateMovementFilterUi() {
  const filteredItems = getFilteredItems();
  const monthItems = getVisibleMonthExpenseItems(state.activeMonth);
  const activeFilters = getActiveMovementFilters();
  const activeFilterCount = activeFilters.length;
  const hasAnyFilter = activeFilterCount > 0;
  const hasCategoryFilter = activeFilters.some((filter) => filter.key === "category");
  const hasDateFilter = activeFilters.some((filter) => filter.key === "date");
  const hasStatusFilter = activeFilters.some((filter) => filter.key === "status");

  setFilterButtonState(mobileCategoryFilterBtn, {
    icon: "funnel",
    label: hasAnyFilter ? `Filtrar (${activeFilterCount})` : "Filtrar",
    active: hasAnyFilter
  });

  setFilterButtonState(mobileDateFilterBtn, {
    icon: "calendar-week",
    label: hasDateFilter ? `Fecha: ${getDateFilterLabel()}` : "Fecha: Todo",
    active: hasDateFilter
  });

  setFilterButtonState(mobileStatusFilterBtn, {
    icon: "arrow-repeat",
    label: hasStatusFilter ? `Recurrencia: ${getStatusFilterLabel()}` : "Recurrencia: Todo",
    active: hasStatusFilter
  });

  if (movementsFilterIndicator instanceof HTMLElement) {
    movementsFilterIndicator.classList.toggle("is-hidden", !hasAnyFilter);
    movementsFilterIndicator.textContent = hasAnyFilter
      ? activeFilterCount === 1
        ? "1 filtro activo"
        : `${activeFilterCount} filtros activos`
      : "";
  }

  if (!(movementsFilterStatus instanceof HTMLElement) || !(movementsFilterSummary instanceof HTMLElement) || !(movementsActiveFilters instanceof HTMLElement)) {
    return;
  }

  if (!hasAnyFilter) {
    movementsFilterStatus.classList.add("is-hidden");
    movementsActiveFilters.innerHTML = "";
    movementsFilterSummary.textContent = "";
    return;
  }

  movementsFilterStatus.classList.remove("is-hidden");
  movementsFilterSummary.textContent = `Lista filtrada: mostrando ${filteredItems.length} de ${monthItems.length} movimientos de ${formatMonthLabel(state.activeMonth)}`;
  movementsActiveFilters.innerHTML = activeFilters
    .map((filter) => `<span class="table-filter-chip">${filter.label}</span>`)
    .join("");
}

function getDateFilterLabel() {
  if (!dateFilter) {
    return "Todo";
  }

   if (!isActiveMonthCurrent()) {
    return "Todo";
  }

  const value = normalizeDateFilterValue(dateFilter.value);
  if (value === "today") {
    return "Hoy";
  }
  if (value === "last7") {
    return "Ultima semana";
  }
  if (value === "last30") {
    return "Ultimos 30 dias";
  }
  if (value === "thisMonth") {
    return "Este mes";
  }
  if (value === "lastMonth") {
    return "Mes pasado";
  }
  return "Todo";
}

function getStatusFilterLabel() {
  if (!statusFilter) {
    return "Todos";
  }

  const value = normalizeStatusFilterValue(statusFilter.value);
  if (value === "recurring") {
    return "Recurrentes";
  }
  if (value === "oneTime") {
    return "Puntuales";
  }
  return "Todos";
}

function updateMobileFilterButtonLabels() {
  updateMovementFilterUi();
}

function syncDateFilterAvailability() {
  const allowDateFilter = isActiveMonthCurrent();
  if (!allowDateFilter) {
    if (dateFilter) {
      dateFilter.value = "all";
    }
    hideDateFilterMenu();
  }

  if (mobileDateFilterBtn) {
    mobileDateFilterBtn.disabled = !allowDateFilter;
    mobileDateFilterBtn.classList.toggle("is-filter-disabled", !allowDateFilter);
    mobileDateFilterBtn.setAttribute("aria-disabled", String(!allowDateFilter));
    mobileDateFilterBtn.setAttribute("title", allowDateFilter ? "Filtrar por fecha" : "El filtro por fecha se usa solo en el mes actual");
  }
}

function renderActiveMonthContext() {
  const monthKey = normalizeMonthKey(state.activeMonth);
  const monthLabel = formatMonthLabel(monthKey);
  const isCurrentMonth = monthKey === getCurrentMonthKey();
  const isPastMonth = isViewingPastMonth(monthKey);
  const isProjectedMonth = compareMonthKeys(monthKey, getCurrentMonthKey()) > 0;
  const { minMonth, maxMonth } = getMonthNavigationBounds();
  const canGoPrev = compareMonthKeys(monthKey, minMonth) > 0;
  const canGoNext = compareMonthKeys(monthKey, maxMonth) < 0;
  const { recurringCount, oneTimeCount } = getMonthExpenseSummary(monthKey);
  const detailParts = [];

  if (recurringCount > 0) {
    detailParts.push(`${recurringCount} Gasto${recurringCount === 1 ? "" : "s"} Recurrente${recurringCount === 1 ? "" : "s"}`);
  }
  if (oneTimeCount > 0) {
    detailParts.push(`${oneTimeCount} Gasto${oneTimeCount === 1 ? "" : "s"} Puntual${oneTimeCount === 1 ? "" : "es"}`);
  }
  if (!detailParts.length) {
    detailParts.push("Sin gastos cargados");
  }

  if (activeMonthLabel) {
    activeMonthLabel.textContent = monthLabel;
  }
  if (activeMonthSection) {
    activeMonthSection.dataset.monthState = isCurrentMonth
      ? "current"
      : isPastMonth
        ? "previous"
        : isProjectedMonth
          ? "projected"
          : "current";
  }
  if (activeMonthEyebrow) {
    activeMonthEyebrow.classList.remove("is-hidden");
    activeMonthEyebrow.textContent = isCurrentMonth
      ? "Mes actual"
      : isPastMonth
        ? "Mes pasado"
        : isProjectedMonth
          ? "Mes futuro"
          : "Mes actual";
  }
  if (activeMonthMeta) {
    activeMonthMeta.textContent = detailParts.join(" · ");
  }
  if (mobileActiveMonthLabel) {
    mobileActiveMonthLabel.textContent = monthLabel;
  }
  if (mobileActiveMonthEyebrow) {
    mobileActiveMonthEyebrow.textContent = isCurrentMonth
      ? "Mes actual"
      : isPastMonth
        ? "Mes pasado"
        : isProjectedMonth
          ? "Mes futuro"
          : "Mes actual";
  }
  if (mobileActiveMonthMeta) {
    mobileActiveMonthMeta.textContent = detailParts.join(" · ");
  }
  if (mobileMonthShortcut) {
    mobileMonthShortcut.dataset.monthState = isCurrentMonth
      ? "current"
      : isPastMonth
        ? "previous"
        : isProjectedMonth
          ? "projected"
          : "current";
    const monthShortcutCopy = isCurrentMonth
      ? `Ya estas viendo ${monthLabel}`
      : `Volver a ${formatMonthLabel(getCurrentMonthKey())}`;
    mobileMonthShortcut.setAttribute("title", monthShortcutCopy);
    mobileMonthShortcut.setAttribute("aria-label", monthShortcutCopy);
  }
  updateMonthContextCopyWidth();
  if (jumpCurrentMonthBtn) {
    jumpCurrentMonthBtn.classList.toggle("is-hidden", isCurrentMonth);
  }
  if (prevMonthBtn) {
    prevMonthBtn.disabled = !canGoPrev;
    prevMonthBtn.setAttribute("aria-disabled", String(!canGoPrev));
    prevMonthBtn.title = canGoPrev
      ? "Ir al mes anterior"
      : "No hay meses anteriores con historial disponible";
  }
  if (nextMonthBtn) {
    nextMonthBtn.disabled = !canGoNext;
    nextMonthBtn.setAttribute("aria-disabled", String(!canGoNext));
    nextMonthBtn.title = canGoNext
      ? "Ir al mes siguiente"
      : `Solo puedes proyectar hasta ${formatMonthLabel(maxMonth)}`;
  }
  if (mobilePrevMonthBtn) {
    mobilePrevMonthBtn.disabled = !canGoPrev;
    mobilePrevMonthBtn.setAttribute("aria-disabled", String(!canGoPrev));
  }
  if (mobileNextMonthBtn) {
    mobileNextMonthBtn.disabled = !canGoNext;
    mobileNextMonthBtn.setAttribute("aria-disabled", String(!canGoNext));
  }
  if (openExpenseModalBtn) {
    openExpenseModalBtn.disabled = isPastMonth;
    openExpenseModalBtn.setAttribute("aria-disabled", String(isPastMonth));
    openExpenseModalBtn.classList.toggle("is-month-disabled", isPastMonth);
    openExpenseModalBtn.title = isPastMonth
      ? `No puedes agregar gastos en ${monthLabel}. Vuelve al mes actual o avanza a un mes nuevo.`
      : "Agregar gasto";
  }
  if (mobileAddFabBtn) {
    mobileAddFabBtn.disabled = isPastMonth;
    mobileAddFabBtn.setAttribute("aria-disabled", String(isPastMonth));
    mobileAddFabBtn.classList.toggle("is-month-disabled", isPastMonth);
    mobileAddFabBtn.title = isPastMonth
      ? `No puedes agregar gastos en ${monthLabel}.`
      : "Agregar gasto";
  }
  if (mobileEditSalaryBtn) {
    mobileEditSalaryBtn.disabled = isPastMonth;
    mobileEditSalaryBtn.setAttribute("aria-disabled", String(isPastMonth));
    mobileEditSalaryBtn.classList.toggle("is-month-disabled", isPastMonth);
    mobileEditSalaryBtn.title = isPastMonth
      ? `No puedes editar el sueldo de ${monthLabel}.`
      : `Editar sueldo de ${monthLabel}`;
  }
  if (heroSubtitle) {
    heroSubtitle.textContent = isCurrentMonth
      ? `Sigue registrando tus gastos de ${monthLabel} para entender rapido como viene tu plata.`
      : `Estas viendo ${monthLabel}. Puedes volver al mes actual cuando quieras sin perder tu historial.`;
  }
  syncDateFilterAvailability();
  if (!salaryEditMode && salaryInput) {
    salaryInput.value = formatAmountNumber(getMonthSalary(monthKey), { withSymbol: false });
  }
  if (!salaryEditMode && toggleSalaryBtn) {
    toggleSalaryBtn.setAttribute("aria-label", `Editar sueldo de ${monthLabel}`);
    toggleSalaryBtn.setAttribute("title", `Editar sueldo de ${monthLabel}`);
  }
}

function setActiveMonth(monthKey, { syncHistory = true } = {}) {
  const nextMonth = clampNavigableMonth(monthKey);
  if (nextMonth === normalizeMonthKey(state.activeMonth)) {
    renderActiveMonthContext();
    return;
  }

  hideDownloadMenu();
  hideCategoryFilterMenu();
  hideDateFilterMenu();
  hideBudgetPeriodMenu();
  hideMobileBudgetPeriodMenu();
  hideAddMovementMenu();
  hideMobileAddMovementMenu();
  closeProfileDropdown();
  state.activeMonth = nextMonth;
  if (salaryEditMode) {
    setSalaryEditable(false);
    salaryInput?.blur();
  }
  if (salaryModal?.classList.contains("show")) {
    closeSalaryModal();
  }
  if (expenseModal?.classList.contains("show") && isViewingPastMonth(nextMonth)) {
    closeModal();
  }
  closeMobileQuickEntrySheet();
  closeMobileAmountScreen();
  closeMobileFilterSheet();
  closeMobileQuickAddSheet();
  render();
  if (syncHistory) {
    syncMonthHistoryState(nextMonth);
  }
}

function measureUiTextWidth(text, style) {
  const canvas = measureUiTextWidth.canvas || (measureUiTextWidth.canvas = document.createElement("canvas"));
  const context = canvas.getContext("2d");
  if (!context) {
    return 0;
  }

  context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  return context.measureText(String(text || "")).width;
}

function updateMonthContextCopyWidth() {
  if (!activeMonthSection || !activeMonthCopy || !activeMonthLabel || !activeMonthEyebrow) {
    return;
  }

  if (window.matchMedia("(max-width: 1199px)").matches) {
    activeMonthSection.style.removeProperty("--month-context-copy-width");
    return;
  }

  const titleStyle = window.getComputedStyle(activeMonthLabel);
  const eyebrowStyle = window.getComputedStyle(activeMonthEyebrow);
  const { minMonth, maxMonth } = getMonthNavigationBounds();
  const titleLabels = [];
  const eyebrowLabels = ["Mes actual", "Mes pasado", "Mes futuro"];

  let pointer = normalizeMonthKey(minMonth);
  const safeLimit = 80;
  let guard = 0;

  while (compareMonthKeys(pointer, maxMonth) <= 0 && guard < safeLimit) {
    titleLabels.push(formatMonthLabel(pointer));
    pointer = shiftMonthKey(pointer, 1);
    guard += 1;
  }

  if (!titleLabels.length) {
    titleLabels.push(formatMonthLabel(state.activeMonth));
  }

  const longestTitleWidth = Math.max(
    ...titleLabels.map((label) => measureUiTextWidth(label, titleStyle)),
    measureUiTextWidth(activeMonthLabel.textContent || "", titleStyle)
  );

  const longestEyebrowWidth = Math.max(
    ...eyebrowLabels.map((label) => measureUiTextWidth(label, eyebrowStyle)),
    measureUiTextWidth(activeMonthEyebrow.textContent || "", eyebrowStyle)
  );

  const copyWidth = Math.max(longestTitleWidth, longestEyebrowWidth) + 2;
  activeMonthSection.style.setProperty("--month-context-copy-width", `${Math.ceil(copyWidth)}px`);
}

function moveActiveMonth(offset) {
  setActiveMonth(shiftMonthKey(state.activeMonth, offset));
}

function renderByFilters() {
  updateMobileFilterButtonLabels();
  updateCategoryFilterMenuSelection();
  updateDateFilterMenuSelection();
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
  lines.push(["descripcion", "fecha", "categoria", "monto", "recurrente"].map(csvEscape).join(","));

  for (const item of rows) {
    lines.push(
      [
        csvEscape(item.name),
        csvEscape(formatItemDate(item.date)),
        csvEscape(getCategoryConfig(item.category).label),
        csvEscape(formatAmountNumber(item.amount, { withSymbol: false })),
        csvEscape(item.isRecurring ? "Si" : "No")
      ].join(",")
    );
  }

  const csv = `\ufeff${lines.join("\r\n")}`;
  downloadBlob(csv, `mis-gastos-${normalizeMonthKey(state.activeMonth)}.csv`, "text/csv;charset=utf-8");
  showToast("Archivo CSV descargado.");
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
    showToast("No pudimos generar el PDF. Intenta de nuevo.", true);
    return;
  }

  showToast("Generando archivo...");

  const doc = new jsPdf({ unit: "pt", format: "a4" });
  const rows = getFilteredItems();
  const { monthlyIncome, monthlySpend } = getTotals();
  const available = monthlyIncome - monthlySpend;
  const activeMonthLabelText = formatMonthLabel(state.activeMonth);

  let y = 42;
  const left = 40;

  const drawHeader = () => {
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(`Reporte de gastos Â· ${activeMonthLabelText}`, left, y);

    y += 20;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Exportado: ${new Date().toLocaleString("es-AR")}`, left, y);

    y += 16;
    doc.text(`Mes visible: ${activeMonthLabelText}`, left, y);
    y += 14;
    doc.text(`Ingresos del mes: ${money(monthlyIncome)}`, left, y);
    y += 14;
    doc.text(`Gastos del mes: ${money(monthlySpend)}`, left, y);
    y += 14;
    doc.text(`Saldo disponible: ${money(available)}`, left, y);

    y += 20;
    doc.setFont("helvetica", "bold");
    doc.text("Descripcion", 40, y);
    doc.text("Fecha", 235, y);
    doc.text("Categoria", 315, y);
    doc.text("Monto", 540, y, { align: "right" });

    y += 8;
    doc.line(40, y, 555, y);
    y += 14;
  };

  drawHeader();

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  if (!rows.length) {
    doc.text("No hay gastos para el filtro actual.", left, y);
  }

  for (const item of rows) {
    if (y > 780) {
      doc.addPage();
      y = 42;
      drawHeader();
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
    }

    const categoryLabel = getCategoryConfig(item.category).label;

    doc.text(cutText(item.name, 30), 40, y);
    doc.text(formatItemDate(item.date), 235, y);
    doc.text(cutText(categoryLabel, 18), 315, y);
    doc.text(money(item.amount), 540, y, { align: "right" });

    y += 14;
  }

  doc.save(`mis-gastos-${normalizeMonthKey(state.activeMonth)}.pdf`);
  showToast("Archivo PDF descargado.");
}

function showToast(message, isError = false) {
  if (!toast) {
    return;
  }

  const iconMarkup = isError
    ? '<span class="toast-icon" aria-hidden="true"><i class="bi bi-exclamation-circle"></i></span>'
    : '<span class="toast-icon" aria-hidden="true"><i class="bi bi-check-circle"></i></span>';
  toast.innerHTML = `${iconMarkup}<span class="toast-message">${message}</span>`;
  toast.classList.remove("error", "success", "show");

  if (isError) {
    toast.classList.add("error");
  } else {
    toast.classList.add("success");
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

function setCloudStatus(mode, text) {
  cloudStatusMode = mode;
  cloudStatusText = text;
  updateAuthUi();
}

function getStateTimestamp(snapshot) {
  const timestamp = Date.parse(String(snapshot?.lastModifiedAt || ""));
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function hasMeaningfulFinanceData(snapshot) {
  const normalized = normalizeStateSnapshot(snapshot);
  return (
    normalized.items.length > 0
    || Object.values(normalized.monthlySalaries || {}).some((value) => Number(value || 0) > 0)
    || Number(normalized.salary || 0) > 0
    || normalized.recurringSkips.length > 0
  );
}

function snapshotForCloud(snapshot = snapshotFromState()) {
  const normalized = normalizeStateSnapshot(snapshot);
  delete normalized.onboardingSeen;
  return normalized;
}

function stateSignature(snapshot) {
  return JSON.stringify(snapshotForCloud(snapshot));
}

function withTimeout(promise, label, timeoutMs = CLOUD_OP_TIMEOUT_MS) {
  let timeoutId = null;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = window.setTimeout(() => {
      reject(new Error(`${label} timeout`));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  });
}

function scheduleCloudPush() {
  if (!supabaseClient || !authUser) {
    return;
  }

  if (pendingCloudSyncTimer) {
    clearTimeout(pendingCloudSyncTimer);
  }

  pendingCloudSyncTimer = window.setTimeout(() => {
    pendingCloudSyncTimer = null;
    pushStateToCloud();
  }, CLOUD_SYNC_DEBOUNCE_MS);
}

async function pushStateToCloud({ force = false, silent = true } = {}) {
  if (!supabaseClient || !authUser) {
    return false;
  }

  if (cloudPushInFlight) {
    return false;
  }

  const snapshot = snapshotForCloud();
  const signature = stateSignature(snapshot);
  if (!force && signature === lastCloudSignature) {
    return true;
  }

  cloudPushInFlight = true;
  setCloudStatus("syncing", "Sincronizando...");

  try {
    const payload = {
      user_id: authUser.id,
      app_state: snapshot,
      updated_at: new Date().toISOString()
    };

    const { error } = await withTimeout(
      supabaseClient.from(CLOUD_TABLE_NAME).upsert(payload, { onConflict: "user_id" }),
      "cloud push"
    );

    if (error) {
      setCloudStatus("error", "Error de sync");
      if (!silent) {
        showToast("No pudimos subir tus datos a la nube.", true);
      }
      return false;
    }

    lastCloudSignature = signature;
    setCloudStatus("ready", "Sincronizado");
    return true;
  } catch {
    setCloudStatus("error", "Error de sync");
    if (!silent) {
      showToast("No pudimos sincronizar con la nube.", true);
    }
    return false;
  } finally {
    cloudPushInFlight = false;
  }
}

function describeSupabaseError(error) {
  const message = String(error?.message || "").toLowerCase();

  if (message.includes("timeout")) {
    return "Tiempo de espera agotado al sincronizar. Revisa la conexion.";
  }

  if (message.includes("relation") && message.includes(CLOUD_TABLE_NAME)) {
    return "Falta crear la tabla cloud en Supabase SQL Editor.";
  }

  if (message.includes("row-level security") || message.includes("permission denied")) {
    return "Permisos de tabla cloud incompletos (RLS/policies).";
  }

  if (message.includes("jwt") || message.includes("session")) {
    return "Sesion expirada. Cierra sesion y vuelve a iniciar con Google.";
  }

  return "No pudimos leer tus datos desde la nube.";
}

function isTimeoutError(error) {
  return String(error?.message || "").toLowerCase().includes("timeout");
}

function startCloudAutoSync() {
  if (!authUser) {
    return;
  }

  if (!cloudPullIntervalId) {
    cloudPullIntervalId = window.setInterval(() => {
      pullStateFromCloud({ showToastOnSuccess: false, silentErrors: true }).catch(() => {
        // Background sync should not block UX.
      });
    }, CLOUD_PULL_INTERVAL_MS);
  }

  if (!supabaseClient || cloudRealtimeChannel) {
    return;
  }

  try {
    const channelName = `cloud-state-${authUser.id}`;
    cloudRealtimeChannel = supabaseClient
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: CLOUD_TABLE_NAME,
          filter: `user_id=eq.${authUser.id}`
        },
        () => {
          pullStateFromCloud({ showToastOnSuccess: false, silentErrors: true }).catch(() => {
            // Ignore realtime pull failures and keep app responsive.
          });
        }
      )
      .subscribe();
  } catch {
    cloudRealtimeChannel = null;
  }
}

function stopCloudAutoSync() {
  if (!cloudPullIntervalId) {
    // no-op
  } else {
    clearInterval(cloudPullIntervalId);
    cloudPullIntervalId = null;
  }

  if (supabaseClient && cloudRealtimeChannel) {
    try {
      supabaseClient.removeChannel(cloudRealtimeChannel);
    } catch {
      // no-op
    }
  }

  cloudRealtimeChannel = null;
}

async function pullStateFromCloud({ showToastOnSuccess = false, silentErrors = false } = {}) {
  if (!supabaseClient || !authUser) {
    return false;
  }

  if (cloudPullInFlight) {
    return true;
  }

  cloudPullInFlight = true;
  setCloudStatus("syncing", "Sincronizando...");

  try {
    const { data, error } = await withTimeout(
      supabaseClient.from(CLOUD_TABLE_NAME).select("app_state, updated_at").eq("user_id", authUser.id).maybeSingle(),
      "cloud pull"
    );

    if (error) {
      setCloudStatus("error", "Error de sync");
      const fallbackPushed = await pushStateToCloud({ force: true, silent: true });
      if (fallbackPushed) {
        setCloudStatus("ready", "Sincronizado");
        if (!silentErrors && showToastOnSuccess) {
          showToast("Sincronizacion recuperada desde estado local.");
        }
        return true;
      }

      if (!silentErrors) {
        const detail = String(error.message || "").trim();
        const shouldSurface = !(isTimeoutError(error) && !showToastOnSuccess);
        if (shouldSurface) {
          showToast(
            detail ? `${describeSupabaseError(error)} (${detail})` : describeSupabaseError(error),
            true
          );
        }
      }
      return false;
    }

    const localSnapshot = snapshotFromState();
    const localTimestamp = getStateTimestamp(localSnapshot);
    const hasRemoteState = Boolean(data?.app_state);

    if (!hasRemoteState) {
      await pushStateToCloud({ force: true, silent: true });
      setCloudStatus("ready", "Sincronizado");
      return true;
    }

    const remoteSnapshot = normalizeStateSnapshot(data.app_state);
    const remoteTimestamp = getStateTimestamp(remoteSnapshot);
    const localHasFinanceData = hasMeaningfulFinanceData(localSnapshot);
    const remoteHasFinanceData = hasMeaningfulFinanceData(remoteSnapshot);

    if (remoteHasFinanceData && !localHasFinanceData) {
      applySnapshotToState(remoteSnapshot);
      if (salaryInput) {
        salaryInput.value = formatAmountNumber(getMonthSalary(state.activeMonth), { withSymbol: false });
      }
      applyTheme();
      applySidebarState();
      if (budgetPeriodSelect) {
        budgetPeriodSelect.value = normalizeBudgetPeriod(state.budgetPeriod);
      }
      if (salaryInput) {
        setSalaryEditable(false);
      }
      saveState({ preserveTimestamp: true, skipCloudSync: true });
      render();
      lastCloudSignature = stateSignature(remoteSnapshot);
      setCloudStatus("ready", "Sincronizado");

      if (showToastOnSuccess) {
        showToast("Datos sincronizados desde la nube.");
      }
      return true;
    }

    if (localHasFinanceData && !remoteHasFinanceData) {
      await pushStateToCloud({ force: true, silent: true });
      setCloudStatus("ready", "Sincronizado");
      return true;
    }

    if (remoteTimestamp >= localTimestamp) {
      applySnapshotToState(remoteSnapshot);
      if (salaryInput) {
        salaryInput.value = formatAmountNumber(getMonthSalary(state.activeMonth), { withSymbol: false });
      }
      applyTheme();
      applySidebarState();
      if (budgetPeriodSelect) {
        budgetPeriodSelect.value = normalizeBudgetPeriod(state.budgetPeriod);
      }
      if (salaryInput) {
        setSalaryEditable(false);
      }
      saveState({ preserveTimestamp: true, skipCloudSync: true });
      render();
      lastCloudSignature = stateSignature(remoteSnapshot);
      setCloudStatus("ready", "Sincronizado");

      if (showToastOnSuccess) {
        showToast("Datos sincronizados desde la nube.");
      }
      return true;
    }

    await pushStateToCloud({ force: true, silent: true });
    setCloudStatus("ready", "Sincronizado");
    return true;
  } catch (error) {
    setCloudStatus("error", "Error de sync");
    if (!silentErrors) {
      const detail = String(error?.message || "").trim();
      const shouldSurface = !(isTimeoutError(error) && !showToastOnSuccess);
      if (shouldSurface) {
        showToast(detail ? `${describeSupabaseError(error)} (${detail})` : describeSupabaseError(error), true);
      }
    }
    return false;
  } finally {
    cloudPullInFlight = false;
  }
}

function setAuthButtonsBusy(isBusy) {
  const targets = [signInGoogleBtn, saveCloudConfigBtn, clearCloudConfigBtn];
  for (const button of targets) {
    if (!button) {
      continue;
    }

    button.disabled = isBusy;
  }
}

async function initializeCloudAuthClient({ forceRecreate = false } = {}) {
  if (!hasCloudConfig()) {
    supabaseClient = null;
    feedbackClient = null;
    authUser = null;
    stopCloudAutoSync();
    setCloudStatus("local", "Sin sincronizacion");
    return false;
  }

  const factory = globalThis.supabase?.createClient;
  if (typeof factory !== "function") {
    setCloudStatus("error", "SDK Supabase no disponible");
    return false;
  }

  if (forceRecreate) {
    stopCloudAutoSync();
    if (authStateSubscription && typeof authStateSubscription.unsubscribe === "function") {
      authStateSubscription.unsubscribe();
    }
    authStateSubscription = null;
    supabaseClient = null;
    feedbackClient = null;
    authUser = null;
    lastCloudSignature = "";
  }

  if (!supabaseClient) {
    try {
      supabaseClient = factory(cloudConfig.url, cloudConfig.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
      feedbackClient = supabaseClient;
    } catch {
      supabaseClient = null;
      feedbackClient = null;
      setCloudStatus("error", "Configuracion cloud invalida");
      return false;
    }
  }

  if (!authStateSubscription && supabaseClient) {
    const subscription = supabaseClient.auth.onAuthStateChange(async (eventName, session) => {
      const isFirstAuthEvent = !hasSeenAuthStateEvent;
      hasSeenAuthStateEvent = true;
      authUser = session?.user || null;

      if (authUser) {
        setCloudStatus("syncing", "Sincronizando...");
        startCloudAutoSync();
        const shouldShowForegroundErrors =
          !isFirstAuthEvent && (eventName === "SIGNED_IN" || eventName === "USER_UPDATED");
        await pullStateFromCloud({ silentErrors: !shouldShowForegroundErrors });
      } else {
        stopCloudAutoSync();
        setCloudStatus("ready", "Sesion cerrada");
        lastCloudSignature = "";
      }

      updateAuthUi();
    });

    authStateSubscription = subscription?.data?.subscription || null;
  }

  if (supabaseClient) {
    const { data, error } = await supabaseClient.auth.getSession();
    if (error) {
      setCloudStatus("error", "No se pudo iniciar auth");
      return false;
    }

    authUser = data?.session?.user || null;
    if (authUser) {
      startCloudAutoSync();
      await pullStateFromCloud({ silentErrors: true });
    } else {
      stopCloudAutoSync();
      setCloudStatus("ready", "Sin sesion");
    }

    updateAuthUi();
  }

  return Boolean(supabaseClient);
}

async function signInWithGoogle() {
  const initialized = await initializeCloudAuthClient();
  if (!initialized || !supabaseClient) {
    showToast("No pudimos iniciar cloud. Revisa la configuracion.", true);
    return;
  }

  setAuthButtonsBusy(true);

  try {
    closeProfileDropdown();
    const redirectTo = APP_PUBLIC_URL;
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo
      }
    });

    if (error) {
      const rawMessage = String(error.message || "").toLowerCase();
      if (rawMessage.includes("provider") && rawMessage.includes("disabled")) {
        showToast("Google Auth no esta habilitado en Supabase. Activalo en Authentication > Providers.", true);
      } else {
        showToast("No pudimos abrir login con Google. Intenta de nuevo.", true);
      }
      setAuthButtonsBusy(false);
      return;
    }
  } catch {
    showToast("No pudimos abrir login con Google. Intenta de nuevo.", true);
    setAuthButtonsBusy(false);
  }
}

async function performLogout() {
  if (!supabaseClient) {
    authUser = null;
    lastCloudSignature = "";
    stopCloudAutoSync();
    setCloudStatus("ready", "Sesion cerrada");
    updateAuthUi();
    closeProfileDropdown();
    showToast("Sesion cerrada.");
    return;
  }

  const { error } = await withTimeout(supabaseClient.auth.signOut({ scope: "local" }), "logout");
  authUser = null;
  lastCloudSignature = "";
  stopCloudAutoSync();
  setCloudStatus("ready", "Sesion cerrada");
  updateAuthUi();
  closeProfileDropdown();

  if (error) {
    showToast("Cerramos la sesion local, pero hubo un error al cerrar global.", true);
    return;
  }

  showToast("Sesion cerrada.");
}

function applyAppVariantUi() {
  document.title = `${APP_DISPLAY_NAME} | Control de gastos`;

  if (document.body) {
    if (IS_QA_APP || isMobileViewport()) {
      document.body.dataset.designSystem = "dinaria-v2";
      document.body.dataset.designSystemMode = "stitch-mobile";
    } else {
      delete document.body.dataset.designSystem;
      delete document.body.dataset.designSystemMode;
    }
  }
}

function updateAuthUi() {
  const configured = hasCloudConfig();
  const userEmail = String(authUser?.email || "").trim();
  const isLoggedIn = Boolean(userEmail);
  const fullName = String(authUser?.user_metadata?.full_name || authUser?.user_metadata?.name || "").trim();
  const avatarUrl = String(
    authUser?.user_metadata?.avatar_url ||
      authUser?.user_metadata?.picture ||
      authUser?.identities?.[0]?.identity_data?.avatar_url ||
      authUser?.identities?.[0]?.identity_data?.picture ||
      ""
  ).trim();
  const displayName = fullName || userEmail || "Usuario";
  const icon = authStatusPill ? authStatusPill.querySelector("i") : null;

  if (authStatusText) {
    if (!configured) {
      authStatusText.textContent = "Modo local";
    } else if (isLoggedIn) {
      authStatusText.textContent = userEmail;
    } else {
      authStatusText.textContent = "Cloud activa";
    }
  }

  if (authSyncText) {
    authSyncText.textContent = cloudStatusText;
  }

  if (icon instanceof HTMLElement) {
    icon.className = "bi";
    if (!configured) {
      icon.classList.add("bi-cloud-slash");
      icon.style.color = "#64748b";
    } else if (cloudStatusMode === "error") {
      icon.classList.add("bi-cloud-x");
      icon.style.color = "#be123c";
    } else if (isLoggedIn) {
      icon.classList.add("bi-cloud-check");
      icon.style.color = "#0f766e";
    } else {
      icon.classList.add("bi-cloud");
      icon.style.color = "#213196";
    }
  }

  if (openAuthModalBtn) {
    const showAvatar = isLoggedIn && Boolean(avatarUrl);
    openAuthModalBtn.classList.toggle("has-avatar", showAvatar);

    const currentAvatar = openAuthModalBtn.querySelector(".auth-trigger-avatar");
    const currentIcon = openAuthModalBtn.querySelector(".bi-person-circle");

    if (showAvatar) {
      if (!currentAvatar || currentAvatar.getAttribute("src") !== avatarUrl) {
        const avatar = document.createElement("img");
        avatar.className = "auth-trigger-avatar";
        avatar.alt = `Avatar de ${displayName}`;
        avatar.src = avatarUrl;
        avatar.referrerPolicy = "no-referrer";
        avatar.loading = "eager";
        avatar.decoding = "async";
        avatar.addEventListener(
          "error",
          () => {
            openAuthModalBtn.classList.remove("has-avatar");
            const fallbackIcon = document.createElement("i");
            fallbackIcon.className = "bi bi-person-circle";
            openAuthModalBtn.replaceChildren(fallbackIcon);
          },
          { once: true }
        );
        openAuthModalBtn.replaceChildren(avatar);
      } else {
        currentAvatar.alt = `Avatar de ${displayName}`;
      }
    } else if (!currentIcon || currentAvatar) {
      const fallbackIcon = document.createElement("i");
      fallbackIcon.className = "bi bi-person-circle";
      openAuthModalBtn.replaceChildren(fallbackIcon);
    }

    openAuthModalBtn.setAttribute("title", isLoggedIn ? "Perfil" : "Iniciar sesion");
    openAuthModalBtn.setAttribute("aria-label", isLoggedIn ? "Abrir perfil de usuario" : "Iniciar sesion con Google");
  }

  if (logoutBtn) {
    logoutBtn.classList.toggle("is-hidden", !isLoggedIn);
  }

  if (authHelpText) {
    authHelpText.textContent = isLoggedIn
      ? "Estas logueado con Google."
      : "Inicia sesion con Google para guardar y sincronizar tu informacion.";
  }

  if (signInGoogleBtn) {
    signInGoogleBtn.classList.toggle("is-hidden", isLoggedIn);
  }

  if (authLoggedBox) {
    authLoggedBox.classList.toggle("is-hidden", !isLoggedIn);
  }

  if (authLoggedText) {
    authLoggedText.textContent = isLoggedIn
      ? `Logueado con Google: ${userEmail}`
      : "Estas logueado con Google.";
  }

  if (authDisplayName) {
    authDisplayName.textContent = displayName;
  }

  if (mobileProfileBtn) {
    mobileProfileBtn.innerHTML = '<span class="material-symbols-rounded mobile-nav-icon" aria-hidden="true">person</span><span class="mobile-nav-label">Perfil</span>';
    mobileProfileBtn.setAttribute("title", isLoggedIn ? "Perfil y cuenta" : "Perfil");
    mobileProfileBtn.setAttribute("aria-label", isLoggedIn ? "Abrir perfil y cuenta" : "Abrir perfil");
  }

  updateHeroContent(displayName, isLoggedIn);

  if (authAvatarImg) {
    if (isLoggedIn && avatarUrl) {
      authAvatarImg.onerror = () => {
        authAvatarImg.onerror = null;
        authAvatarImg.src = "./icon-192.svg";
      };
      authAvatarImg.referrerPolicy = "no-referrer";
      authAvatarImg.src = avatarUrl;
      authAvatarImg.alt = `Avatar de ${displayName}`;
    } else {
      authAvatarImg.onerror = null;
      authAvatarImg.src = "./icon-192.svg";
      authAvatarImg.alt = "Avatar de usuario";
    }
  }

  if (syncNowBtn) {
    syncNowBtn.disabled = !isLoggedIn || cloudStatusMode === "syncing";
  }

  if (logoutModalBtn) {
    logoutModalBtn.disabled = !isLoggedIn;
  }

  if (cloudConfigSection) {
    const helpText = cloudConfigSection.querySelector("p");
    if (helpText) {
      helpText.textContent = configured
        ? "Configurado. Puedes actualizar URL/Key o limpiar si quieres cambiar de proyecto."
        : "Completa estos datos una sola vez para habilitar login y sincronizar tu info entre dispositivos.";
    }

    cloudConfigSection.classList.toggle("is-hidden", configured);
  }
}

function getFirstName(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  return parts[0] || "amigo";
}

function updateHeroContent(displayName, isLoggedIn) {
  if (heroGreeting) {
    heroGreeting.textContent = isLoggedIn ? `Hola ${getFirstName(displayName)} :)` : "Hola :)";
  }

  if (heroSubtitle) {
    heroSubtitle.textContent = state.items.length
      ? "Sigue registrando tus gastos para entender rapido como viene tu plata."
      : "Carga tu sueldo mensual y tu primer gasto. En cuanto lo registres, Dinaria Finanzas te mostrara tu balance y tus categorias principales.";
  }
}

function setMonthModelOpen(isOpen) {
  monthModelOpen = Boolean(isOpen);
  monthModelSection?.classList.toggle("is-hidden", !monthModelOpen);
  metricsGrid?.classList.toggle("is-hidden", monthModelOpen);
  workspaceGrid?.classList.toggle("is-hidden", monthModelOpen);

  if (viewMonthModelBtn) {
    viewMonthModelBtn.textContent = monthModelOpen ? "Volver al dashboard" : "Ver vista mensual beta";
    viewMonthModelBtn.setAttribute("aria-pressed", monthModelOpen ? "true" : "false");
  }

  if (monthModelOpen) {
    monthModelSection?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function render() {
  renderActiveMonthContext();
  renderSummary();
  renderByFilters();
  renderDonut();
  updateMobileStickySummaryVisibility();
  scheduleWalkthroughPosition();
}

viewMonthModelBtn?.addEventListener("click", () => {
  setMonthModelOpen(!monthModelOpen);
});

closeMonthModelBtn?.addEventListener("click", () => {
  setMonthModelOpen(false);
});

function createPreviewItems() {
  const today = normalizeItemDate(new Date());
  return [
    {
      id: "preview-expense-1",
      name: "Alquiler",
      amount: 414000,
      type: "expense",
      category: "vivienda",
      date: today
    }
  ];
}

function seedMonthActivePreview(monthOffset = 0) {
  const currentMonth = getCurrentMonthKey();
  const previousMonth = shiftMonthKey(currentMonth, -1);
  const nextMonth = shiftMonthKey(currentMonth, 1);
  const followingMonth = shiftMonthKey(currentMonth, 2);
  const selectedMonth = shiftMonthKey(currentMonth, monthOffset);

  const buildMonthDate = (monthKey, day) => {
    const base = `${monthKey}-01`;
    return buildDateForMonth(base, monthKey).replace(/-\d{2}$/, `-${String(day).padStart(2, "0")}`);
  };

  state.items = [
    {
      id: "preview-rent-base",
      recurringSeriesId: "series-rent",
      name: "Alquiler",
      amount: 414000,
      type: "expense",
      category: "vivienda",
      date: buildMonthDate(previousMonth, 5),
      isRecurring: true
    },
    {
      id: "preview-internet-base",
      recurringSeriesId: "series-internet",
      name: "Internet",
      amount: 32000,
      type: "expense",
      category: "servicios",
      date: buildMonthDate(previousMonth, 12),
      isRecurring: true
    },
    {
      id: "preview-insurance-current",
      recurringSeriesId: "series-insurance",
      name: "Seguro bici",
      amount: 19000,
      type: "expense",
      category: "impuestos",
      date: buildMonthDate(currentMonth, 18),
      isRecurring: true
    },
    {
      id: "preview-super-current",
      name: "Supermercado",
      amount: 86000,
      type: "expense",
      category: "alimentacion",
      date: buildMonthDate(currentMonth, 9),
      isRecurring: false
    },
    {
      id: "preview-delivery-current",
      name: "Delivery viernes",
      amount: 14500,
      type: "expense",
      category: "alimentacion",
      date: buildMonthDate(currentMonth, 14),
      isRecurring: false
    },
    {
      id: "preview-regalo-prev",
      name: "Regalo cumple",
      amount: 48000,
      type: "expense",
      category: "compras",
      date: buildMonthDate(previousMonth, 20),
      isRecurring: false
    }
  ];

  state.recurringSkips = [];
  state.monthlySalaries = {};
  setMonthSalary(previousMonth, 820000);
  setMonthSalary(currentMonth, 850000);
  setMonthSalary(nextMonth, 850000);
  setMonthSalary(followingMonth, 850000);
  state.salary = getMonthSalary(currentMonth);
  state.activeMonth = selectedMonth;
  state.budgetPeriod = "weekly";
  state.editingItemId = "";

  if (categoryFilter) {
    categoryFilter.value = "all";
  }
  if (dateFilter) {
    dateFilter.value = "all";
  }
}

const previewMode = new URLSearchParams(globalThis.location?.search || "").get("preview");
const previewMonthOffset = Number(new URLSearchParams(globalThis.location?.search || "").get("monthOffset") || 0);

if (previewMode === "filtered-state") {
  setMonthSalary(getCurrentMonthKey(), 2830000);
  state.items = createPreviewItems();
  if (categoryFilter) {
    categoryFilter.value = "vivienda";
  }
  if (dateFilter) {
    dateFilter.value = "today";
  }
}

if (previewMode === "qa-long-values") {
  const today = normalizeItemDate(new Date());
  setMonthSalary(getCurrentMonthKey(), 1225425215142453000000000);
  state.items = [
    {
      id: "qa-expense-long",
      name: "tddbsrsrtbhtbgrvgdtrdfmnopqrstuvxyzsuperlargodescripcion",
      amount: 176672621672167200000000,
      type: "expense",
      category: "vivienda",
      date: today
    },
    {
      id: "qa-expense-normal",
      name: "Alimentacion",
      amount: 50000,
      type: "expense",
      category: "alimentacion",
      date: today
    }
  ];
}

if (previewMode === "month-active") {
  seedMonthActivePreview(Number.isFinite(previewMonthOffset) ? previewMonthOffset : 0);
}

if (previewMode === "metrics") {
  seedMonthActivePreview(Number.isFinite(previewMonthOffset) ? previewMonthOffset : 0);
}

bindSheetHeaderSwipeClose(mobileQuickAddSheet?.querySelector(".mobile-sheet-head"), closeMobileQuickAddSheet);
bindSheetHeaderSwipeClose(mobileAmountScreen?.querySelector(".mobile-amount-screen-head"), closeMobileAmountScreen);
bindSheetHeaderSwipeClose(mobileQuickEntrySheet?.querySelector(".mobile-quick-entry-head"), closeMobileQuickEntrySheet);
bindSheetHeaderSwipeClose(mobileFilterSheet?.querySelector(".mobile-filter-sheet-head"), closeMobileFilterSheet);

render();
syncMonthHistoryState(state.activeMonth, { replace: true });
scheduleInitialOnboarding();

if (!previewMode) {
  initializeCloudAuthClient().catch(() => {
    setCloudStatus("error", "No se pudo iniciar cloud");
  });
}

globalThis.addEventListener("resize", scheduleMetricValueFit);
globalThis.addEventListener("load", scheduleMetricValueFit);
globalThis.addEventListener("resize", updateMobileStickySummaryVisibility);
globalThis.addEventListener("load", updateMobileStickySummaryVisibility);
globalThis.addEventListener("scroll", updateMobileStickySummaryVisibility, { passive: true });
globalThis.addEventListener("resize", syncProfileDropdownMount);
globalThis.addEventListener("load", syncProfileDropdownMount);

if (document.fonts?.ready) {
  document.fonts.ready.then(() => {
    scheduleMetricValueFit();
  }).catch(() => {
    // Ignore font readiness failures and keep the UI usable.
  });
}

window.setTimeout(scheduleMetricValueFit, 80);
window.setTimeout(scheduleMetricValueFit, 360);

if (previewMode === "open-category-filter") {
  requestAnimationFrame(() => {
    toggleCategoryFilterMenu();
  });
}
if (previewMode === "open-budget-period") {
  requestAnimationFrame(() => {
    toggleBudgetPeriodMenu();
  });
}
if (previewMode === "open-expense-modal") {
  requestAnimationFrame(() => {
    openExpenseModalForCreate(openExpenseModalBtn);
  });
}
if (previewMode === "open-walkthrough") {
  requestAnimationFrame(() => {
    startWalkthrough(startWalkthroughBtn);
    const previewStep = Number(new URLSearchParams(globalThis.location?.search || "").get("walkthroughStep"));
    if (Number.isFinite(previewStep) && previewStep > 0) {
      requestAnimationFrame(() => {
        setWalkthroughStep(previewStep);
      });
    }
  });
}
if (previewMode === "month-model") {
  requestAnimationFrame(() => {
    setMonthModelOpen(true);
  });
}
  if (previewMode === "mobile-amount") {
    requestAnimationFrame(() => {
      openMobileAmountScreen("expense");
    });
  }
  if (previewMode === "mobile-quick-add") {
    requestAnimationFrame(() => {
      openMobileQuickAddSheet();
    });
  }
  if (previewMode === "mobile-quick-entry") {
    requestAnimationFrame(() => {
      openMobileQuickEntrySheet("expense", 66000);
    });
  }
if (previewMode === "mobile-filter") {
  requestAnimationFrame(() => {
    openMobileFilterSheet();
  });
}
if (previewMode === "mobile-budget-menu") {
  requestAnimationFrame(() => {
    if (isMobileViewport()) {
      mobileBudgetPeriodMenu?.classList.remove("is-hidden");
      mobileBudgetPeriodBtn?.setAttribute("aria-expanded", "true");
      updateMobileBudgetPeriodSelection();
    }
  });
}
if (previewMode === "mobile-sticky") {
  requestAnimationFrame(() => {
    if (isMobileViewport()) {
      window.scrollTo({ top: 360, left: 0, behavior: "instant" });
      updateMobileStickySummaryVisibility();
    }
  });
}
if (previewMode === "mobile-profile") {
  requestAnimationFrame(() => {
    openProfileDropdown();
  });
}
if (previewMode === "table-hover") {
  requestAnimationFrame(() => {
    if (!state.items.length) {
      state.items = createPreviewItems();
      render();
    }
    const firstRow = expenseTableBody?.querySelector("tr.expense-row");
    if (firstRow) {
      firstRow.classList.add("is-hover-preview");
    }
  });
}
if (previewMode === "filtered-state") {
}
if (previewMode === "qa-long-values") {
}

