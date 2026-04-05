(() => {
  const currentUrl = new URL(window.location.href);
  const currentPath = currentUrl.pathname.toLowerCase();
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
    window.location.replace(new URL("./index.html", currentUrl).toString());
    return;
  }

  const userAgent = String(window.navigator.userAgent || "");
  const isMobile =
    /Android|iPhone|iPad|iPod|Mobile|Opera Mini|IEMobile/i.test(userAgent)
    || (window.matchMedia && window.matchMedia("(max-width: 767px)").matches);

  const target = isMobile ? "./landing.html" : "./desktop.html";
  const targetUrl = new URL(target, currentUrl);

  targetUrl.search = currentUrl.search;
  targetUrl.hash = currentUrl.hash;

  if (targetUrl.pathname !== currentUrl.pathname) {
    window.location.replace(targetUrl.toString());
  }
})();
