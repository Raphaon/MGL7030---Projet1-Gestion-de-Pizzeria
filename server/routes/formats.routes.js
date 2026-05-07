import express from "express";
import pool from "../../Config/db.js";
import { parseNonNegativeNumber, requiredText } from "../utils/validation.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const { rows } = await pool.query(
            "SELECT id, value, label, prix::float AS prix FROM formats ORDER BY id"
        );
        res.json(rows);
    } catch (error) {
        console.error("Erreur GET /api/formats:", error);
        res.status(500).json({ error: "Impossible de charger les formats." });
    }
});

router.post("/", async (req, res) => {
    const { value, label, prix } = req.body;
    const formatValue = requiredText(value).toLowerCase();
    const formatLabel = requiredText(label);
    const formatPrice = parseNonNegativeNumber(prix);

    if (!formatValue || !formatLabel || formatPrice === null) {
        return res.status(400).json({ error: "value, label et un prix valide sont requis." });
    }

    try {
        const { rows } = await pool.query(
            "INSERT INTO formats (value, label, prix) VALUES ($1, $2, $3) RETURNING id, value, label, prix::float AS prix",
            [formatValue, formatLabel, formatPrice]
        );
        res.status(201).json(rows[0]);
    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({ error: "Ce format existe deja." });
        }
        console.error("Erreur POST /api/formats:", error);
        res.status(500).json({ error: "Impossible d'ajouter le format." });
    }
});

router.delete("/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
        return res.status(400).json({ error: "Identifiant invalide." });
    }

    try {
        const { rowCount } = await pool.query("DELETE FROM formats WHERE id = $1", [id]);
        if (rowCount === 0) {
            return res.status(404).json({ error: "Format non trouve." });
        }
        res.json({ message: "Format supprime." });
    } catch (error) {
        console.error("Erreur DELETE /api/formats/:id:", error);
        res.status(500).json({ error: "Impossible de supprimer le format." });
    }
});

export default router;
