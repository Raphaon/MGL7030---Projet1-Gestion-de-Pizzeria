import fs from "fs";
import { Client } from "pg";

function readEnv() {
    return Object.fromEntries(
        fs.readFileSync(".env", "utf8")
            .split(/\r?\n/)
            .filter((line) => line.trim() && !line.trim().startsWith("#") && line.includes("="))
            .map((line) => {
                const index = line.indexOf("=");
                return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
            })
    );
}

function quoteIdentifier(identifier) {
    if (!/^[A-Za-z0-9_]+$/.test(identifier)) {
        throw new Error("Le nom de la base doit contenir seulement lettres, chiffres et _.");
    }
    return `"${identifier}"`;
}

async function ensureDatabase() {
    const env = readEnv();
    const dbName = env.DB_NAME;

    if (!dbName) {
        throw new Error("DB_NAME est manquant dans .env.");
    }

    const client = new Client({
        user: env.DB_USER,
        host: env.DB_HOST,
        database: env.DB_MAINTENANCE_NAME || "postgres",
        password: env.DB_PASSWORD,
        port: Number(env.DB_PORT || 5432)
    });

    await client.connect();

    const exists = await client.query(
        "SELECT 1 FROM pg_database WHERE datname = $1",
        [dbName]
    );

    if (exists.rowCount === 0) {
        await client.query(`CREATE DATABASE ${quoteIdentifier(dbName)}`);
        console.log("Base de donnees creee.");
    } else {
        console.log("Base de donnees deja existante.");
    }

    await client.end();
}

ensureDatabase().catch((error) => {
    console.error("Erreur initialisation DB:", error.message);
    process.exitCode = 1;
});
