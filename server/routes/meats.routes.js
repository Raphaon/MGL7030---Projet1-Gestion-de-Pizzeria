import express from "express";
import pool from "../../Config/db.js";
import { parseNonNegativeNumber, requiredText } from "../utils/validation.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const { rows } = await pool.query(
            "SELECT id, name, prix::float AS prix FROM meats ORDER BY id"
        );
        res.json(rows);
    } catch (error) {
        console.error("Erreur GET /api/meats:", error);
        res.status(500).json({ error: "Impossible de charger les garnitures viande." });
    }
});

router.post("/", async (req, res) => {
    const { name, prix } = req.body;
    const meatName = requiredText(name);
    const meatPrice = parseNonNegativeNumber(prix);

    if (!meatName || meatPrice === null) {
        return res.status(400).json({ error: "Le nom de la viande et un prix valide sont requis." });
    }

    try {
        const { rows } = await pool.query(
            "INSERT INTO meats (name, prix) VALUES ($1, $2) RETURNING id, name, prix::float AS prix",
            [meatName, meatPrice]
        );
        res.status(201).json(rows[0]);
    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({ error: "Cette garniture viande existe deja." });
        }
        console.error("Erreur POST /api/meats:", error);
        res.status(500).json({ error: "Impossible d'ajouter la garniture viande." });
    }
});

router.delete("/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
        return res.status(400).json({ error: "Identifiant invalide." });
    }

    try {
        const { rowCount } = await pool.query("DELETE FROM meats WHERE id = $1", [id]);
        if (rowCount === 0) {
            return res.status(404).json({ error: "Garniture viande non trouvee." });
        }
        res.json({ message: "Suppression reussie." });
    } catch (error) {
        console.error("Erreur DELETE /api/meats/:id:", error);
        res.status(500).json({ error: "Impossible de supprimer la garniture viande." });
    }
});

export default router;
