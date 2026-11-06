/* Komara Agency — service worker (PWA)
   Stratégies :
   - pages HTML : réseau d'abord, cache en secours, page hors ligne si tout échoue
   - assets (css, js, images) : cache d'abord, mise à jour en arrière-plan
   - appels API (devis Base44) : jamais mis en cache, réseau uniquement
*/

const VERSION = "v1";
const CACHE = "komara-" + VERSION;
const RUNTIME = "komara-runtime-" + VERSION;

const NOYAU = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./pwa.js",
  "./manifest.json",
  "./offline.html",
  "./assets/logo-128.png",
  "./assets/logo-256.png",
  "./assets/og-image.jpg",
  "./icon-192.png",
  "./icon-512.png",
  "./assets/portfolio/affiche-equipe-digitale.jpg",
  "./assets/portfolio/avant-apres-whatsapp.jpg",
  "./en/",
  "./ar/",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      // addAll echoue en bloc : on ajoute une par une pour tolerer un 404
      await Promise.all(
        NOYAU.map((url) =>
          cache.add(new Request(url, { cache: "reload" })).catch(() => null)
        )
      );
      self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const noms = await caches.keys();
      await Promise.all(
        noms
          .filter((n) => n !== CACHE && n !== RUNTIME)
          .map((n) => caches.delete(n))
      );
      await self.clients.claim();
    })()
  );
});

function estApi(url) {
  return url.hostname.includes("base44.app") || url.pathname.includes("/functions/");
}

function estPage(requete, url) {
  return requete.mode === "navigate" || (requete.method === "GET" && url.pathname.endsWith("/"));
}

self.addEventListener("fetch", (event) => {
  const requete = event.request;
  if (requete.method !== "GET") return;

  const url = new URL(requete.url);
  if (url.origin !== self.location.origin && !url.hostname.includes("media.base44.com")) {
    // domaines externes (WhatsApp, API) : on laisse passer
    if (estApi(url)) return;
  }
  if (estApi(url)) return;

  // Pages : réseau d'abord
  if (estPage(requete, url)) {
    event.respondWith(
      (async () => {
        try {
          const reponse = await fetch(requete);
          const cache = await caches.open(RUNTIME);
          cache.put(requete, reponse.clone());
          return reponse;
        } catch (_e) {
          const cache = await caches.open(RUNTIME);
          const enCache = await cache.match(requete);
          if (enCache) return enCache;
          const noyau = await caches.open(CACHE);
          const secours = await noyau.match(requete);
          if (secours) return secours;
          const horsLigne = await noyau.match("./offline.html");
          return (
            horsLigne ||
            new Response("Hors ligne", { status: 503, headers: { "Content-Type": "text/plain" } })
          );
        }
      })()
    );
    return;
  }

  // Assets : cache d'abord, puis réseau + mise en cache
  event.respondWith(
    (async () => {
      const cache = await caches.open(RUNTIME);
      const enCache = await cache.match(requete);
      if (enCache) {
        // rafraichissement silencieux
        fetch(requete)
          .then((r) => {
            if (r && r.ok) cache.put(requete, r.clone());
          })
          .catch(() => null);
        return enCache;
      }
      try {
        const reponse = await fetch(requete);
        if (reponse && reponse.ok) cache.put(requete, reponse.clone());
        return reponse;
      } catch (_e) {
        const noyau = await caches.open(CACHE);
        const secours = await noyau.match(requete);
        if (secours) return secours;
        return new Response("", { status: 504 });
      }
    })()
  );
});

// Permet au site de forcer une mise a jour
self.addEventListener("message", (event) => {
  if (event.data === "skip-waiting") self.skipWaiting();
});
