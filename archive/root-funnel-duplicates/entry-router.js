(() => {
  const currentUrl = new URL(window.location.href);
  const currentPath = currentUrl.pathname.toLowerCase();
  const funnelConfig = window.DinariaFunnelConfig;
  const getFunnelPageUrl = funnelConfig?.getFunnelPageUrl || ((pathname) => new URL(pathname, currentUrl).toString());
  const getAppPageUrl = funnelConfig?.getAppPageUrl || ((pathname) => new URL(pathname, currentUrl).toString());
  const isStandalone =
    (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches)
    || window.navigator.standalone === true;

  if (
    currentPath.endsWith("/index.html")
    || currentPath.endsWith("/qa.html")
    || currentPath.endsWith("/landing.html")
    || currentPath.endsWith("/desktop.html")
  ) {
    return;
  }

  if (isStandalone) {
    window.location.replace(getAppPageUrl("/index.html"));
    return;
  }

  const userAgent = String(window.navigator.userAgent || "");
  const isMobileByClientHints = typeof window.navigator.userAgentData?.mobile === "boolean"
    ? window.navigator.userAgentData.mobile
    : false;
  const isMobile =
    isMobileByClientHints
    || /Android|iPhone|iPad|iPod|Mobile|Opera Mini|IEMobile/i.test(userAgent);

  const targetUrl = new URL(
    isMobile ? getFunnelPageUrl("/landing.html") : getFunnelPageUrl("/desktop.html")
  );

  targetUrl.search = currentUrl.search;
  targetUrl.hash = currentUrl.hash;

  if (targetUrl.toString() !== currentUrl.toString()) {
    window.location.replace(targetUrl.toString());
  }
})();
