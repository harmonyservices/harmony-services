

Capture d’écran 2026-08-16 à 23.34.30.png
ou changer le code deja 

Capture d’écran 2026-08-16 à 23.37.38.png
et la ??? 

Capture d’écran 2026-08-16 à 23.38.14.png
ca marchait avant

Capture d’écran 2026-08-16 à 23.40.17.png
ou ??? 


Texte collé.txt
Document
je veux pouvoir ajouter mes logements 

Oui. Dans ton code actuel, l’onglet Logements ne contient pas une vraie liste de logements : il reconstruit les logements uniquement à partir des prestations déjà enregistrées. 


Donc si tu veux ajouter tes logements indépendamment, il faut créer une petite base properties enregistrée dans le navigateur, puis un bouton « + Ajouter un logement » dans l’onglet Logements.

Le plus simple : je peux te préparer la modification exacte pour que tu puisses ajouter un logement avec Nom + Adresse, le modifier et le supprimer, et ensuite choisir ce logement quand tu crées une prestation.

Tu n’auras pas besoin de tout refaire : on modifiera seulement quelques parties de ton app.js. Ton système d’enregistrement actuel utilise déjà localStorage, donc on peut garder exactement le même principe. 


Première étape : dans GitHub, ouvre app.js. Je peux maintenant te donner le premier petit bloc à ajouter, puis on fait la suite morceau par morceau pour éviter les erreurs.


dis moi 

Oui. On va faire le plus simple possible, sans toucher à toute l’application.

1. Dans app.js, juste après cette fonction :
function saveLocal() {
  localStorage.setItem("harmony_simple", JSON.stringify(tasks));
}
ajoute ceci :

var properties = [];

try {
  properties = JSON.parse(localStorage.getItem("harmony_properties")) || [];
} catch (e) {
  properties = [];
}

function saveProperties() {
  localStorage.setItem("harmony_properties", JSON.stringify(properties));
}

function addProperty() {
  var name = prompt("Nom du logement :");

  if (!name || !name.trim()) return;

  var address = prompt("Adresse du logement :") || "";

  properties.push({
    name: name.trim(),
    address: address.trim()
  });

  saveProperties();
  renderProperties();
}

function deleteProperty(index) {
  if (confirm("Supprimer ce logement ?")) {
    properties.splice(index, 1);
    saveProperties();
    renderProperties();
  }
}
2. Ensuite retrouve cette partie :
function renderProperties() {
Elle est vers la ligne 307 dans ton fichier. 


Supprime toute la fonction renderProperties() actuelle et remplace-la par :

function renderProperties() {
  var html =
    '<button class="action primary" onclick="addProperty()" style="margin-bottom:20px;">+ Ajouter un logement</button>';

  properties.forEach(function(p, index) {
    html +=
      '<div class="card propertyCard">' +
        '<div class="houseIcon">⌂</div>' +
        '<div style="flex:1">' +
          '<div class="property">' + p.name + '</div>' +
          '<div class="address">📍 ' + (p.address || "") + '</div>' +
        '</div>' +

        '<button class="action" onclick="deleteProperty(' + index + ')">' +
          'Supprimer' +
        '</button>' +
      '</div>';
  });

  if (properties.length === 0) {
    html += '<div class="empty">Aucun logement enregistré.</div>';
  }

  document.getElementById("propertyList").innerHTML = html;
}
3. Dernière petite modification
Vers le bas de ton fichier tu as actuellement :

document.getElementById("statProperties").textContent =
  new Set(tasks.map(function(t) {
    return t.property;
  })).size;


Remplace simplement tout ça par :

document.getElementById("statProperties").textContent =
  properties.length;
Après ça, quand tu vas dans Logements, tu auras :

+ Ajouter un logement

Tu cliques → tu écris par exemple « Appartement Marina » → son adresse → il reste enregistré même quand tu fermes la page.

Ensuite on pourra faire la partie importante : quand tu ajoutes un ménage au planning, tu choisiras le logement dans une liste au lieu de retaper son nom.


refait moi tout le code plus simple 

Oui. Pour éviter de modifier des petits morceaux partout, le plus simple est de remplacer entièrement ton app.js par une version propre et plus courte.

Elle garde ton planning, calendrier, équipe, linge et ajoute une vraie liste de logements indépendante des prestations. Actuellement, tes logements sont seulement reconstruits à partir des prestations, ce qui est justement le problème. 


Dans GitHub : ouvre app.js → sélectionne tout → supprime → colle tout ce code :

/* =========================
      el.classList.toggle(
        "hidden",
        name !== page
      );
    }
  });

  document.querySelectorAll(".nav")
    .forEach(function(nav) {
      nav.classList.remove("active");
    });

  if (button) {
    button.classList.add("active");
  }

  var fab = document.getElementById("fab");

  if (fab) {
    fab.classList.toggle(
      "hidden",
      page !== "planning" &&
      page !== "calendar"
    );
  }

  if (page === "calendar") renderCalendar();
  if (page === "properties") renderProperties();
  if (page === "team") renderTeam();
  if (page === "linen") renderLinen();
}


/* =========================
   FILTRES
========================= */

function setFilter(filter) {

  currentFilter = filter;

  document.querySelectorAll(".filter")
    .forEach(function(btn) {

      btn.classList.toggle(
        "active",
        btn.getAttribute("data-filter") === filter
      );
    });

  renderPlanning();
}


/* =========================
   PLANNING
========================= */

function renderPlanning() {

  var list = tasks.slice();

  list.sort(function(a, b) {
    return (a.date + a.time)
      .localeCompare(b.date + b.time);
  });


  if (currentFilter === "today") {

    list = list.filter(function(t) {
      return t.date === todayISO();


