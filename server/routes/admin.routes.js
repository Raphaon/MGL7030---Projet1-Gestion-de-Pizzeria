import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../../Config/db.js";
import { escapeHtml, parseNonNegativeNumber, requiredText } from "../utils/validation.js";

const router = express.Router();
const COOKIE_NAME = "pizzeria_admin";

function loginPage(message = "") {
    const error = message
        ? `<p class="message error">${message}</p>`
        : "";

    return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Connexion administrateur</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; min-height: 100vh; display: grid; place-items: center; background: #f7f3ef; color: #2b2118; }
        main { width: min(420px, calc(100% - 32px)); background: #fff; border: 1px solid #eaded2; padding: 32px; box-shadow: 0 10px 24px rgba(0,0,0,.08); }
        h1 { margin: 0 0 20px; font-size: 1.55rem; }
        label { display: block; margin-top: 14px; font-weight: 700; }
        input { width: 100%; box-sizing: border-box; margin-top: 6px; padding: 11px; border: 1px solid #cdbfb1; font-size: 1rem; }
        button { width: 100%; margin-top: 22px; padding: 12px; border: 0; background: #b91c1c; color: #fff; font-weight: 700; cursor: pointer; }
        a { display: inline-block; margin-top: 16px; color: #8b1a1a; }
        .message { padding: 10px 12px; margin: 0 0 16px; }
        .error { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
    </style>
</head>
<body>
    <main>
        <h1>Administration</h1>
        ${error}
        <form method="POST" action="/api/login">
            <label for="username">Nom d'utilisateur</label>
            <input id="username" name="username" autocomplete="username" required>

            <label for="password">Mot de passe</label>
            <input id="password" name="password" type="password" autocomplete="current-password" required>

            <button type="submit">Se connecter</button>
        </form>
        <a href="/">Retour a l'application</a>
    </main>
</body>
</html>`;
}

function gestionPage({ vegetables = [], message = "", error = "" } = {}) {
    const rows = vegetables.length
        ? vegetables.map((vegetable) => `
            <tr>
                <td>${vegetable.id}</td>
                <td>${escapeHtml(vegetable.name)}</td>
                <td>${Number(vegetable.prix).toFixed(2)} $</td>
            </tr>
        `).join("")
        : `<tr><td colspan="3">Aucune garniture legume.</td></tr>`;

    return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestion des garnitures</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; background: #f7f3ef; color: #2b2118; }
        header, main { width: min(900px, calc(100% - 32px)); margin: 0 auto; }
        header { padding: 28px 0 10px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
        h1 { margin: 0; font-size: 1.6rem; }
        section { background: #fff; border: 1px solid #eaded2; padding: 24px; margin: 18px 0; box-shadow: 0 8px 20px rgba(0,0,0,.06); }
        label { display: block; margin-top: 14px; font-weight: 700; }
        input { width: 100%; max-width: 360px; box-sizing: border-box; margin-top: 6px; padding: 10px; border: 1px solid #cdbfb1; font-size: 1rem; }
        button, .button { display: inline-block; margin-top: 18px; padding: 11px 16px; border: 0; background: #b91c1c; color: #fff; font-weight: 700; text-decoration: none; cursor: pointer; }
        .secondary { background: #5f5148; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th, td { border-bottom: 1px solid #eaded2; padding: 10px; text-align: left; }
        .success { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; padding: 10px 12px; }
        .error { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; padding: 10px 12px; }
    </style>
</head>
<body>
    <header>
        <h1>Gestion des garnitures legumes</h1>
        <nav>
            <a class="button secondary" href="/">Application</a>
            <a class="button" href="/api/logout">Deconnexion</a>
        </nav>
    </header>
    <main>
        <section>
            ${message ? `<p class="success">${message}</p>` : ""}
            ${error ? `<p class="error">${error}</p>` : ""}
            <form method="POST" action="/api/gestion">
                <label for="name">Nom de la garniture legume</label>
                <input id="name" name="name" required>

                <label for="prix">Prix</label>
                <input id="prix" name="prix" type="number" min="0" step="0.01" value="1.00" required>

                <button type="submit">Ajouter</button>
            </form>
        </section>
        <section>
            <h2>Legumes disponibles</h2>
            <table>
                <thead><tr><th>#</th><th>Nom</th><th>Prix</th></tr></thead>
                <tbody>${rows}</tbody>
            </table>
        </section>
    </main>
</body>
</html>`;
}

function getCookie(req, name) {
    const header = req.headers.cookie || "";
    const cookies = header.split(";").map((cookie) => cookie.trim());
    const match = cookies.find((cookie) => cookie.startsWith(`${name}=`));
    return match ? decodeURIComponent(match.slice(name.length + 1)) : "";
}

function requireAdmin(req, res, next) {
    const token = getCookie(req, COOKIE_NAME);
    if (!token) return res.redirect("/api/login");

    try {
        req.admin = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
        next();
    } catch {
        res.clearCookie(COOKIE_NAME);
        res.redirect("/api/login");
    }
}

async function listVegetables() {
    const { rows } = await pool.query(
        "SELECT id, name, prix::float AS prix FROM vegetables ORDER BY id"
    );
    return rows;
}

async function findUserForLogin(username) {
    const { rows } = await pool.query(
        `SELECT
            u.id,
            u.username,
            u.password_hash,
            u.is_active,
            COALESCE(array_agg(DISTINCT p.name) FILTER (WHERE p.name IS NOT NULL), ARRAY[]::text[]) AS permissions
         FROM users u
         LEFT JOIN user_groups ug ON ug.user_id = u.id
         LEFT JOIN groups g ON g.id = ug.group_id
         LEFT JOIN group_permissions gp ON gp.group_id = g.id
         LEFT JOIN permissions p ON p.id = gp.permission_id
         WHERE u.username = $1
         GROUP BY u.id`,
        [username]
    );

    return rows[0];
}

router.get("/login", (req, res) => {
    res.type("html").send(loginPage());
});

router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(401).type("html").send(loginPage("Nom d'utilisateur et mot de passe requis."));
    }

    try {
        const user = await findUserForLogin(username.trim());
        const validPassword = user
            ? await bcrypt.compare(password, user.password_hash)
            : false;

        if (!validPassword || !user.is_active || !user.permissions.includes("admin:gestion")) {
            return res.status(401).type("html").send(loginPage("Nom d'utilisateur ou mot de passe incorrect."));
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, permissions: user.permissions },
            process.env.JWT_SECRET || "dev-secret",
            { expiresIn: "2h" }
        );

        res.cookie(COOKIE_NAME, token, {
            httpOnly: true,
            sameSite: "lax",
            maxAge: 2 * 60 * 60 * 1000
        });
        res.redirect("/api/gestion");
    } catch (error) {
        console.error("Erreur POST /api/login:", error);
        res.status(500).type("html").send(loginPage("Erreur serveur pendant la connexion."));
    }
});

router.get("/gestion", requireAdmin, async (req, res) => {
    try {
        res.type("html").send(gestionPage({ vegetables: await listVegetables() }));
    } catch (error) {
        console.error("Erreur GET /api/gestion:", error);
        res.status(500).send("Impossible de charger la page de gestion.");
    }
});

router.post("/gestion", requireAdmin, async (req, res) => {
    const { name, prix } = req.body;
    const vegetableName = requiredText(name);
    const vegetablePrice = parseNonNegativeNumber(prix);

    if (!vegetableName || vegetablePrice === null) {
        const vegetables = await listVegetables();
        return res.status(400).type("html").send(gestionPage({
            vegetables,
            error: "Le nom et un prix valide sont obligatoires."
        }));
    }

    try {
        await pool.query(
            "INSERT INTO vegetables (name, prix) VALUES ($1, $2)",
            [vegetableName, vegetablePrice]
        );
        res.type("html").send(gestionPage({
            vegetables: await listVegetables(),
            message: "Garniture legume ajoutee avec succes."
        }));
    } catch (error) {
        const vegetables = await listVegetables();
        if (error.code === "23505") {
            return res.status(409).type("html").send(gestionPage({
                vegetables,
                error: "Cette garniture legume existe deja."
            }));
        }

        console.error("Erreur POST /api/gestion:", error);
        res.status(500).type("html").send(gestionPage({
            vegetables,
            error: "Impossible d'ajouter la garniture legume."
        }));
    }
});

router.get("/logout", (req, res) => {
    res.clearCookie(COOKIE_NAME);
    res.redirect("/api/login");
});

export default router;
