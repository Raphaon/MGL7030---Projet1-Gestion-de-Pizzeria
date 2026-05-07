import bcrypt from "bcrypt";
import pool from "../Config/db.js";

const username = process.argv[2] || process.env.ADMIN_USERNAME || "admin";
const password = process.argv[3] || process.env.ADMIN_PASSWORD || "admin123";
const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10);

async function ensureAdminGroup(client) {
    const groupResult = await client.query(
        `INSERT INTO groups (name, label)
         VALUES ('admin', 'Administrateurs')
         ON CONFLICT (name) DO UPDATE SET label = EXCLUDED.label
         RETURNING id`
    );

    const permissionResult = await client.query(
        `INSERT INTO permissions (name, label)
         VALUES ('admin:gestion', 'Acceder a la section de gestion')
         ON CONFLICT (name) DO UPDATE SET label = EXCLUDED.label
         RETURNING id`
    );

    await client.query(
        `INSERT INTO group_permissions (group_id, permission_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [groupResult.rows[0].id, permissionResult.rows[0].id]
    );

    return groupResult.rows[0].id;
}

async function createAdmin() {
    if (!username || !password) {
        throw new Error("Un nom d'utilisateur et un mot de passe sont requis.");
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const passwordHash = await bcrypt.hash(password, saltRounds);
        const adminGroupId = await ensureAdminGroup(client);

        const userResult = await client.query(
            `INSERT INTO users (username, password_hash, is_active)
             VALUES ($1, $2, TRUE)
             ON CONFLICT (username)
             DO UPDATE SET password_hash = EXCLUDED.password_hash, is_active = TRUE
             RETURNING id, username`,
            [username, passwordHash]
        );

        const user = userResult.rows[0];

        await client.query(
            `INSERT INTO user_groups (user_id, group_id)
             VALUES ($1, $2)
             ON CONFLICT DO NOTHING`,
            [user.id, adminGroupId]
        );

        await client.query(
            `INSERT INTO admins (user_id)
             VALUES ($1)
             ON CONFLICT DO NOTHING`,
            [user.id]
        );

        await client.query("COMMIT");
        console.log(`Compte administrateur pret: ${user.username}`);
        console.log("Modele: users -> user_groups -> groups -> group_permissions -> permissions");

        if (!process.argv[3] && !process.env.ADMIN_PASSWORD) {
            console.log("Mot de passe par defaut: admin123");
        }
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

createAdmin()
    .catch((error) => {
        console.error("Erreur creation administrateur:", error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await pool.end();
    });
