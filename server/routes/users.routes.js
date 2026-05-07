import express from "express";
import pool from "../../Config/db.js";

const router = express.Router();

router.get("/model", async (req, res) => {
    try {
        const [users, groups, permissions, userGroups, groupPermissions, admins] = await Promise.all([
            pool.query("SELECT id, username, is_active, created_at FROM users ORDER BY id"),
            pool.query("SELECT id, name, label FROM groups ORDER BY id"),
            pool.query("SELECT id, name, label FROM permissions ORDER BY id"),
            pool.query(`
                SELECT u.username, g.name AS group_name
                FROM user_groups ug
                JOIN users u ON u.id = ug.user_id
                JOIN groups g ON g.id = ug.group_id
                ORDER BY u.username, g.name
            `),
            pool.query(`
                SELECT g.name AS group_name, p.name AS permission_name
                FROM group_permissions gp
                JOIN groups g ON g.id = gp.group_id
                JOIN permissions p ON p.id = gp.permission_id
                ORDER BY g.name, p.name
            `),
            pool.query(`
                SELECT u.id, u.username, a.created_at
                FROM admins a
                JOIN users u ON u.id = a.user_id
                ORDER BY u.id
            `)
        ]);

        res.json({
            users: users.rows,
            groups: groups.rows,
            permissions: permissions.rows,
            userGroups: userGroups.rows,
            groupPermissions: groupPermissions.rows,
            admins: admins.rows
        });
    } catch (error) {
        console.error("Erreur GET /api/users/model:", error);
        res.status(500).json({ error: "Impossible de charger le modele utilisateurs." });
    }
});

export default router;
