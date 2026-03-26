import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import meatsRoutes from "./routes/meats.routes.js";
import veggiesRoutes from  "./routes/vegetables.routes.js";

import commandsRoutes from "./routes/commands.routes.js";


const app = express();
const PORT = 3000;

// recréer __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);







//recevoir des donnees en JSON

app.use(express.json());

//ajoute des routes de viandes 
app.use("/api/meats", meatsRoutes);





//ajouter les routes des legumes 

app.use("/api/veggies", veggiesRoutes);



// Ajout de la route de commandes 

app.use("/api/commands", commandsRoutes);




//servir le frontend 


app.use(express.static(path.join(__dirname, "../public")));



// fallback intelligent
app.use((req, res, next) => {

    // elle permet de laisser passer l'API
    if (req.path.startsWith("/api")) {
        return next();
    }

    // laisser passer fichiers (js, css, etc.)
    if (req.path.includes(".")) {
        return next();
    }

    // sinon SPA
    res.sendFile(path.join(__dirname, "../public/index.html"));
});


// démarrer serveur
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});