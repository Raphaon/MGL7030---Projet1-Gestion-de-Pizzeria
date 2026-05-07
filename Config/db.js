import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Pool } from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function loadEnvFile() {
    const envPath = path.resolve(__dirname, "../.env");
    if (!fs.existsSync(envPath)) return;

    const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;

        const [key, ...valueParts] = trimmed.split("=");
        if (!process.env[key]) {
            process.env[key] = valueParts.join("=").trim();
        }
    }
}

loadEnvFile();

const pool = new Pool({
    user: process.env.DB_USER || "postgres",
    host: process.env.DB_HOST || "localhost",
    database: process.env.DB_NAME || "pizzeria",
    password: process.env.DB_PASSWORD || "",
    port: Number(process.env.DB_PORT || 5432)
});

export default pool;
