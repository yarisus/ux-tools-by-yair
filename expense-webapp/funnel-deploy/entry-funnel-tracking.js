(() => {
  const currentUrl = new URL(window.location.href);
  const currentPath = currentUrl.pathname.toLowerCase();
  const standaloneMedia = window.matchMedia ? window.matchMedia("(display-mode: standalone)") : null;

  function isStandaloneDisplayMode() {
    return (standaloneMedia && standaloneMedia.matches) || window.navigator.standalone === true;
  }

  function isMobileBrowser() {
    const userAgent = String(window.navigator.userAgent || "");
    return /Android|iPhone|iPad|iPod|Mobile|Opera Mini|IEMobile/i.test(userAgent)
      || (window.matchMedia && window.matchMedia("(max-width: 767px)").matches);
  }

  function track(eventName, payload = {}) {
    const detail = {
      page: currentPath.split("/").pop() || "index.html",
      ...payload
    };

    // TODO: replace this console fallback with a real analytics endpoint or snippet if needed.
    try {
      console.info("[Dinaria funnel]", eventName, detail);
    } catch {
      // No-op fallback.
    }

    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, detail);
    }

    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({
        event: eventName,
        ...detail
      });
    }

    if (typeof window.plausible === "function") {
      window.plausible(eventName, { props: detail });
    }
  }

  function bindClickTracking(targetId, eventName, payload = {}) {
    const target = document.getElementById(targetId);
    if (!target) {
      return;
    }

    target.addEventListener("click", () => {
      track(eventName, payload);
    });
  }

  window.DinariaFunnelTracking = { track };

  if (currentPath.endsWith("/entry.html")) {
    track("entry_page_viewed");

    if (!isStandaloneDisplayMode()) {
      track(isMobileBrowser() ? "entry_redirected_to_landing" : "entry_redirected_to_desktop");
    }
    return;
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (currentPath.endsWith("/landing.html")) {
      bindClickTracking("installCtaBtn", "landing_install_cta_clicked");
      bindClickTracking("viewDemoLink", "landing_view_demo_clicked");
      return;
    }

    if (currentPath.endsWith("/demo.html")) {
      bindClickTracking("installCtaBtn", "demo_install_cta_clicked");
      return;
    }

    if (currentPath.endsWith("/desktop.html")) {
      bindClickTracking("copyLinkBtn", "desktop_copy_link_clicked");
      bindClickTracking("openMobileBtn", "desktop_preview_mobile_page_clicked");
    }
  });
})();
