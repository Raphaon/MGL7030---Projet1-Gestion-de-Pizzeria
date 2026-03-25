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





export default router;

