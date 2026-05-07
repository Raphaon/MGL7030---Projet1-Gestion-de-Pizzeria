import express from "express";
import pool from "../../Config/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT
                id,
                nom,
                type,
                description,
                ingredients,
                image,
                prix_base::float AS prix_base
            FROM pizzas
            ORDER BY id
        `);
        res.json(rows);
    } catch (error) {
        console.error("Erreur GET /api/pizzas:", error);
        res.status(500).json({ error: "Impossible de charger le menu des pizzas." });
    }
});

export default router;
