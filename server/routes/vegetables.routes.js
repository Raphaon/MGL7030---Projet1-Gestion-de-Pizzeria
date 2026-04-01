import { error } from "console";
import express from "express"; 

const router = express.Router();


var veggies = [
    { id: 1, name: "Mushrooms",  prix:1.00},
    { id: 2, name: "Onions", prix:1.00},
    { id: 3, name: "Green Peppers" ,prix:1.00},
    { id: 4, name: "Black Olives",prix:1.00 },
    { id: 5, name: "Tomatoes",prix:1.00 },
    { id: 6, name: "Spinach",prix:1.00 }
];


// recuper la liste des  legumes 

router.get("/", (req, res)=>{
    res.json(veggies);
});


// ajouter des legumes 
router.post("/", (req, res)=>{

    if(!req){
        res.status(400).json({error:"Veuillez definier le legume a ajouter !"});
    }
    if(req.body.name =="" || req.body.prix ==""){
        res.status(400).json({error:"Le nom et le prix sont des elements obligatoires"})
    }   
        
    const newVeggie = {
        id:Date.now(),
        name: req.body.name, 
        prix: req.body.prix
    };

    //ajout dans le tableau 

    veggies.push(newVeggie);

    res.json(veggies);

});


//Supprimer un legume precis 


router.delete("/:id", (req, res)=>{
    const id = parseInt(req.params.id); 

    const index = veggies.findIndex(m => m.id===id);

    if(index === -1){
        res.status(400).json({message:"Elements non retrouves !! "});
    }
    
    veggies.splice(index, 1);
    res.status(200).json({message:"Suppression effectuer avec success : "});


});



export default router;

