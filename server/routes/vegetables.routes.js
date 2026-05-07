import express from "express";
import pool from "../../Config/db.js";
import { parseNonNegativeNumber, requiredText } from "../utils/validation.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const { rows } = await pool.query(
            "SELECT id, name, prix::float AS prix FROM vegetables ORDER BY id"
        );
        res.json(rows);
    } catch (error) {
        console.error("Erreur GET /api/veggies:", error);
        res.status(500).json({ error: "Impossible de charger les garnitures legumes." });
    }
});

router.post("/", async (req, res) => {
    const { name, prix } = req.body;
    const vegetableName = requiredText(name);
    const vegetablePrice = parseNonNegativeNumber(prix);

    if (!vegetableName || vegetablePrice === null) {
        return res.status(400).json({ error: "Le nom et un prix valide sont obligatoires." });
    }

    try {
        const { rows } = await pool.query(
            "INSERT INTO vegetables (name, prix) VALUES ($1, $2) RETURNING id, name, prix::float AS prix",
            [vegetableName, vegetablePrice]
        );
        res.status(201).json(rows[0]);
    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({ error: "Cette garniture legume existe deja." });
        }
        console.error("Erreur POST /api/veggies:", error);
        res.status(500).json({ error: "Impossible d'ajouter la garniture legume." });
    }
});

router.delete("/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
        return res.status(400).json({ error: "Identifiant invalide." });
    }

    try {
        const { rowCount } = await pool.query("DELETE FROM vegetables WHERE id = $1", [id]);
        if (rowCount === 0) {
            return res.status(404).json({ error: "Legume non trouve." });
        }
        res.status(200).json({ message: "Suppression effectuee." });
    } catch (error) {
        console.error("Erreur DELETE /api/veggies/:id:", error);
        res.status(500).json({ error: "Impossible de supprimer la garniture legume." });
    }
});

export default router;
