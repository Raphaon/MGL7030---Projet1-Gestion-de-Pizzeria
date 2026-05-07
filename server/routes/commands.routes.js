import express from "express";
import pool from "../../Config/db.js";
import { optionalText, parseNonNegativeNumber, requiredText } from "../utils/validation.js";

const router = express.Router();

const mapCommandRow = (row) => ({
    id: row.id,
    items: row.items,
    garniture: row.garniture,
    format: row.format,
    unitPrice: Number(row.unit_price || 0),
    quantity: Number(row.quantity || 0),
    clientID: row.client_id || "",
    legumes: row.legumes || [],
    createdAt: row.created_at
});

router.get("/", async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT
                c.id,
                c.items,
                c.garniture,
                c.format,
                c.unit_price,
                c.quantity,
                c.client_id,
                c.created_at,
                COALESCE(
                    array_agg(cv.vegetable_name ORDER BY cv.vegetable_name)
                        FILTER (WHERE cv.vegetable_name IS NOT NULL),
                    ARRAY[]::text[]
                ) AS legumes
            FROM commands c
            LEFT JOIN command_vegetables cv ON cv.command_id = c.id
            GROUP BY c.id
            ORDER BY c.id
        `);

        res.json(rows.map(mapCommandRow));
    } catch (error) {
        console.error("Erreur GET /api/commands:", error);
        res.status(500).json({ error: "Impossible de charger les commandes." });
    }
});

router.post("/", async (req, res) => {
    const { items, format, quantity, garniture, unitPrice, clientID } = req.body;
    const itemName = requiredText(items);
    const formatValue = requiredText(format);
    const parsedQuantity = Number(quantity);
    const parsedUnitPrice = parseNonNegativeNumber(unitPrice || 0);

    if (!itemName || !formatValue || !Number.isInteger(parsedQuantity) || parsedQuantity <= 0 || parsedUnitPrice === null) {
        return res.status(400).json({
            error: "Le nom de l'item, le format, le prix et la quantite sont obligatoires et doivent etre valides."
        });
    }

    const legumes = Array.isArray(req.body.legumes)
        ? req.body.legumes.map(optionalText).filter(Boolean)
        : [];
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const { rows } = await client.query(
            `INSERT INTO commands (items, garniture, format, unit_price, quantity, client_id)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id, items, garniture, format, unit_price, quantity, client_id, created_at`,
            [
                itemName,
                optionalText(garniture),
                formatValue,
                parsedUnitPrice,
                parsedQuantity,
                optionalText(clientID)
            ]
        );

        for (const legume of legumes) {
            if (!legume) continue;
            await client.query(
                "INSERT INTO command_vegetables (command_id, vegetable_name) VALUES ($1, $2)",
                [rows[0].id, String(legume).trim()]
            );
        }

        await client.query("COMMIT");
        res.status(201).json(mapCommandRow({ ...rows[0], legumes }));
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Erreur POST /api/commands:", error);
        res.status(500).json({ error: "Impossible d'ajouter la commande." });
    } finally {
        client.release();
    }
});

router.delete("/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
        return res.status(400).json({ error: "Identifiant invalide." });
    }

    try {
        const { rowCount } = await pool.query("DELETE FROM commands WHERE id = $1", [id]);
        if (rowCount === 0) {
            return res.status(404).json({ error: "Commande non trouvee." });
        }
        res.status(200).json({ message: "Suppression effectuee avec succes." });
    } catch (error) {
        console.error("Erreur DELETE /api/commands/:id:", error);
        res.status(500).json({ error: "Impossible de supprimer la commande." });
    }
});

export default router;
