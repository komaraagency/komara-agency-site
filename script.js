/* =========================================================
   Komara Agency 🇬🇳 — site + assistant Aya
   1) Formulaire de devis -> WhatsApp
   2) Chatbot local : réponses issues du seed officiel (aya_seed.py)
   Aucune clé API, aucun coût, aucune dépendance externe.
   ========================================================= */

/* ---------- 1. FORMULAIRE -> WHATSAPP ---------- */
const form = document.getElementById("devisForm");
if (form) {
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const nom = document.getElementById("nom").value.trim();
    const tel = document.getElementById("telephone").value.trim();
    const service = document.getElementById("service").value;
    const msg = document.getElementById("message").value.trim();

    const texte =
      "*Nouveau devis Komara Agency*\n\n" +
      "*Nom :* " + nom + "\n" +
      "*WhatsApp :* " + tel + "\n" +
      "*Service :* " + service + "\n" +
      "*Besoin :* " + msg;

    window.open("https://wa.me/212701986219?text=" + encodeURIComponent(texte), "_blank");
    form.reset();
  });
}

/* ---------- 2. ASSISTANT AYA (seed officiel) ---------- */
const WHATSAPP = "https://wa.me/212701986219?text=" +
  encodeURIComponent("Bonjour Komara Agency, je viens du site et je veux un devis.");

