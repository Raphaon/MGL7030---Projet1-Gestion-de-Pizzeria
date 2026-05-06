-- PostgreSQL Schema for Pizzeria Management System
-- Generated based on module models

-- Table: Garniture (Toppings)
CREATE TABLE Garniture (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL
);

-- Table: FormatPizza (Pizza sizes/formats)
CREATE TABLE FormatPizza (
    id SERIAL PRIMARY KEY,
    taille VARCHAR(50) NOT NULL,
    prix NUMERIC(10,2) NOT NULL
);

-- Table: Pizza (Pizza menu items)
CREATE TABLE Pizza (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    description TEXT,
    price NUMERIC(10,2),
    image_url VARCHAR(500)
);

-- Junction Table: Pizza_Garniture (Many-to-many: Pizza can have multiple garnitures)
CREATE TABLE Pizza_Garniture (
    pizzaId INTEGER NOT NULL,
    garnitureId INTEGER NOT NULL,
    PRIMARY KEY (pizzaId, garnitureId),
    FOREIGN KEY (pizzaId) REFERENCES Pizza(id) ON DELETE CASCADE,
    FOREIGN KEY (garnitureId) REFERENCES Garniture(id) ON DELETE CASCADE
);

-- Junction Table: Pizza_FormatPizza (Many-to-many: Pizza can have multiple formats)
CREATE TABLE Pizza_FormatPizza (
    pizzaId INTEGER NOT NULL,
    formatPizzaId INTEGER NOT NULL,
    PRIMARY KEY (pizzaId, formatPizzaId),
    FOREIGN KEY (pizzaId) REFERENCES Pizza(id) ON DELETE CASCADE,
    FOREIGN KEY (formatPizzaId) REFERENCES FormatPizza(id) ON DELETE CASCADE
);

-- Table: Commande (Orders)
CREATE TABLE Commande (
    id SERIAL PRIMARY KEY,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    totalPrice NUMERIC(10,2),
    pourcentageReduction NUMERIC(5,2),
    status VARCHAR(50)
);

-- Table: LigneCommande (Order line items)
CREATE TABLE LigneCommande (
    id SERIAL PRIMARY KEY,
    commandeId INTEGER NOT NULL,
    pizzaId INTEGER NOT NULL,
    formatPizzaId INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    montantReduction NUMERIC(10,2),
    totalPrice NUMERIC(10,2),
    FOREIGN KEY (commandeId) REFERENCES Commande(id) ON DELETE CASCADE,
    FOREIGN KEY (pizzaId) REFERENCES Pizza(id) ON DELETE CASCADE,
    FOREIGN KEY (formatPizzaId) REFERENCES FormatPizza(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_pizza_garniture_pizzaId ON Pizza_Garniture(pizzaId);
CREATE INDEX idx_pizza_garniture_garnitureId ON Pizza_Garniture(garnitureId);
CREATE INDEX idx_pizza_format_pizzaId ON Pizza_FormatPizza(pizzaId);
CREATE INDEX idx_pizza_format_formatPizzaId ON Pizza_FormatPizza(formatPizzaId);
CREATE INDEX idx_ligne_commande_commandeId ON LigneCommande(commandeId);
CREATE INDEX idx_ligne_commande_pizzaId ON LigneCommande(pizzaId);
CREATE INDEX idx_ligne_commande_formatPizzaId ON LigneCommande(formatPizzaId);