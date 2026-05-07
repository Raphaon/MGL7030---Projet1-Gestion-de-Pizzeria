import bcrypt from "bcrypt";
import pool from "../Config/db.js";

const adminUsername = process.env.ADMIN_USERNAME || "admin";
const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10);

const groups = [
    ["admin", "Administrateurs"],
    ["employee", "Employes"]
];

const permissions = [
    ["admin:gestion", "Acceder a la section de gestion"],
    ["vegetables:create", "Ajouter des garnitures legumes"]
];

const meats = [
    ["Pepperoni", 3.00],
    ["Sausage", 3.00],
    ["Chicken", 3.00],
    ["Beef", 3.00],
    ["Bacon", 3.00],
    ["Ham", 3.00]
];

const vegetables = [
    ["Mushrooms", 1.00],
    ["Onions", 1.00],
    ["Green Peppers", 1.00],
    ["Black Olives", 1.00],
    ["Tomatoes", 1.00],
    ["Spinach", 1.00]
];

const formats = [
    ["petite", "Petite", 8.00],
    ["moyenne", "Moyenne", 12.00],
    ["grande", "Grande", 15.00]
];

const pizzas = [
    [
        "Margherita",
        "Classique",
        "Sauce tomate, mozzarella fraiche et basilic.",
        ["Sauce tomate", "Mozzarella", "Basilic"],
        "/Assets/Images/pizzas/margherita.svg",
        8.00
    ],
    [
        "Pepperoni",
        "Gourmande",
        "Sauce tomate, mozzarella et pepperoni croustillant.",
        ["Sauce tomate", "Mozzarella", "Pepperoni"],
        "/Assets/Images/pizzas/pepperoni.svg",
        10.00
    ],
    [
        "Vegetarienne",
        "Fraicheur",
        "Sauce tomate, legumes frais et mozzarella.",
        ["Sauce tomate", "Mozzarella", "Poivrons", "Champignons", "Oignons"],
        "/Assets/Images/pizzas/vegetarienne.svg",
        9.00
    ],
    [
        "Quatre Fromages",
        "Gourmande",
        "Mozzarella, gorgonzola, parmesan et ricotta.",
        ["Mozzarella", "Gorgonzola", "Parmesan", "Ricotta"],
        "/Assets/Images/pizzas/quatre-fromages.svg",
        11.00
    ]
];

async function seedAuth(client) {
    for (const [name, label] of groups) {
        await client.query(
            `INSERT INTO groups (name, label)
             VALUES ($1, $2)
             ON CONFLICT (name) DO UPDATE SET label = EXCLUDED.label`,
            [name, label]
        );
    }

    for (const [name, label] of permissions) {
        await client.query(
            `INSERT INTO permissions (name, label)
             VALUES ($1, $2)
             ON CONFLICT (name) DO UPDATE SET label = EXCLUDED.label`,
            [name, label]
        );
    }

    await client.query(`
        INSERT INTO group_permissions (group_id, permission_id)
        SELECT g.id, p.id
        FROM groups g
        CROSS JOIN permissions p
        WHERE g.name = 'admin'
        ON CONFLICT DO NOTHING
    `);

    const passwordHash = await bcrypt.hash(adminPassword, saltRounds);
    const userResult = await client.query(
        `INSERT INTO users (username, password_hash, is_active)
         VALUES ($1, $2, TRUE)
         ON CONFLICT (username)
         DO UPDATE SET password_hash = EXCLUDED.password_hash, is_active = TRUE
         RETURNING id`,
        [adminUsername, passwordHash]
    );

    await client.query(
        `INSERT INTO user_groups (user_id, group_id)
         SELECT $1, id FROM groups WHERE name = 'admin'
         ON CONFLICT DO NOTHING`,
        [userResult.rows[0].id]
    );

    await client.query(
        `INSERT INTO admins (user_id)
         VALUES ($1)
         ON CONFLICT DO NOTHING`,
        [userResult.rows[0].id]
    );
}

async function seedCatalog(client) {
    for (const [name, prix] of meats) {
        await client.query(
            `INSERT INTO meats (name, prix)
             VALUES ($1, $2)
             ON CONFLICT (name) DO UPDATE SET prix = EXCLUDED.prix`,
            [name, prix]
        );
    }

    for (const [name, prix] of vegetables) {
        await client.query(
            `INSERT INTO vegetables (name, prix)
             VALUES ($1, $2)
             ON CONFLICT (name) DO UPDATE SET prix = EXCLUDED.prix`,
            [name, prix]
        );
    }

    for (const [value, label, prix] of formats) {
        await client.query(
            `INSERT INTO formats (value, label, prix)
             VALUES ($1, $2, $3)
             ON CONFLICT (value) DO UPDATE SET label = EXCLUDED.label, prix = EXCLUDED.prix`,
            [value, label, prix]
        );
    }

    for (const [nom, type, description, ingredients, image, prixBase] of pizzas) {
        await client.query(
            `INSERT INTO pizzas (nom, type, description, ingredients, image, prix_base)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (nom) DO UPDATE SET
                type = EXCLUDED.type,
                description = EXCLUDED.description,
                ingredients = EXCLUDED.ingredients,
                image = EXCLUDED.image,
                prix_base = EXCLUDED.prix_base`,
            [nom, type, description, ingredients, image, prixBase]
        );
    }
}

async function seed() {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");
        await seedAuth(client);
        await seedCatalog(client);
        await client.query("COMMIT");
        console.log("Seeds appliques.");
        console.log(`Identifiant admin: ${adminUsername}`);
        console.log(`Mot de passe admin: ${adminPassword}`);
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

seed()
    .catch((error) => {
        console.error("Erreur seed:", error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await pool.end();
    });