const BASE = [
  {
    q: ["salut", "bonjour", "bonsoir", "coucou", "hello", "salem", "salam"],
    a: "Salut toi 👋 Moi c'est Aya, l'assistante de Komara Agency 🇬🇳 Dis-moi ce que tu cherches, je suis là pour t'aider à briller ✨"
  },
  {
    q: ["ca va", "comment ca va", "tu vas bien", "comment vas tu"],
    a: "Ça va bien merci 🙏 Moi je suis Aya, prête à t'aider. Et toi, tu viens pour un bot, un site ou un visuel ?"
  },
  {
    q: ["qui es tu", "tu es qui", "qui est tu", "tu fais quoi", "que faites vous", "c'est quoi komara agency", "que fait komara agency", "presente toi"],
    a: "Je suis Aya 🤖 l'IA de Komara Agency 🇬🇳 Je réponds aux clients à ta place, 24h/24, en français, arabe, anglais et espagnol. Bots WhatsApp et Telegram, sites web, logos, affiches et RDV automatiques : je vends pour toi même quand tu dors 😴"
  },
  {
    q: ["services", "vos services", "que proposez vous", "que faites vous", "qu'est ce que vous faites", "prestations"],
    a: "Nos services 🚀\n• Bots WhatsApp et Telegram\n• Sites web vitrine et e-commerce\n• Logos et identité visuelle\n• Affiches et visuels pub\n• Modération de pages\n• Gestion des RDV automatique\nTape 'prix' pour les tarifs 👇"
  },
  {
    q: ["prix", "tarif", "tarifs", "combien", "c'est combien", "combien ca coute", "cout", "budget"],
    a: "Tarifs 🇬🇳 (tout en euros)\n• Logo seul : 50 € (livré en 24h)\n• Logo premium / Pack Premium : 150 €\n• Affiche / visuel : 30 €\n• Site vitrine : 50 € (7 jours)\n• Retouche photo : 10 €\n• Bot / agent IA : dès 150 €\nExpress 24h : +30%\nDis-moi ce qu'il te faut exactement, je te donne le prix précis 👇"
  },
  {
    q: ["delai", "delais", "combien de temps", "quand", "livraison", "rapidite"],
    a: "Délais ⏱️ Logo : 24h (V1 le lendemain 9h si commande ce soir). Affiche : 24 à 48h. Site vitrine : 7 jours. Chatbot : 2 à 4 semaines après validation du devis. Tu veux qu'on commence ?"
  },
  {
    q: ["commander", "commande", "je veux commander", "je veux un bot", "je veux un site", "je souhaite creer un site", "je veux creer un site", "comment ca marche"],
    a: "Simple 👇\n1. Dis-moi ton projet\n2. Je te fais un devis gratuit\n3. 50% pour démarrer, 50% à la livraison\n4. Tu reçois tes fichiers HD + sources\nOn y va ?"
  },
  {
    q: ["paiement", "payer", "orange money", "mtn", "wave", "mobile money", "virement", "moyen de paiement"],
    a: "On prend 50% au démarrage et 50% à la livraison 💳 Orange Money, MTN, mobile money ou virement. Tu es en Guinée ou ailleurs ?"
  },
  {
    q: ["kindia", "livrez vous", "livraison guinee", "hors guinee", "localisation", "vous etes ou", "ou etes vous", "afrique"],
    a: "Oui 🇬🇳 On livre partout en Guinée et on bosse en ligne avec le monde entier. On est basés en Afrique de l'Ouest mais 100% en ligne : la distance n'est plus un problème !"
  },
  {
    q: ["portfolio", "realisations", "exemples", "vos travaux", "references"],
    a: "Bonne idée 📂 Envoie-moi ton secteur (restaurant, boutique, école...) et je te montre des exemples adaptés à ton activité 👇"
  },
  {
    q: ["reduction", "promo", "remise", "moins cher", "discount"],
    a: "On a parfois des promos 🎉 Pour les gros projets, on discute toujours du prix. Dis-moi ton budget et ce qu'il te faut, je vois ce que je peux faire."
  },
  {
    q: ["c'est quoi un bot", "c'est quoi un chatbot", "un bot c'est quoi", "chatbot", "bot"],
    a: "Un bot 🤖 c'est ton employé digital qui ne dort jamais. Il discute avec tes clients sur WhatsApp, Telegram ou ton site, répond aux questions, prend les commandes et envoie les infos en automatique. Il fait le travail répétitif à ta place ⏱️"
  },
  {
    q: ["agent ia", "agent intelligent", "ia generative", "intelligence artificielle", "assistant ia"],
    a: "Un agent IA ✨ c'est un chatbot boosté : il ne répond pas seulement, il AGIT et il CRÉE. Il génère des visuels, écrit des textes, produit des devis, apprend tes produits et mène des actions de A à Z. Un employé digital qui connaît ton business par cœur 💪"
  },
  {
    q: ["automatisation", "automatiser", "automatique", "gagner du temps"],
    a: "Une automatisation ⚙️ c'est quand une tâche se fait toute seule. Exemple : le client paie, il reçoit sa facture auto, son nom part dans ton Excel, il reçoit un message de remerciement. Toi tu gagnes du temps, zéro oubli, plus de ventes 📈"
  },
  {
    q: ["moderation", "gerer mes messages", "trop de messages", "commentaires", "community management", "reseaux sociaux"],
    a: "On gère tes pages Facebook et Instagram 🛡️ Analyse de la page, lignes directrices, filtre IA des contenus inappropriés, réponses rapides et pro aux messages et commentaires. Ta communauté reste propre et tu ne perds plus aucun client 🚀"
  },
  {
    q: ["site web", "site internet", "site vitrine", "e-commerce", "boutique en ligne"],
    a: "Pas de sites morts 💻 On crée des sites vitrine ou e-commerce qui transforment les visiteurs en clients : design pro, rapide, adapté au mobile. Site vitrine : 50 € en 7 jours. Tu veux un devis ?"
  },
  {
    q: ["logo", "identite visuelle", "charte graphique", "marque"],
    a: "Logo seul : 50 € livré en 24h. Pack Premium (logo pro retravaillé + identité visuelle) : 150 €. On te montre un aperçu avant la livraison finale ✨"
  },
  {
    q: ["affiche", "visuel", "flyer", "retouche", "photo", "publicite"],
    a: "Affiche ou visuel pub : 30 € (24 à 48h). Retouche photo : 10 €. On adapte les formats pour WhatsApp, Facebook, Instagram et l'impression 🖼️"
  },
  {
    q: ["support", "apres livraison", "maintenance", "garantie", "suivi"],
    a: "Support continu 💪 Mises à jour et ajustements selon tes besoins, accès à notre équipe pour toute question ou modification. Tu n'es jamais seul après le lancement 🤝"
  },
  {
    q: ["langue", "langues", "arabe", "anglais", "soussou", "pular", "espagnol", "traduction"],
    a: "Aya parle français, arabe, anglais et espagnol 🌍 On configure le bot selon tes clients et ton marché. Tu veux quelle langue en priorité ?"
  },
  {
    q: ["devis", "facture", "estimation", "proposition"],
    a: "Devis gratuit en 2 minutes 😊 Dis-moi : le service (bot, site, logo...), ton besoin en une phrase et ta deadline. Je te renvoie un prix clair, sans surprise."
  },
  {
    q: ["rendez vous", "rdv", "appel", "telephone", "meeting"],
    a: "Avec plaisir 📞 Écris-moi sur WhatsApp au +212 701 986 219 et on cale un créneau. Tu peux aussi remplir le formulaire de devis, je te réponds vite."
  },
  {
    q: ["humain", "parler a un humain", "une personne", "equipe", "conseiller", "appeler quelqu'un"],
    a: "Pas de souci 🙋 Je passe le relais à l'équipe. Écris directement à N-Dine sur WhatsApp : +212 701 986 219. Tu seras recontacté rapidement."
  },
  {
    q: ["contact", "whatsapp", "numero", "email", "mail", "joindre"],
    a: "WhatsApp direct : +212 701 986 219\nE-mail : ndinekomara2442@gmail.com\nRéponse 7j/7 🇬🇳"
  },
  {
    q: ["qui est le fondateur", "ndine", "patron", "boss", "agence"],
    a: "Komara Agency a été fondée par Ndine Komara à Casablanca 🇬🇳 Notre mission : digitaliser les business africains avec des outils qui vendent vraiment."
  },
  {
    q: ["merci", "c'est gentil", "super", "parfait", "top"],
    a: "Avec plaisir 🙏 C'est notre travail de t'aider à grandir. Tu as un projet en tête ?"
  },
  {
    q: ["au revoir", "bye", "a bientot", "bonne journee", "ciao"],
    a: "À bientôt 👋 Reviens quand tu veux, je suis dispo 24h/24 🇬🇳 Que Dieu bénisse ton business ✨"
  }
];

