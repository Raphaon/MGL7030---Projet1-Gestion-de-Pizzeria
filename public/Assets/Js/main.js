import { Pizza } from "./Models/Pizza.js";

var pepperoni = new Pizza(1, "Petite", 30, "Pepperoni - Sauce tomate - formage"),
    veggie    = new Pizza(3, "Grande", 50, "Légumes grillés - Sauce tomate - formage");

// prix des différents constituants d'une pizza
const PRIX = {
    format: {
        petite: 8,
        moyenne: 12,
        grande: 15
    },
    viande: 3,
    legume: 1
};

const API = {
    meats:   "/api/meats",
    veggies: "/api/veggies",
};


function httpGet(url, callback) {
    fetch(url).then(function(response) {

        var req = {
            url: url
        };

        var res = {
            status: response.status,
            ok:     response.ok,
            json:   function() {
                return response.json();
            }
        };

        callback(req, res);
    });
}


export async function chargerGarnitures() {

    var btnCommand  = document.getElementById('orderBtn'),
        message     = "Veuillez sélectionner une garniture et un format et des legumes",
        commadItems = document.querySelector("tbody[class=command-item]"),
        nbreline    = 0;

    commadItems.innerHTML = "Aucune Entree dans votre commande";
    let totalCommande = 0;

    // appel GET /api/meats 
    httpGet(API.meats, function(req, res) {

        if (!res.ok) {
            console.warn("Erreur GET meats:", res.status);
            return;
        }

        res.json().then(function(meats) {

            // appel GET /api/veggies 
            httpGet(API.veggies, function(req, res) {

                if (!res.ok) {
                    console.warn("Erreur GET veggies :", res.status);
                    return;
                }

                res.json().then(function(veggies) {

                    // injecter les lignes dans le tableau des garnitures
                    injecterTableauGarnitures(meats, veggies);

                    // injecter les prix dans le menu latéral
                    injecterMenuLateral();
                });
            });
        });
    });

    btnCommand.addEventListener('click', function() {

        if(document.querySelector("input[name='format']:checked")  && 
        document.querySelector("input[name='garniture']:checked"))
        {
            let format    = document.querySelector("input[name='format']:checked").value,
                garniture = document.querySelector("input[name='garniture']:checked").value,
                legumes   = [...document.querySelectorAll("input[name='legume']:checked")].map(leg => leg.value);   

            console.log(format, garniture, legumes);

            // defini l'identifier d'une line de commande 
            if(nbreline == 0){
                    commadItems.innerHTML ="";
            }

            let commandDate = getDateNow();
            let prix = calculerPrix(format, legumes.length);
            totalCommande += prix;

            if(commadItems.innerHTML += "<tr id="+ nbreline +" ><td>"+ commandDate  +"</td>"+
                                    "<td> "+ format + "</td>" +
                                    "<td> Pizza " + garniture +" </td>"+
                                    "<td> "+  legumes + "</td>"+
                                    "<td><input type='hidden' id='prix_ligne_"+ nbreline +"' name='prix_ligne' value='"+ prix +"'> " + prix + " $</td>"+
                                    
                                    "<td>" +
                                    "<div class='btn-delete'>" +
                                            "<input type='button' value='Supprimer' id='deleteBtn"+ nbreline +"'>"+
                                        "</div>"+
                                    "</td>"+
                                "</tr>")
                                {
                                     nbreline++;
                                     message = "Commande ajoutée avec succès";
                                }

            document.getElementById("totalPrix").textContent = totalCommande + " $";
        
            message = "Commande ajoutée avec succès";
        }
            
        alert(message);
    });

    document.addEventListener("click", function(event) {    
        if (event.target.id.startsWith("deleteBtn")) {
            let id = event.target.id;
            let row = document.getElementById(id.replace("deleteBtn", ""));
                let prix_ligne = document.getElementById("prix_ligne_" + id.replace("deleteBtn", "")).value;
                totalCommande -= parseFloat(prix_ligne);
                document.getElementById("totalPrix").textContent = totalCommande + " $";
            if(confirm("Voulez-vous vraiment supprimer cette commande ?")){ 
                 row.remove();
                    nbreline--;
                    console.log(nbreline);
                 if(nbreline == 0){
                    commadItems.innerHTML = "Aucune Entree dans votre commande";
                 }
            }
        }
    });
}

function injecterTableauGarnitures(meats, veggies) {
    const table = document.querySelector(".table-garniture");
    if (!table) return;

    const headerRow = table.querySelector("tr:first-child");
    table.innerHTML = "";
    if (headerRow) table.appendChild(headerRow);

    const maxRows = Math.max(meats.length, veggies.length);

    for (let i = 0; i < maxRows; i++) {
        const meat   = meats[i];
        const veggie = veggies[i];

        const meatCell = meat
            ? `<td>
                 <input type="radio" name="garniture" id="meat-${meat.id}" value="${meat.name}">
                 <label for="meat-${meat.id}">${meat.name}</label>
               </td>`
            : `<td></td>`;

        const veggieCell = veggie
            ? `<td>
                 <input type="checkbox" name="legume" id="veg-${veggie.id}" value="${veggie.name}">
                 <label for="veg-${veggie.id}">${veggie.name}</label>
               </td>`
            : `<td></td>`;

        table.insertAdjacentHTML("beforeend", `<tr>${meatCell}${veggieCell}</tr>`);
    }
}

// remplace les li de .menu-items
function injecterMenuLateral() {
    const ul = document.querySelector(".menu-items");
    if (!ul) return;

    const items = [
        { label: "Petite pizza",      prix: PRIX.format.petite  },
        { label: "Moyenne pizza",     prix: PRIX.format.moyenne },
        { label: "Grande pizza",      prix: PRIX.format.grande  },
        { label: "Garniture viande",  prix: PRIX.viande         },
        { label: "Garniture légumes", prix: PRIX.legume         },
    ];

    ul.innerHTML = items
        .map(({ label, prix }) =>
            `<li><a>${label} … ${prix.toFixed(2)} $</a></li>`
        )
        .join("");
}

// fonction pour calculer le prix
function calculerPrix(format, legumesCount) {
    return PRIX.format[format] +
           PRIX.viande +
           (legumesCount * PRIX.legume);
}

function getDateNow(){
    const timestamp = Date.now();
    const formateur = new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit' 
    });
    const dateFormatee = formateur.format(timestamp).replace(/\//g, '-');

    return dateFormatee;
}