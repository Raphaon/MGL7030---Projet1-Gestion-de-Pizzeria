
btnCommand = document.getElementById('orderBtn');
message = "Veuillez sélectionner une garniture et un format et des legumes";
commadItems = document.querySelector("tbody[class=command-item]");
nbreline = 0;
commadItems.innerHTML = "Aucune Entree dans votre commande";


btnCommand.addEventListener('click', function()
 {

    //Quand on clique sur lbtn commander voici  ce qui s'excute 

    if(document.querySelector("input[name='format']:checked")  && 
    document.querySelector("input[name='garniture']:checked"))
    {
        format = document.querySelector("input[name='format']:checked").value; 
        garniture = document.querySelector("input[name='garniture']:checked").value;

        legumes = [...document.querySelectorAll("input[name='legume']:checked")].map(leg => leg.value)

        // defini l'identifier d'une line de commande 
        if(nbreline == 0){
                commadItems.innerHTML ="";
        }


        let commandDate = getDateNow();


        if(commadItems.innerHTML += "<tr id="+ nbreline +" ><td>"+ commandDate  +"</td>"+
                                "<td> "+ format + "</td>" +
                                "<td> Pizza " + garniture +" </td>"+
                                "<td> "+  legumes + "</td>"+
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
        if(confirm("Voulez-vous vraiment supprimer cette commande ?")){ 
             row.remove();
        }
       
    }
});