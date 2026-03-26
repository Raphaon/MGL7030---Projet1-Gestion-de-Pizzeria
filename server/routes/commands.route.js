import express from "express";

const router = express.Router();

const commands  = [{
    id:1,
    items:"Pizza",
    garniture:"Viande", 
    format:"Grand",
    unitPrice: 10, 
    quantity:2,
    clientID :"Cl0001"
}, 

{
    id:2,
    items:"Pizza",
    garniture:"legume", 
    format:"Petie",
    unitPrice: 100, 
    quantity:4,
    clientID :"Cl0002"
}
]


router.get("/", (req, res)=>{
    res.json(commands);
}); 


router.post("/", (req, res)=>{

    if(!req){
        res.status(400).json({error:"votre commande est vide "});
    }
    if(req.body.items =="" || req.body.format =="" || req.body.quantity ==0){
         res.status(400).json({error:"le nom de l'item, le format ou la quantite ne peuvent pas etre vides  !!!"});   
    }

    const newCommand = {
        id:Date.now(),
        items:req.body.items,
        garniture:req.body.garniture, 
        format:req.body.format,
        unitPrice: req.body.unitPrice, 
        quantity:req.body.quantity,
        clientID :req.body.clientID
    }


    commands.push(newCommand);

    res.status(200).json(commands);



});


router.delete("/:id", (req,  res)=>{
    const id = req.params.id;
    const index = commands.findIndex(c=> c.id===id);

    if(index ===-1){
        res.status(400).json({message:"Commande non trouvees"});
    }

    commands.splice(index, 1);

    res.status(200).json({message:"Suppression effectuee avec sucess !"})


} );



export default router 
