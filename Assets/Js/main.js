import { Pizza } from "./Models/Pizza.js";
import { DBgarnitures } from "../../DB/garniture.js";
    



var garnitureList = DBgarnitures;



var pepperoni = new Pizza(1, "Petite", 30, "Pepperoni - Sauce tomate - formage"),
    veggie = new Pizza(3, "Grande", 50, "Légumes grillés - Sauce tomate - formage");

btnCommand = document.getElementById('orderBtn'),
message = "Veuillez sélectionner une garniture et un format et des legumes",
commadItems = document.querySelector("tbody[class=command-item]"),
nbreline = 0;
commadItems.innerHTML = "Aucune Entree dans votre commande";
let totalCommande = 0;

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

btnCommand.addEventListener('click', function()
 {

    //Quand on clique sur lbtn commander voici  ce qui s'excute 

    if(document.querySelector("input[name='format']:checked")  && 
    document.querySelector("input[name='garniture']:checked"))
    {
        let format = document.querySelector("input[name='format']:checked").value,
        garniture = document.querySelector("input[name='garniture']:checked").value,
        legumes = [...document.querySelectorAll("input[name='legume']:checked")].map(leg => leg.value);    

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

// fonction pour calculer le prix

function calculerPrix(format, legumesCount) {
    return PRIX.format[format] +
           PRIX.viande +
           (legumesCount * PRIX.legume);
}












