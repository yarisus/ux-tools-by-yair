(() => {
  const installButton = document.getElementById("installCtaBtn");
  const openAppButton = document.getElementById("openAppCta");
  const installNote = document.getElementById("installNote");
  const installHelp = document.getElementById("installHelp");
  const installHelpTitle = document.getElementById("installHelpTitle");
  const installHelpBody = document.getElementById("installHelpBody");
  const installHelpSteps = document.getElementById("installHelpSteps");
  const funnelConfig = window.DinariaFunnelConfig;
  const appUrl = funnelConfig?.getAppPageUrl("/index.html") || new URL("./index.html", window.location.href).toString();
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

  function syncDemoCtas() {
    if (openAppButton) {
      openAppButton.hidden = !isStandaloneDisplayMode();
      openAppButton.href = appUrl;
    }

    if (!installButton) {
      return;
    }

    if (isStandaloneDisplayMode()) {
      installButton.textContent = "Open App";
      setInstallMessage("Dinaria is already installed. Open the real app.");
      hideInstallHelp();
      return;
    }

    if (usesSplitOrigins) {
      installButton.textContent = "Open App";
      setInstallMessage("Open the real Dinaria app to install it and use your own data.");
      hideInstallHelp();
      return;
    }

    if (deferredPrompt) {
      installButton.textContent = "Install App";
      setInstallMessage("Install Dinaria and use the full app with your own data.");
      hideInstallHelp();
      return;
    }

    if (isIOS && isSafari) {
      installButton.textContent = "Add to Home Screen";
      setInstallMessage("Install Dinaria from Safari to use the full app.");
      return;
    }

    if (isIOS) {
      installButton.textContent = "Open in Safari";
      setInstallMessage("To install on iPhone, first open this page in Safari.", true);
      return;
    }

    if (isInAppBrowser) {
      installButton.textContent = "Open in Browser";
      setInstallMessage("Open this page in Chrome or Safari to install Dinaria.", true);
      return;
    }

    if (isAndroid) {
      installButton.textContent = "Install App";
      setInstallMessage("If no prompt appears, use the browser menu and choose 'Install app'.");
      return;
    }

    installButton.textContent = "Open App";
    setInstallMessage("Dinaria is designed mainly for mobile devices.");
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    if (usesSplitOrigins) {
      event.preventDefault();
      return;
    }

    event.preventDefault();
    deferredPrompt = event;
    syncDemoCtas();
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    syncDemoCtas();
    showInstallHelp(
      "Dinaria installed",
      "The full experience is now available from your home screen.",
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
      syncDemoCtas();

      if (choice?.outcome === "accepted") {
        setInstallMessage("Installing Dinaria...");
        hideInstallHelp();
      } else {
        setInstallMessage("You can install Dinaria anytime from this preview.");
      }
      return;
    }

    if (isIOS && isSafari) {
      showInstallHelp(
        "Add Dinaria to your Home Screen",
        "Safari uses a manual install flow.",
        [
          "Tap the Share button in Safari.",
          "Choose 'Add to Home Screen'.",
          "Confirm to save Dinaria on your phone."
        ]
      );
      return;
    }

    if (isIOS) {
      showInstallHelp(
        "Open this page in Safari",
        "Installation on iPhone works through Safari.",
        [
          "Open the browser menu for this app.",
          "Choose 'Open in Safari'.",
          "Then choose 'Add to Home Screen'."
        ]
      );
      return;
    }

    if (isInAppBrowser) {
      showInstallHelp(
        "Open in your browser",
        "Embedded browsers usually block the install flow.",
        [
          "Open this page in Chrome or Safari.",
          "Return to the Dinaria preview there.",
          "Then use the install button again."
        ]
      );
      return;
    }

    if (isAndroid) {
      showInstallHelp(
        "Install Dinaria from Chrome",
        "Some Android browsers do not show the prompt automatically.",
        [
          "Open the browser menu.",
          "Choose 'Install app' or 'Add to Home screen'.",
          "Confirm the installation."
        ]
      );
      return;
    }

    window.location.href = appUrl;
  });

  standaloneMedia?.addEventListener?.("change", syncDemoCtas);
  window.addEventListener("pageshow", syncDemoCtas);
  syncDemoCtas();
})();
