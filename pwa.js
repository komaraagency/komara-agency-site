/* Komara Agency — PWA : enregistrement du service worker + bouton d'installation.
   Chargé sur les 3 versions du site (FR, EN, AR).
   Chemins calculés selon la profondeur de la page, donc il fonctionne aussi en sous-dossier GitHub Pages. */

(function () {
  "use strict";

  var dansSousDossier = /\/(en|ar)\/?$/.test(location.pathname);
  var racine = dansSousDossier ? "../" : "./";

  /* ---------- 1. Enregistrement du service worker ---------- */
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker
        .register(racine + "sw.js", { scope: racine })
        .then(function (enregistrement) {
          // verifier les mises a jour a chaque ouverture
          enregistrement.update().catch(function () {});
        })
        .catch(function (erreur) {
          console.warn("Service worker non enregistre :", erreur);
        });
    });
  }

  /* ---------- 2. Bouton "Installer l'application" ---------- */
  var invite = null;
  var bouton = null;

  function creerBouton() {
    if (bouton) return bouton;
    bouton = document.createElement("button");
    bouton.id = "pwa-install";
    bouton.type = "button";
    bouton.innerHTML = "⬇️ Installer l'app";
    bouton.setAttribute(
      "aria-label",
      "Installer Komara Agency sur cet appareil"
    );
    bouton.addEventListener("click", async function () {
      if (!invite) return;
      bouton.disabled = true;
      invite.prompt();
      try {
        var choix = await invite.userChoice;
        if (choix && choix.outcome === "accepted") {
          bouton.remove();
          bouton = null;
        } else {
          bouton.disabled = false;
        }
      } catch (_e) {
        bouton.disabled = false;
      }
      invite = null;
    });
    document.body.appendChild(bouton);
    return bouton;
  }

  window.addEventListener("beforeinstallprompt", function (evenement) {
    evenement.preventDefault();
    invite = evenement;
    creerBouton();
  });

  window.addEventListener("appinstalled", function () {
    if (bouton) {
      bouton.remove();
      bouton = null;
    }
    invite = null;
  });

  /* ---------- 3. Petit indicateur hors ligne ---------- */
  function majStatut() {
    if (navigator.onLine) {
      document.documentElement.classList.remove("hors-ligne");
    } else {
      document.documentElement.classList.add("hors-ligne");
    }
  }
  window.addEventListener("online", majStatut);
  window.addEventListener("offline", majStatut);
  majStatut();
})();
