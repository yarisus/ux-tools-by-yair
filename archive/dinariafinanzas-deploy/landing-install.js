(() => {
  const installButton = document.getElementById("installCtaBtn");
  const installNote = document.getElementById("installNote");
  const installHelp = document.getElementById("installHelp");
  const installHelpTitle = document.getElementById("installHelpTitle");
  const installHelpBody = document.getElementById("installHelpBody");
  const installHelpSteps = document.getElementById("installHelpSteps");
  const appUrl = new URL("./index.html", window.location.href).toString();

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
    if (!installButton) {
      return;
    }

    if (isStandaloneDisplayMode()) {
      installButton.textContent = "Open App";
      setInstallMessage("Dinaria is already installed. Open the real app.");
      hideInstallHelp();
      return;
    }

    if (deferredPrompt) {
      installButton.textContent = "Install App";
      setInstallMessage("Install Dinaria and use the full app on your phone.");
      hideInstallHelp();
      return;
    }

    if (isIOS && isSafari) {
      installButton.textContent = "Add to Home Screen";
      setInstallMessage("Use Safari's Share menu to install the full app.");
      return;
    }

    if (isIOS) {
      installButton.textContent = "Open in Safari";
      setInstallMessage("To install Dinaria on iPhone, first open this page in Safari.", true);
      return;
    }

    if (isInAppBrowser) {
      installButton.textContent = "Open in Browser";
      setInstallMessage("Open this page in Chrome or Safari to install Dinaria.", true);
      return;
    }

    if (isAndroid) {
      installButton.textContent = "Install App";
      setInstallMessage("If Chrome does not show a prompt, use the browser menu and choose 'Install app'.");
      return;
    }

    installButton.textContent = "Open App";
    setInstallMessage("Dinaria is designed mainly for mobile devices.");
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    syncInstallCopy();
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    syncInstallCopy();
    showInstallHelp(
      "Dinaria installed",
      "You can now open Dinaria from your home screen.",
      []
    );
  });

  installButton?.addEventListener("click", async () => {
    if (isStandaloneDisplayMode()) {
      window.location.href = appUrl;
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      deferredPrompt = null;
      syncInstallCopy();

      if (choice?.outcome === "accepted") {
        setInstallMessage("Installing Dinaria...");
        hideInstallHelp();
      } else {
        setInstallMessage("You can install Dinaria anytime from this page.");
      }
      return;
    }

    if (isIOS && isSafari) {
      showInstallHelp(
        "Add Dinaria to your Home Screen",
        "Safari does not show the standard install prompt for PWAs.",
        [
          "Tap the Share button in Safari.",
          "Scroll down and choose 'Add to Home Screen'.",
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
          "Return to Dinaria there.",
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

  standaloneMedia?.addEventListener?.("change", syncInstallCopy);
  window.addEventListener("pageshow", syncInstallCopy);
  syncInstallCopy();
})();
