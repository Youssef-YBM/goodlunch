// Tableau des produits
const produits = [
  { id: 1, nom: "Healthy Bowl", prix: 45, image: "images/healthy-bowl.jpg", description: "Un bol équilibré avec quinoa, légumes frais et sauce maison." },
  { id: 2, nom: "Chicken Wrap", prix: 35, image: "images/chicken-wrap.jpg", description: "Wrap au poulet grillé, salade et sauce yaourt." },
  { id: 3, nom: "Couscous Traditionnel", prix: 50, image: "images/couscous-traditionnel.jpg", description: "Couscous aux légumes, viande et sauce épicée." },
  { id: 4, nom: "Pasta Italiana", prix: 40, image: "images/pasta-italiana.jpg", description: "Pâtes aux champignons et crème fraîche." },
  { id: 5, nom: "Burger Premium", prix: 55, image: "images/burger-premium.jpg", description: "Burger avec steak haché, fromage, salade et sauce spéciale." }
];

// Générer les cartes des repas
function genererCartes() {
  const conteneur = document.getElementById("conteneur-cartes");
  conteneur.innerHTML = produits.map(produit => `
    <div class="carte-repas">
      <img src="${produit.image}" alt="${produit.nom}">
      <h3>${produit.nom}</h3>
      <p>${produit.description}</p>
      <p>${produit.prix} MAD</p>
      <button class="btn-ajouter" onclick="ajouterAuPanier(${produit.id})">Ajouter au panier</button>
    </div>
  `).join("");
}

// Ajouter un produit au panier
function ajouterAuPanier(id) {
  let panier = JSON.parse(localStorage.getItem("panier")) || [];
  const produit = produits.find(p => p.id === id);
  panier.push(produit);
  localStorage.setItem("panier", JSON.stringify(panier));
  mettreAJourPanier();
  afficherToast(`${produit.nom} ajouté au panier !`);
}

// Mettre à jour l'affichage du panier
function mettreAJourPanier() {
  const panier = JSON.parse(localStorage.getItem("panier")) || [];
  const listePanier = document.getElementById("liste-panier");
  const compteur = document.getElementById("compteur-panier");
  const total = document.getElementById("total-panier");

  compteur.textContent = panier.length;

  if (panier.length === 0) {
    listePanier.innerHTML = "<p>Votre panier est vide.</p>";
    total.textContent = "0";
    return;
  }

  const produitsUniques = {};
  panier.forEach(item => {
    if (!item.type) { // Si c'est un produit standard
      produitsUniques[item.id] = produitsUniques[item.id] ? {...item, quantite: produitsUniques[item.id].quantite + 1} : {...item, quantite: 1};
    }
  });

  // Ajouter les repas personnalisés
  const repasPersonnalises = panier.filter(item => item.type === "personnalise");

  let listeHTML = Object.values(produitsUniques).map(item => `
    <div class="item-panier">
      <div>
        <h4>${item.nom} x${item.quantite}</h4>
        <p>${item.prix * item.quantite} MAD</p>
      </div>
      <button onclick="supprimerDuPanier(${item.id})">❌</button>
    </div>
  `).join("");

  // Ajouter les repas personnalisés
  repasPersonnalises.forEach(item => {
    listeHTML += `
      <div class="item-panier">
        <div>
          <h4>${item.nom}</h4>
          <p>${item.description}</p>
          <p>${item.prix} MAD</p>
        </div>
        <button onclick="supprimerRepasPersonnalise(${item.id})">❌</button>
      </div>
    `;
  });

  listePanier.innerHTML = listeHTML;

  const totalPrix = panier.reduce((acc, item) => acc + item.prix, 0);
  total.textContent = totalPrix;
}

// Supprimer un produit du panier
function supprimerDuPanier(id) {
  let panier = JSON.parse(localStorage.getItem("panier")) || [];
  panier = panier.filter(item => !(item.id === id && !item.type)); // Ne supprime que les produits standards
  localStorage.setItem("panier", JSON.stringify(panier));
  mettreAJourPanier();
}

// Supprimer un repas personnalisé du panier
function supprimerRepasPersonnalise(id) {
  let panier = JSON.parse(localStorage.getItem("panier")) || [];
  panier = panier.filter(item => !(item.id === id && item.type === "personnalise"));
  localStorage.setItem("panier", JSON.stringify(panier));
  mettreAJourPanier();
}

