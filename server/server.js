import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import meatsRoutes from "./routes/meats.routes.js";
import veggiesRoutes from "./routes/vegetables.routes.js";
import formatsRoutes from "./routes/formats.routes.js";
import commandsRoutes from "./routes/commands.routes.js";
import pizzasRoutes from "./routes/pizzas.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import usersRoutes from "./routes/users.routes.js";

const app = express();
const PORT = process.env.PORT || 4000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api",          adminRoutes);
app.use("/api/meats",    meatsRoutes);
app.use("/api/veggies",  veggiesRoutes);
app.use("/api/formats",  formatsRoutes);
app.use("/api/commands", commandsRoutes);
app.use("/api/pizzas",   pizzasRoutes);
app.use("/api/users",    usersRoutes);

app.use(express.static(path.join(__dirname, "../public")));

app.use((req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    if (req.path.includes("."))      return next();
    res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
