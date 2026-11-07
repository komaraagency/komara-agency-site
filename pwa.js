/* Komara Agency — PWA : installation, mises à jour automatiques, mode hors ligne.
   Aucune version à modifier : le navigateur compare sw.js tout seul et la page
   prévient dès qu'une nouvelle version est détectée. */

(function () {
  "use strict";

  if (!("serviceWorker" in navigator)) return;

  // Depuis /en/ ou /ar/, le service worker vit un niveau au-dessus.
  var prefixe = /\/[a-z]{2}\/$/.test(location.pathname) ? "../" : "./";
  var urlSW = prefixe + "sw.js";
  var portee = prefixe;

  // Sur un appareil ou l'app est installee, on ouvre l'INTERFACE APPLICATION,
  // pas la page web (sauf demande explicite du site avec ?web=1).
  var params = new URLSearchParams(location.search);
  var modeApp =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;
  var surRacineSite =
    /^\/(index\.html)?$/.test(location.pathname) ||
    /\/komara-agency-site\/?$/.test(location.pathname);
  if (modeApp && surRacineSite && !params.has("web")) {
    location.replace(prefixe + "app.html?source=pwa");
    return;
  }

  var dejaRecharge = false;

  function bandeau(texte, action, surClic) {
    var id = "pwa-bandeau";
    var existant = document.getElementById(id);
    if (existant) existant.remove();

    var barre = document.createElement("div");
    barre.id = id;
    barre.className = "pwa-bandeau";

    var p = document.createElement("span");
    p.textContent = texte;
    barre.appendChild(p);

    if (action) {
      var bouton = document.createElement("button");
      bouton.type = "button";
      bouton.textContent = action;
      bouton.addEventListener("click", surClic);
      barre.appendChild(bouton);
    }

    var fermer = document.createElement("button");
    fermer.type = "button";
    fermer.className = "pwa-fermer";
    fermer.setAttribute("aria-label", "Fermer");
    fermer.textContent = "✕";
    fermer.addEventListener("click", function () { barre.remove(); });
    barre.appendChild(fermer);

    document.body.appendChild(barre);
  }

  function recharger(force) {
    if (dejaRecharge) return;
    dejaRecharge = true;
    if (force) location.reload();
  }

  navigator.serviceWorker
    .register(urlSW, { scope: portee, updateViaCache: "none" })
    .then(function (enregistrement) {
      // Nouvelle version détectée par le navigateur
      enregistrement.addEventListener("updatefound", function () {
        var nouveau = enregistrement.installing;
        if (!nouveau) return;
        nouveau.addEventListener("statechange", function () {
          if (nouveau.state === "installed" && navigator.serviceWorker.controller) {
            bandeau("Nouvelle version disponible", "Recharger", function () { recharger(true); });
          }
        });
      });

      // Vérifie les mises à jour : au chargement, au retour sur l'onglet, et régulièrement
      var verifier = function () { enregistrement.update().catch(function () {}); };
      verifier();
      document.addEventListener("visibilitychange", function () {
        if (document.visibilityState === "visible") verifier();
      });
      setInterval(verifier, 30 * 60 * 1000);

      // Le SW a pris la main (première installation ou mise à jour)
      navigator.serviceWorker.addEventListener("controllerchange", function () {
        if (document.visibilityState === "visible") {
          bandeau("Mise à jour installée", "Recharger", function () { recharger(true); });
        }
      });
    })
    .catch(function () { /* PWA indisponible : le site reste utilisable */ });

  // Message du service worker : le HTML en ligne a changé
  navigator.serviceWorker.addEventListener("message", function (event) {
    if (event.data && event.data.type === "MAJ_DISPONIBLE") {
      bandeau("Le site a été mis à jour", "Recharger", function () { recharger(true); });
    }
  });

  // Bandeau hors ligne / retour en ligne
  window.addEventListener("offline", function () {
    document.documentElement.classList.add("hors-ligne");
  });
  window.addEventListener("online", function () {
    document.documentElement.classList.remove("hors-ligne");
  });
  if (!navigator.onLine) document.documentElement.classList.add("hors-ligne");

  // Bouton « Installer l'app »
  var invite = null;
  var boutonInstall = null;

  function afficherBoutonInstall() {
    if (boutonInstall || !invite) return;
    boutonInstall = document.createElement("button");
    boutonInstall.type = "button";
    boutonInstall.id = "pwa-install";
    boutonInstall.textContent = "⬇️ Installer l'app";
    boutonInstall.addEventListener("click", function () {
      if (!invite) return;
      invite.prompt();
      invite.userChoice.finally(function () {
        invite = null;
        boutonInstall.remove();
        boutonInstall = null;
      });
    });
    document.body.appendChild(boutonInstall);
  }

  window.addEventListener("beforeinstallprompt", function (event) {
    event.preventDefault();
    invite = event;
    if (document.body.dataset.installButton !== "off") afficherBoutonInstall();
  });

  // Utilisable depuis l'ecran "Plus" de l'application
  window.pwaPromptInstall = function () {
    if (!invite) return false;
    invite.prompt();
    var choix = invite.userChoice;
    invite = null;
    if (choix && choix.finally) {
      choix.finally(function () {
        if (boutonInstall) { boutonInstall.remove(); boutonInstall = null; }
      });
    }
    return true;
  };

  window.addEventListener("appinstalled", function () {
    invite = null;
    if (boutonInstall) { boutonInstall.remove(); boutonInstall = null; }
  });
})();
