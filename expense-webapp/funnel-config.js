// Change these two values only when the funnel or app domain changes.
window.__DINARIA_FUNNEL_CONFIG__ = {
  funnelOrigin: "https://dinaria-go.vercel.app",
  appOrigin: "https://dinariafinanzas.vercel.app"
};

window.DinariaFunnelConfig = (() => {
  const fallbackOrigin = window.location.origin;
  const rawConfig = window.__DINARIA_FUNNEL_CONFIG__ || {};

  function normalizeOrigin(value) {
    const candidate = String(value || "").trim();

    if (!candidate) {
      return fallbackOrigin;
    }

    try {
      return new URL(candidate, `${fallbackOrigin}/`).origin;
    } catch {
      return fallbackOrigin;
    }
  }

  const funnelOrigin = normalizeOrigin(rawConfig.funnelOrigin);
  const appOrigin = normalizeOrigin(rawConfig.appOrigin);

  window.__DINARIA_FUNNEL_CONFIG__ = {
    funnelOrigin,
    appOrigin
  };

  return {
    funnelOrigin,
    appOrigin,
    usesSplitOrigins: funnelOrigin !== appOrigin,
    getFunnelPageUrl(pathname = "/") {
      return new URL(pathname, `${funnelOrigin}/`).toString();
    },
    getAppPageUrl(pathname = "/") {
      return new URL(pathname, `${appOrigin}/`).toString();
    }
  };
})();
