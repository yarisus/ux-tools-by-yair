const CACHE_NAME = "expense-webapp-v104";
const IS_QA_ORIGIN = /(^|[-.])qa([-.]|$)/i.test(self.location.hostname);
const APP_SHELL = IS_QA_ORIGIN ? "./qa.html" : "./index.html";
const ASSETS = [
  "./",
  APP_SHELL,
  "./index.html",
  "./qa.html",
  "./tailwind.generated.css",
  "./assets/fonts/fonts.css",
  "./assets/fonts/Nunito-VariableFont_wght.ttf",
  "./vendor/bootstrap-icons/bootstrap-icons.min.css",
  "./vendor/bootstrap-icons/fonts/bootstrap-icons.woff2",
  "./vendor/bootstrap-icons/fonts/bootstrap-icons.woff",
  "./vendor/jspdf/jspdf.umd.min.js",
  "./vendor/supabase/supabase.umd.js",
  "./design-system/tokens.css",
  "./design-system/app-mobile.css",
  "./styles.css",
  "./app.js",
  "./tailwind.generated.css?v=20260403-03",
  "./assets/fonts/fonts.css?v=20260313-02",
  "./assets/fonts/MaterialSymbolsRounded.ttf",
  "./vendor/bootstrap-icons/bootstrap-icons.min.css?v=1.11.3-local-02",
  "./vendor/jspdf/jspdf.umd.min.js?v=2.5.1-local-02",
  "./vendor/supabase/supabase.umd.js?v=2-local-02",
  "./design-system/tokens.css?v=20260403-03",
  "./design-system/app-mobile.css?v=20260403-03",
  "./styles.css?v=20260403-03",
  "./app.js?v=20260403-03",
  "./manifest.webmanifest",
  "./manifest.webmanifest?v=20260403-03",
  "./qa-manifest.webmanifest",
  "./qa-manifest.webmanifest?v=20260403-03",
  "./assets/brand/dinaria-favicon-primary.svg?v=20260403-03",
  "./assets/brand/dinaria-isologotipo.svg?v=20260313-02",
  "./assets/brand/dinaria-isologotipo-white.svg?v=20260313-02",
  "./assets/brand/dinaria-isotipo.svg?v=20260313-02",
  "./icon-192.svg",
  "./icon-192.svg?v=20260403-03",
  "./icon-512.svg",
  "./icon-512.svg?v=20260403-03",
  "./icon-192-qa.svg",
  "./icon-192-qa.svg?v=20260328-10",
  "./icon-512-qa.svg",
  "./icon-512-qa.svg?v=20260328-10"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );

  self.clients.claim();
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }

    if (request.mode === "navigate") {
      const fallback = await cache.match(APP_SHELL);
      if (fallback) {
        return fallback;
      }
    }

    throw new Error("Network and cache failed");
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  const response = await fetch(request);
  if (response && response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;
  const isSupabaseApi =
    /(^|\.)supabase\.co$/i.test(url.hostname) &&
    (url.pathname.startsWith("/rest/v1") ||
      url.pathname.startsWith("/auth/v1") ||
      url.pathname.startsWith("/storage/v1") ||
      url.pathname.startsWith("/functions/v1"));

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  if (sameOrigin) {
    const aggressiveFreshDestinations = new Set(["script", "style", "manifest", "worker"]);
    if (aggressiveFreshDestinations.has(request.destination)) {
      // Prioritize fresh code/styles to avoid stale mobile/PWA UIs.
      event.respondWith(networkFirst(request));
      return;
    }

    const staticDestinations = new Set(["image", "font"]);
    if (staticDestinations.has(request.destination)) {
      event.respondWith(cacheFirst(request));
      return;
    }

    event.respondWith(networkFirst(request));
    return;
  }

  if (isSupabaseApi) {
    // Never cache auth/data requests, otherwise sync can get stale forever.
    event.respondWith(fetch(request));
    return;
  }

  const crossOriginFreshDestinations = new Set(["script", "style"]);
  if (crossOriginFreshDestinations.has(request.destination)) {
    event.respondWith(networkFirst(request));
    return;
  }

  const crossOriginStaticDestinations = new Set(["image", "font"]);
  if (crossOriginStaticDestinations.has(request.destination)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(networkFirst(request));
});
