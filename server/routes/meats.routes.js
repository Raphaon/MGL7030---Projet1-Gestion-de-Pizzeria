import express from "express";

const router = express.Router();

// stockage en mémoire 
let meats  =
 [
    { 
        id: 1, 
        name: "Pepperoni",
        prix:  3.00 
    },
    { 
        id: 2, 
        name: "Sausage",
        prix: 3.00
    },
    { id: 3, name: "Chicken", prix: 3.00 },
    { id: 4, name: "Beef", prix: 3.00 },
    { id: 5, name: "Bacon", prix: 3.00 },
    { id: 6, name: "Ham", prix: 3.00 }
];
// GET → liste des viandes
router.get("/", (req, res) => {
    res.json(meats);
});

// POST → ajouter une viande
router.post("/", (req, res) => {

    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: "Name is required" });
    }

    const meat = {
        id: Date.now(),
        name
    };

    meats.push(meat);

    res.status(201).json(meat);
});

//  DELETE → supprimer une viande
router.delete("/:id", (req, res) => {

    const id = parseInt(req.params.id);

    const index = meats.findIndex(m => m.id === id);

    if (index === -1) {
        return res.status(404).json({ error: "Not found" });
    }

    meats.splice(index, 1);

    res.json({ message: "Deleted" });
});

export default router;