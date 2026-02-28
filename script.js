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
    produitsUniques[item.id] = produitsUniques[item.id] ? {...item, quantite: produitsUniques[item.id].quantite + 1} : {...item, quantite: 1};
  });

  listePanier.innerHTML = Object.values(produitsUniques).map(item => `
    <div class="item-panier">
      <div>
        <h4>${item.nom} x${item.quantite}</h4>
        <p>${item.prix * item.quantite} MAD</p>
      </div>
      <button onclick="supprimerDuPanier(${item.id})">❌</button>
    </div>
  `).join("");

  const totalPrix = panier.reduce((acc, item) => acc + item.prix, 0);
  total.textContent = totalPrix;
}

// Supprimer un produit du panier
function supprimerDuPanier(id) {
  let panier = JSON.parse(localStorage.getItem("panier")) || [];
  panier = panier.filter(item => item.id !== id);
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

  const produitsUniques = {};
  panier.forEach(item => {
    produitsUniques[item.id] = produitsUniques[item.id] ? {...item, quantite: produitsUniques[item.id].quantite + 1} : {...item, quantite: 1};
  });

  const message = encodeURIComponent(
    `Bonjour GOODLUNCH \nJe souhaite confirmer ma commande :\n\n${
      Object.values(produitsUniques).map(item => `${item.nom} x${item.quantite}`).join("\n")
    }\nTotal : ${panier.reduce((acc, item) => acc + item.prix, 0)} MAD\nMerci.`
  );

  window.open(`https://wa.me/212660329165?text=${message}`, "_blank");
  localStorage.removeItem("panier");
  mettreAJourPanier();
  afficherToast("Commande confirmée ! Redirection vers WhatsApp...");
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

// Initialisation
document.addEventListener("DOMContentLoaded", () => {
  genererCartes();
  mettreAJourPanier();
  document.querySelector(".panier").addEventListener("click", (e) => {
    e.preventDefault();
    ouvrirPanier();
  });
});
