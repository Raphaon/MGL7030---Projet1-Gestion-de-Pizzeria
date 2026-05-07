-- Script de creation PostgreSQL - Laboratoire 3
-- Application de gestion de pizzeria

DROP TABLE IF EXISTS command_vegetables;
DROP TABLE IF EXISTS commands;
DROP TABLE IF EXISTS pizzas;
DROP TABLE IF EXISTS formats;
DROP TABLE IF EXISTS vegetables;
DROP TABLE IF EXISTS meats;
DROP TABLE IF EXISTS admins;
DROP TABLE IF EXISTS user_groups;
DROP TABLE IF EXISTS group_permissions;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS groups;
DROP TABLE IF EXISTS permissions;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(80) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(80) NOT NULL UNIQUE,
    label VARCHAR(120) NOT NULL
);

CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL UNIQUE,
    label VARCHAR(160) NOT NULL
);

CREATE TABLE user_groups (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, group_id)
);

CREATE TABLE group_permissions (
    group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (group_id, permission_id)
);

CREATE TABLE admins (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE meats (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL UNIQUE,
    prix NUMERIC(10, 2) NOT NULL CHECK (prix >= 0)
);

CREATE TABLE vegetables (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL UNIQUE,
    prix NUMERIC(10, 2) NOT NULL CHECK (prix >= 0)
);

CREATE TABLE formats (
    id SERIAL PRIMARY KEY,
    value VARCHAR(60) NOT NULL UNIQUE,
    label VARCHAR(120) NOT NULL,
    prix NUMERIC(10, 2) NOT NULL CHECK (prix >= 0)
);

CREATE TABLE pizzas (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(160) NOT NULL,
    type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    ingredients TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    image TEXT,
    prix_base NUMERIC(10, 2) NOT NULL CHECK (prix_base >= 0)
);

ALTER TABLE pizzas ADD CONSTRAINT pizzas_nom_unique UNIQUE (nom);

CREATE TABLE commands (
    id SERIAL PRIMARY KEY,
    items VARCHAR(120) NOT NULL,
    garniture VARCHAR(120) NOT NULL,
    format VARCHAR(60) NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    client_id VARCHAR(80),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE command_vegetables (
    command_id INTEGER NOT NULL REFERENCES commands(id) ON DELETE CASCADE,
    vegetable_name VARCHAR(120) NOT NULL,
    PRIMARY KEY (command_id, vegetable_name)
);

CREATE INDEX idx_commands_created_at ON commands(created_at);
CREATE INDEX idx_command_vegetables_command_id ON command_vegetables(command_id);

INSERT INTO groups (name, label) VALUES
    ('admin', 'Administrateurs'),
    ('employee', 'Employes');

INSERT INTO permissions (name, label) VALUES
    ('admin:gestion', 'Acceder a la section de gestion'),
    ('vegetables:create', 'Ajouter des garnitures legumes');

INSERT INTO group_permissions (group_id, permission_id)
SELECT g.id, p.id
FROM groups g
CROSS JOIN permissions p
WHERE g.name = 'admin';

INSERT INTO meats (name, prix) VALUES
    ('Pepperoni', 3.00),
    ('Sausage', 3.00),
    ('Chicken', 3.00),
    ('Beef', 3.00),
    ('Bacon', 3.00),
    ('Ham', 3.00);

INSERT INTO vegetables (name, prix) VALUES
    ('Mushrooms', 1.00),
    ('Onions', 1.00),
    ('Green Peppers', 1.00),
    ('Black Olives', 1.00),
    ('Tomatoes', 1.00),
    ('Spinach', 1.00);

INSERT INTO formats (value, label, prix) VALUES
    ('petite', 'Petite', 8.00),
    ('moyenne', 'Moyenne', 12.00),
    ('grande', 'Grande', 15.00);

INSERT INTO pizzas (nom, type, description, ingredients, image, prix_base) VALUES
    (
        'Margherita',
        'Classique',
        'Sauce tomate, mozzarella fraiche et basilic.',
        ARRAY['Sauce tomate', 'Mozzarella', 'Basilic'],
        '/Assets/Images/pizzas/margherita.svg',
        8.00
    ),
    (
        'Pepperoni',
        'Gourmande',
        'Sauce tomate, mozzarella et pepperoni croustillant.',
        ARRAY['Sauce tomate', 'Mozzarella', 'Pepperoni'],
        '/Assets/Images/pizzas/pepperoni.svg',
        10.00
    ),
    (
        'Vegetarienne',
        'Fraicheur',
        'Sauce tomate, legumes frais et mozzarella.',
        ARRAY['Sauce tomate', 'Mozzarella', 'Poivrons', 'Champignons', 'Oignons'],
        '/Assets/Images/pizzas/vegetarienne.svg',
        9.00
    ),
    (
        'Quatre Fromages',
        'Gourmande',
        'Mozzarella, gorgonzola, parmesan et ricotta.',
        ARRAY['Mozzarella', 'Gorgonzola', 'Parmesan', 'Ricotta'],
        '/Assets/Images/pizzas/quatre-fromages.svg',
        11.00
    );
