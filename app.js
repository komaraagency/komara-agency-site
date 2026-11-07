/* Komara Agency — logique de l'interface APPLICATION.
   Navigation par onglets, offres, devis vers Base44 + WhatsApp. */

(function () {
  "use strict";

  var WA = "212701986219";
  var ENDPOINT_DEVIS = "https://superagent-d1588461.base44.app/functions/submitDevis";
  var VERSION_APP = "1.0.0";

  /* ---------------- Données des offres ---------------- */
  var OFFRES = [
    { cat: "bots", ico: "🤖", nom: "Bot Telegram scripté", desc: "Catalogue à boutons, commande en un clic", prix: "50 €", note: "48 h" },
    { cat: "bots", ico: "💬", nom: "Bot WhatsApp vendeur", desc: "Devis, relances, prise de commande", prix: "100 €", note: "2-4 sem." },
    { cat: "bots", ico: "🧠", nom: "Agent IA Premium", desc: "Multilingue, mémoire, CRM intégré", prix: "150 €", note: "2-4 sem." },
    { cat: "bots", ico: "🔧", nom: "Maintenance", desc: "Mises à jour et support", prix: "50 €", note: "/mois" },
    { cat: "web", ico: "💻", nom: "Site vitrine", desc: "Rapide, mobile, prêt à convertir", prix: "250 €", note: "7 jours" },
    { cat: "web", ico: "🛒", nom: "Site e-commerce", desc: "Catalogue, panier, paiement", prix: "Sur devis", note: "" },
    { cat: "design", ico: "🎨", nom: "Logo seul", desc: "Travail soigné, fichiers HD", prix: "50 €", note: "24 h" },
    { cat: "design", ico: "✨", nom: "Pack Premium", desc: "Logo + identité visuelle complète", prix: "150 €", note: "48 h" },
    { cat: "design", ico: "🖼️", nom: "Affiche / visuel", desc: "Affiches et visuels réseaux sociaux", prix: "30 €", note: "24-48 h" },
    { cat: "design", ico: "📸", nom: "Retouche photo", desc: "Nettoyage pro de tes images", prix: "10 €", note: "24-48 h" },
    { cat: "service", ico: "🛡️", nom: "Modération de pages", desc: "Commentaires filtrés, vrais clients envoyés sur ton WhatsApp", prix: "Sur devis", note: "" },
    { cat: "service", ico: "🎬", nom: "Vidéo & contenu IA", desc: "Pubs, Reels et vidéos pro générées avec l'IA", prix: "Sur devis", note: "" }
  ];

  var PHARES = ["Bot WhatsApp vendeur", "Site vitrine", "Agent IA Premium"];

  /* ---------------- Utilitaires ---------------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;

  function toast(texte) {
    if (!toastEl) return;
    toastEl.textContent = texte;
    toastEl.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("visible"); }, 2600);
  }

  function lienWhatsApp(texte) {
    return "https://wa.me/" + WA + "?text=" + encodeURIComponent(texte);
  }

  function ouvrir(url) {
    window.location.href = url;
  }

  function carteOffre(o, avecBouton) {
    var el = document.createElement("div");
    el.className = "offre";

    var ico = document.createElement("span");
    ico.className = "offre-ico";
    ico.textContent = o.ico;

    var corps = document.createElement("div");
    corps.className = "offre-corps";
    var nom = document.createElement("strong");
    nom.textContent = o.nom;
    var desc = document.createElement("small");
    desc.textContent = o.desc;
    corps.appendChild(nom);
    corps.appendChild(desc);

    var prix = document.createElement("div");
    prix.className = "offre-prix";
    prix.textContent = o.prix;
    if (o.note) {
      var note = document.createElement("small");
      note.textContent = o.note;
      prix.appendChild(note);
    }

    el.appendChild(ico);
    el.appendChild(corps);
    el.appendChild(prix);

    if (avecBouton) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = "Je veux";
      btn.addEventListener("click", function () {
        ouvrir(lienWhatsApp(
          "Bonjour Komara Agency 👋 Je suis intéressé par : " + o.nom + " (" + o.prix + "). On peut en parler ?"
        ));
      });
      el.appendChild(btn);
    }
    return el;
  }

  /* ---------------- Navigation par onglets ---------------- */
  var onglets = Array.prototype.slice.call(document.querySelectorAll(".onglet"));
  var ecrans = Array.prototype.slice.call(document.querySelectorAll(".ecran"));
  var noms = { accueil: "Accueil", offres: "Offres", devis: "Devis", plus: "Plus" };

  function afficherOnglet(nom) {
    if (!noms[nom]) nom = "accueil";
    ecrans.forEach(function (e) {
      e.classList.toggle("actif", e.id === "ecran-" + nom);
    });
    onglets.forEach(function (o) {
      o.classList.toggle("actif", o.dataset.onglet === nom);
    });
    var sous = document.getElementById("topbar-sous");
    if (sous) sous.textContent = noms[nom];
    window.scrollTo({ top: 0, behavior: "smooth" });
    try {
      history.replaceState(null, "", "#" + nom);
    } catch (_e) {}
  }

  onglets.forEach(function (o) {
    o.addEventListener("click", function () { afficherOnglet(o.dataset.onglet); });
  });

  Array.prototype.slice.call(document.querySelectorAll("[data-va]")).forEach(function (b) {
    b.addEventListener("click", function () { afficherOnglet(b.dataset.va); });
  });

  var hash = (location.hash || "").replace("#", "");
  afficherOnglet(noms[hash] ? hash : "accueil");

  /* ---------------- Remplissage des listes ---------------- */
  var phares = document.getElementById("phares");
  if (phares) {
    OFFRES.filter(function (o) { return PHARES.indexOf(o.nom) !== -1; })
      .forEach(function (o) { phares.appendChild(carteOffre(o, true)); });
  }

  var liste = document.getElementById("liste-offres");

  function remplirListe(cat) {
    if (!liste) return;
    liste.innerHTML = "";
    OFFRES.filter(function (o) { return cat === "tous" || o.cat === cat; })
      .forEach(function (o) { liste.appendChild(carteOffre(o, true)); });
  }
  remplirListe("tous");

  Array.prototype.slice.call(document.querySelectorAll(".chip")).forEach(function (chip) {
    chip.addEventListener("click", function () {
      Array.prototype.slice.call(document.querySelectorAll(".chip")).forEach(function (c) {
        c.classList.remove("actif");
      });
      chip.classList.add("actif");
      remplirListe(chip.dataset.cat);
    });
  });

  /* ---------------- WhatsApp ---------------- */
  var cta = document.getElementById("cta-whatsapp");
  if (cta) {
    cta.addEventListener("click", function () {
      ouvrir(lienWhatsApp("Bonjour Komara Agency 👋 J'ai vu votre application, je veux discuter d'un projet."));
    });
  }
  var wa2 = document.getElementById("raccourci-wa");
  if (wa2) {
    wa2.addEventListener("click", function () {
      ouvrir(lienWhatsApp("Bonjour Komara Agency 👋"));
    });
  }
  var site2 = document.getElementById("raccourci-site");
  if (site2) {
    site2.addEventListener("click", function () { ouvrir("index.html?web=1#realisations"); });
  }

  /* ---------------- Devis ---------------- */
  var form = document.getElementById("form-devis");
  var btnEnvoyer = document.getElementById("btn-envoyer");
  var recap = document.getElementById("recap");
  var dernierDevis = null;

  if (form) {
    form.addEventListener("submit", async function (evenement) {
      evenement.preventDefault();

      var nom = (document.getElementById("nom").value || "").trim();
      var tel = (document.getElementById("telephone").value || "").trim();
      var service = document.getElementById("service").value;
      var message = (document.getElementById("message").value || "").trim();

      if (nom.length < 2) { toast("Mets ton nom 🙏"); return; }
      if (tel.replace(/\D/g, "").length < 7) { toast("Numéro WhatsApp incomplet"); return; }

      btnEnvoyer.disabled = true;
      btnEnvoyer.textContent = "Envoi…";

      var charge = {
        nom: nom,
        telephone: tel,
        service: service,
        message: message,
        source: "application",
        page: "app.html",
        referrer: document.referrer || "pwa"
      };

      try {
        await fetch(ENDPOINT_DEVIS, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(charge),
          keepalive: true
        });
      } catch (_e) {
        /* hors ligne : la demande part quand même sur WhatsApp */
      }

      dernierDevis = charge;
      if (recap) recap.hidden = false;
      btnEnvoyer.textContent = "Demande envoyée ✅";
      toast("Demande enregistrée ✅");

      var texteWA = "Bonjour Komara Agency 👋\n\nNom : " + nom +
        "\nWhatsApp : " + tel +
        "\nBesoin : " + service +
        (message ? "\nProjet : " + message : "");

      setTimeout(function () { ouvrir(lienWhatsApp(texteWA)); }, 600);

      setTimeout(function () {
        btnEnvoyer.disabled = false;
        btnEnvoyer.textContent = "Envoyer ma demande";
      }, 3500);
    });
  }

  var btnWA = document.getElementById("btn-devis-wa");
  if (btnWA) {
    btnWA.addEventListener("click", function () {
      var d = dernierDevis;
      var texte = d
        ? "Bonjour Komara Agency 👋\n\nNom : " + d.nom + "\nWhatsApp : " + d.telephone +
          "\nBesoin : " + d.service + (d.message ? "\nProjet : " + d.message : "")
        : "Bonjour Komara Agency 👋 Je veux un devis.";
      ouvrir(lienWhatsApp(texte));
    });
  }

  /* ---------------- Onglet Plus ---------------- */
  var versionEl = document.getElementById("version-app");
  if (versionEl) versionEl.textContent = VERSION_APP;

  var btnInstaller = document.getElementById("btn-installer");
  if (btnInstaller) {
    if (!window.pwaPromptInstall) {
      btnInstaller.style.display = "none";
    } else {
      btnInstaller.addEventListener("click", function () {
        var lance = window.pwaPromptInstall();
        if (!lance) toast("Déjà installée sur cet appareil 👍");
      });
    }
  }

  var btnMaj = document.getElementById("btn-maj");
  if (btnMaj) {
    btnMaj.addEventListener("click", async function () {
      toast("Recherche de mise à jour…");
      try {
        var regs = await navigator.serviceWorker.getRegistrations();
        for (var i = 0; i < regs.length; i++) await regs[i].update();
        setTimeout(function () { location.reload(); }, 1200);
      } catch (_e) {
        location.reload();
      }
    });
  }

  var btnPartager = document.getElementById("btn-partager");
  if (btnPartager) {
    btnPartager.addEventListener("click", async function () {
      var url = location.origin + location.pathname.replace("app.html", "");
      if (navigator.share) {
        try {
          await navigator.share({
            title: "Komara Agency",
            text: "Bots WhatsApp, sites web et design. Devis gratuit en 2 minutes.",
            url: url
          });
        } catch (_e) {}
      } else {
        try {
          await navigator.clipboard.writeText(url);
          toast("Lien copié ✅");
        } catch (_e) {
          toast(url);
        }
      }
    });
  }

  /* ---------------- Etat réseau ---------------- */
  function majEtat() {
    var p = document.getElementById("pastille-etat");
    if (!p) return;
    p.textContent = navigator.onLine ? "en ligne" : "hors ligne";
  }
  window.addEventListener("online", majEtat);
  window.addEventListener("offline", majEtat);
  majEtat();

  // Retour sur l'onglet : on rafraîchit l'état réseau
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") majEtat();
  });
})();