// Confirmer la commande (redirection WhatsApp)
function confirmerCommande() {
  const panier = JSON.parse(localStorage.getItem("panier")) || [];
  if (panier.length === 0) {
    afficherToast("Votre panier est vide !");
    return;
  }

  // Générer le message WhatsApp
  let message = "Bonjour GOODLUNCH 👋\nJe souhaite confirmer ma commande :\n\n";

  const produitsUniques = {};
  panier.forEach(item => {
    if (!item.type) { // Produits standards
      produitsUniques[item.id] = produitsUniques[item.id] ? {...item, quantite: produitsUniques[item.id].quantite + 1} : {...item, quantite: 1};
    }
  });

  // Ajouter les produits standards
  Object.values(produitsUniques).forEach(item => {
    message += `${item.nom} x${item.quantite}\n`;
  });

  // Ajouter les repas personnalisés
  const repasPersonnalises = panier.filter(item => item.type === "personnalise");
  repasPersonnalises.forEach(item => {
    message += `${item.nom} (${item.description}) x1\n`;
  });

  const totalPrix = panier.reduce((acc, item) => acc + item.prix, 0);
  message += `\nTotal : ${totalPrix} MAD\nMerci.`;

  const messageEncode = encodeURIComponent(message);
  window.open(`https://wa.me/212660329165?text=${messageEncode}`, "_blank");
}

// Afficher une notification toast
function afficherToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

// Ouvrir/Fermer le panier
function ouvrirPanier() {
  document.getElementById("panier-modal").style.display = "block";
}

function fermerPanier() {
  document.getElementById("panier-modal").style.display = "none";
}

// Prix de base pour un repas personnalisé
let prixBase = 35;

// Mettre à jour le résumé du repas personnalisé
function mettreAJourResume() {
  const base = document.querySelector('input[name="base"]:checked')?.value || "Aucune";
  const proteine = document.querySelector('input[name="proteine"]:checked')?.value || "Aucune";
  const accompagnements = Array.from(document.querySelectorAll('input[name="accompagnement"]:checked')).map(el => el.value);
  const sauce = document.querySelector('input[name="sauce"]:checked')?.value || "Aucune";

  const resumeElement = document.getElementById("resume-repas");
  const prixElement = document.getElementById("prix-total");

  // Calculer le prix total
  let prixTotal = prixBase;
  if (accompagnements.length > 0) prixTotal += accompagnements.length * 5;

  // Mettre à jour le résumé
  let resumeHTML = `
    <p><strong>Base :</strong> ${base}</p>
    <p><strong>Protéine :</strong> ${proteine}</p>
  `;

  if (accompagnements.length > 0) {
    resumeHTML += `<p><strong>Accompagnements :</strong> ${accompagnements.join(", ")}</p>`;
  }

  resumeHTML += `<p><strong>Sauce :</strong> ${sauce}</p>`;

  resumeElement.innerHTML = resumeHTML;
  prixElement.textContent = prixTotal;
}

// Ajouter un événement pour mettre à jour le résumé quand un choix change
document.querySelectorAll('input[name="base"], input[name="proteine"], input[name="accompagnement"], input[name="sauce"]').forEach(input => {
  input.addEventListener("change", mettreAJourResume);
});

// Ajouter le repas personnalisé au panier
function ajouterRepasConfig() {
  const base = document.querySelector('input[name="base"]:checked')?.value || "Aucune";
  const proteine = document.querySelector('input[name="proteine"]:checked')?.value || "Aucune";
  const accompagnements = Array.from(document.querySelectorAll('input[name="accompagnement"]:checked')).map(el => el.value);
  const sauce = document.querySelector('input[name="sauce"]:checked')?.value || "Aucune";
  const prixTotal = document.getElementById("prix-total").textContent;

  const repasPersonnalise = {
    id: Date.now(),
    nom: "Repas Personnalisé",
    description: `Base: ${base}, Protéine: ${proteine}, Accompagnements: ${accompagnements.join(", ") || "Aucun"}, Sauce: ${sauce}`,
    prix: parseInt(prixTotal),
    type: "personnalise"
  };

  // Ajouter au panier
  let panier = JSON.parse(localStorage.getItem("panier")) || [];
  panier.push(repasPersonnalise);
  localStorage.setItem("panier", JSON.stringify(panier));
  mettreAJourPanier();
  afficherToast("Repas personnalisé ajouté au panier !");
}

// Initialisation
document.addEventListener("DOMContentLoaded", () => {
  genererCartes();
  mettreAJourPanier();
  mettreAJourResume();
});