const FALLBACK =
  "Je n'ai pas encore la réponse exacte à ça 😅 Je passe le relais à l'équipe : écris à N-Dine sur WhatsApp au +212 701 986 219, il te répond vite. Tu peux aussi me demander nos services, les tarifs ou les délais 👇";

function normaliser(txt) {
  return txt
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function repondre(texte) {
  const question = normaliser(texte);
  if (!question) return FALLBACK;

  let meilleur = null;
  let meilleurScore = 0;

  for (const fiche of BASE) {
    for (const variante of fiche.q) {
      const v = normaliser(variante);
      let score = 0;

      if (question === v) score = 1000;
      else if (question.includes(v)) score = 500 + v.length;

      if (score === 0) {
        const motsV = v.split(" ").filter((m) => m.length > 2);
        if (motsV.length) {
          const motsQ = question.split(" ");
          const trouves = motsV.filter((m) => motsQ.includes(m)).length;
          if (trouves === motsV.length) score = 300 + v.length;
          else if (trouves >= 2) score = 100 + trouves * 10;
        }
      }

      if (score > meilleurScore) {
        meilleurScore = score;
        meilleur = fiche;
      }
    }
  }

  return meilleurScore >= 100 && meilleur ? meilleur.a : FALLBACK;
}

/* ---------- INTERFACE DU CHAT ---------- */
const btn = document.getElementById("chatbot-btn");
const box = document.getElementById("chatbot-box");
const closeBtn = document.getElementById("close-chat");
const input = document.getElementById("chat-input");
const messages = document.getElementById("chat-messages");

function ajouterMessage(texte, expediteur) {
  const div = document.createElement("div");
  div.className = "msg " + expediteur;
  div.textContent = texte;
  if (/\+212|\+212 701|wa\.me|ndinekomara/i.test(texte) && expediteur === "bot") {
    const lien = document.createElement("a");
    lien.href = WHATSAPP;
    lien.target = "_blank";
    lien.rel = "noopener";
    lien.textContent = "Ouvrir WhatsApp";
    div.appendChild(document.createElement("br"));
    div.appendChild(lien);
  }
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function envoyer() {
  const texte = input.value.trim();
  if (!texte) return;
  ajouterMessage(texte, "user");
  input.value = "";
  const reponse = repondre(texte);
  setTimeout(() => ajouterMessage(reponse, "bot"), 350);
}

if (btn && box && input) {
  btn.addEventListener("click", () => {
    box.classList.toggle("hidden");
    if (!box.classList.contains("hidden")) input.focus();
  });
  closeBtn.addEventListener("click", () => box.classList.add("hidden"));
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      envoyer();
    }
  });
}
