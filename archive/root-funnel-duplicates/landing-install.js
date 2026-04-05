(() => {
  const installButton = document.getElementById("installCtaBtn");
  const viewDemoLink = document.getElementById("viewDemoLink");
  const installNote = document.getElementById("installNote");
  const installHelp = document.getElementById("installHelp");
  const installHelpTitle = document.getElementById("installHelpTitle");
  const installHelpBody = document.getElementById("installHelpBody");
  const installHelpSteps = document.getElementById("installHelpSteps");
  const funnelConfig = window.DinariaFunnelConfig;
  const appUrl = funnelConfig?.getAppPageUrl("/index.html") || new URL("./index.html", window.location.href).toString();
  const demoUrl = funnelConfig?.getFunnelPageUrl("/demo.html") || new URL("./demo.html", window.location.href).toString();
  const usesSplitOrigins = Boolean(funnelConfig?.usesSplitOrigins);

  let deferredPrompt = null;

  const userAgent = String(window.navigator.userAgent || "");
  const isIOS = /iPad|iPhone|iPod/i.test(userAgent);
  const isAndroid = /Android/i.test(userAgent);
  const isSafari = isIOS && /Safari/i.test(userAgent) && !/(CriOS|FxiOS|EdgiOS|OPiOS|Instagram|FBAN|FBAV)/i.test(userAgent);
  const isInAppBrowser = /(FBAN|FBAV|Instagram|Line\/|; wv\)| wv\b|TikTok|Snapchat|Twitter)/i.test(userAgent);
  const standaloneMedia = window.matchMedia ? window.matchMedia("(display-mode: standalone)") : null;

  function isStandaloneDisplayMode() {
    return (standaloneMedia && standaloneMedia.matches) || window.navigator.standalone === true;
  }

  function setInstallMessage(message, isError = false) {
    if (!installNote) {
      return;
    }

    installNote.textContent = message;
    installNote.classList.toggle("is-error", isError);
  }

  function hideInstallHelp() {
    if (!installHelp || !installHelpSteps) {
      return;
    }

    installHelp.hidden = true;
    installHelpSteps.innerHTML = "";
  }

  function showInstallHelp(title, body, steps = []) {
    if (!installHelp || !installHelpTitle || !installHelpBody || !installHelpSteps) {
      return;
    }

    installHelpTitle.textContent = title;
    installHelpBody.textContent = body;
    installHelpSteps.innerHTML = steps.map((step) => `<li>${step}</li>`).join("");
    installHelp.hidden = false;
  }

  function syncInstallCopy() {
    if (viewDemoLink) {
      viewDemoLink.href = demoUrl;
    }

    if (!installButton) {
      return;
    }

    if (isStandaloneDisplayMode()) {
      installButton.textContent = "Abrir app";
      setInstallMessage("Dinaria ya está instalada. Abrí la app real.");
      hideInstallHelp();
      return;
    }

    if (usesSplitOrigins) {
      installButton.textContent = "Abrir app";
      setInstallMessage("Abrí la app de Dinaria para instalarla desde ahí.");
      hideInstallHelp();
      return;
    }

    if (deferredPrompt) {
      installButton.textContent = "Instalar app";
      setInstallMessage("Instalá Dinaria y usá la app completa en tu celular.");
      hideInstallHelp();
      return;
    }

    if (isIOS && isSafari) {
      installButton.textContent = "Agregar a inicio";
      setInstallMessage("Usá el menú Compartir de Safari para instalar la app completa.");
      return;
    }

    if (isIOS) {
      installButton.textContent = "Abrir en Safari";
      setInstallMessage("Para instalar Dinaria en iPhone, primero abrí esta página en Safari.", true);
      return;
    }

    if (isInAppBrowser) {
      installButton.textContent = "Abrir en navegador";
      setInstallMessage("Abrí esta página en Chrome o Safari para instalar Dinaria.", true);
      return;
    }

    if (isAndroid) {
      installButton.textContent = "Instalar app";
      setInstallMessage("Si Chrome no muestra el aviso, usá el menú del navegador y elegí 'Instalar app'.");
      return;
    }

    installButton.textContent = "Abrir app";
    setInstallMessage("Dinaria está pensada principalmente para usarla en el celular.");
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    if (usesSplitOrigins) {
      event.preventDefault();
      return;
    }

    event.preventDefault();
    deferredPrompt = event;
    syncInstallCopy();
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    syncInstallCopy();
    showInstallHelp(
      "Dinaria ya está instalada",
      "Ahora podés abrir Dinaria desde tu pantalla de inicio.",
      []
    );
  });

  installButton?.addEventListener("click", async () => {
    if (isStandaloneDisplayMode()) {
      window.location.href = appUrl;
      return;
    }

    if (usesSplitOrigins) {
      window.location.href = appUrl;
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      deferredPrompt = null;
      syncInstallCopy();

      if (choice?.outcome === "accepted") {
        setInstallMessage("Instalando Dinaria...");
        hideInstallHelp();
      } else {
        setInstallMessage("Podés instalar Dinaria en cualquier momento desde esta página.");
      }
      return;
    }

    if (isIOS && isSafari) {
      showInstallHelp(
        "Agregá Dinaria a tu pantalla de inicio",
        "Safari no muestra el aviso de instalación automático.",
        [
          "Tocá el botón Compartir en Safari.",
          "Bajá y elegí 'Agregar a pantalla de inicio'.",
          "Confirmá para guardar Dinaria en tu celular."
        ]
      );
      return;
    }

    if (isIOS) {
      showInstallHelp(
        "Abrí esta página en Safari",
        "La instalación en iPhone funciona desde Safari.",
        [
          "Abrí el menú del navegador de esta app.",
          "Elegí 'Abrir en Safari'.",
          "Después elegí 'Agregar a pantalla de inicio'."
        ]
      );
      return;
    }

    if (isInAppBrowser) {
      showInstallHelp(
        "Abrí en tu navegador",
        "Los navegadores integrados suelen bloquear la instalación.",
        [
          "Abrí esta página en Chrome o Safari.",
          "Volvé ahí a Dinaria.",
          "Después usá de nuevo el botón para instalar."
        ]
      );
      return;
    }

    if (isAndroid) {
      showInstallHelp(
        "Instalá Dinaria desde Chrome",
        "Algunos navegadores en Android no muestran el aviso automáticamente.",
        [
          "Abrí el menú del navegador.",
          "Elegí 'Instalar app' o 'Agregar a pantalla de inicio'.",
          "Confirmá la instalación."
        ]
      );
      return;
    }

    window.location.href = appUrl;
  });

  standaloneMedia?.addEventListener?.("change", syncInstallCopy);
  window.addEventListener("pageshow", syncInstallCopy);
  syncInstallCopy();
})();
