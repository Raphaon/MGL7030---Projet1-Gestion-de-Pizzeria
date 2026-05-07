import fs from "fs";
import pool from "../Config/db.js";

async function applySchema() {
    const schema = fs.readFileSync("schema.sql", "utf8");
    await pool.query(schema);
    console.log("Schema PostgreSQL applique.");
}

applySchema()
    .catch((error) => {
        console.error("Erreur application schema:", error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await pool.end();
    });
