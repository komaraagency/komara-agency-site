/* Komara Agency — Service Worker
   Objectif : le site se met à jour tout seul sur TOUS les appareils, sans
   intervention manuelle et sans version à incrémenter à la main.

   Stratégies :
   - Pages HTML  : réseau d'abord (toujours la dernière version en ligne),
                   cache seulement si le réseau échoue. Si le HTML récupéré
                   diffère de celui du cache, les onglets ouverts sont prévenus
                   pour afficher « nouvelle version ».
   - CSS / JS / images : cache immédiat + mise à jour en tâche de fond
                   (stale-while-revalidate) : l'utilisateur voit la nouvelle
                   version au chargement suivant, jamais une page cassée.
   - POST / API (formulaire, devis) : jamais mis en cache, jamais intercepté.
*/

const CACHE = "komara-shell-v4";
const CACHE_HTML = CACHE + "-pages";
const CACHE_STATIQUE = CACHE + "-static";

const NOYAU = [
  "./",
  "./index.html",
  "./app.html",
  "./app.css",
  "./app.js",
  "./style.css",
  "./script.js",
  "./pwa.js",
  "./manifest.json",
  "./offline.html",
  "./assets/logo-128.png",
  "./assets/logo-256.png",
  "./icon-192.png",
  "./icon-512.png",
  "./favicon-64.png",
  "./en/index.html",
  "./ar/index.html",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_STATIQUE);
      // addAll échoue en bloc si une seule URL rate : on ajoute une par une.
      await Promise.all(
        NOYAU.map((url) =>
          cache.add(new Request(url, { cache: "reload" })).catch(() => null)
        )
      );
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const noms = await caches.keys();
      await Promise.all(
        noms.filter((n) => n !== CACHE_STATIQUE && n !== CACHE_HTML).map((n) => caches.delete(n))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

function estStatique(url) {
  return /\.(css|js|mjs|png|jpe?g|webp|gif|svg|ico|woff2?|ttf)$/i.test(url.pathname);
}

async function majPageDepuisReseau(requete) {
  const cache = await caches.open(CACHE_HTML);
  const enCache = await cache.match(requete);
  const reseau = await fetch(requete, { cache: "no-store" });
  if (reseau && reseau.ok) {
    const copie = reseau.clone();
    const texte = await copie.text();
    const ancien = enCache ? await enCache.clone().text() : "";
    cache.put(requete, new Response(texte, {
      status: reseau.status,
      statusText: reseau.statusText,
      headers: reseau.headers,
    }));
    if (ancien && ancien !== texte) {
      const onglets = await self.clients.matchAll({ type: "window" });
      onglets.forEach((c) => c.postMessage({ type: "MAJ_DISPONIBLE", url: requete.url }));
    }
  }
  return reseau;
}

self.addEventListener("fetch", (event) => {
  const requete = event.request;

  if (requete.method !== "GET") return;

  const url = new URL(requete.url);
  if (url.origin !== self.location.origin) return;

  // Pages : réseau d'abord
  if (requete.mode === "navigate" || (requete.headers.get("accept") || "").includes("text/html")) {
    event.respondWith(
      (async () => {
        try {
          return await majPageDepuisReseau(requete);
        } catch (_e) {
          const cache = await caches.open(CACHE_HTML);
          const enCache = await cache.match(requete, { ignoreSearch: true });
          if (enCache) return enCache;
          const statique = await caches.open(CACHE_STATIQUE);
          return (
            (await statique.match("./offline.html")) ||
            (await statique.match("./index.html")) ||
            new Response("Hors ligne", { status: 503 })
          );
        }
      })()
    );
    return;
  }

  // Assets : cache immédiat + revalidation en fond
  if (estStatique(url)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_STATIQUE);
        const enCache = await cache.match(requete);
        const miseAJour = fetch(requete)
          .then((reponse) => {
            if (reponse && reponse.ok) cache.put(requete, reponse.clone());
            return reponse;
          })
          .catch(() => null);
        return enCache || (await miseAJour) || new Response("", { status: 504 });
      })()
    );
    return;
  }

  // Reste (API interne éventuelle) : réseau, cache de secours
  event.respondWith(
    (async () => {
      try {
        return await fetch(requete);
      } catch (_e) {
        const cache = await caches.open(CACHE_STATIQUE);
        return (await cache.match(requete)) || new Response("", { status: 504 });
      }
    })()
  );
});
