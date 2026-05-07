import { API, httpGet } from "../api.js";

const FALLBACK_IMAGE = "/Assets/Images/pizzas/fallback.svg";

export async function initMenu() {
    const status = document.getElementById("menuStatus");
    const content = document.getElementById("menuContent");

    setStatus("Chargement du menu...");
    if (content) content.hidden = true;

    try {
        const res = await httpGet(API.pizzas);
        if (!res.ok) throw new Error("Erreur serveur");

        const pizzas = await res.json();
        if (!Array.isArray(pizzas) || pizzas.length === 0) {
            setStatus("Aucune pizza n'est disponible pour le moment.");
            return;
        }

        renderPizzaList(pizzas);
        showPizza(pizzas, pizzas[0].id);
        if (status) status.hidden = true;
        if (content) content.hidden = false;
    } catch (err) {
        console.error("Erreur chargement menu:", err);
        setStatus("Impossible de charger le menu. Verifiez que la base de donnees est initialisee.");
    }
}

function renderPizzaList(pizzas) {
    const list = document.getElementById("pizzaList");
    if (!list) return;

    list.innerHTML = pizzas.map((pizza, index) => {
        const ingredients = normalizeIngredients(pizza.ingredients);
        const ingredientPreview = ingredients.slice(0, 3).join(", ");

        return `
            <button class="pizza-card ${index === 0 ? "is-selected" : ""}" type="button" data-id="${pizza.id}">
                <img src="${escapeHtml(pizza.image || FALLBACK_IMAGE)}" alt="${escapeHtml(pizza.nom)}">
                <span class="pizza-card-content">
                    <span class="pizza-card-meta">${escapeHtml(pizza.type)}</span>
                    <strong>${escapeHtml(pizza.nom)}</strong>
                    <small>${escapeHtml(ingredientPreview)}${ingredients.length > 3 ? "..." : ""}</small>
                    <span class="pizza-card-price">${formatPrice(pizza.prix_base)}</span>
                </span>
            </button>
        `;
    }).join("");

    list.querySelectorAll(".pizza-card").forEach((item) => {
        const img = item.querySelector("img");
        if (img) {
            img.addEventListener("error", () => {
                img.src = FALLBACK_IMAGE;
            }, { once: true });
        }

        item.addEventListener("click", () => {
            list.querySelectorAll(".pizza-card").forEach((el) => el.classList.remove("is-selected"));
            item.classList.add("is-selected");
            showPizza(pizzas, Number(item.dataset.id));
        });
    });
}

function showPizza(pizzas, id) {
    const pizza = pizzas.find((item) => Number(item.id) === Number(id));
    if (!pizza) return;

    setText("pizzaName", pizza.nom);
    setText("pizzaType", pizza.type);
    setText("pizzaDescription", pizza.description);
    setText("pizzaPrice", `A partir de ${formatPrice(pizza.prix_base)}`);

    const ingredients = normalizeIngredients(pizza.ingredients);
    const ingredientsContainer = document.getElementById("pizzaIngredients");
    if (ingredientsContainer) {
        ingredientsContainer.innerHTML = ingredients
            .map((ingredient) => `<span>${escapeHtml(ingredient)}</span>`)
            .join("");
    }

    const img = document.getElementById("pizzaImage");
    if (img) {
        img.onerror = () => {
            img.onerror = null;
            img.src = FALLBACK_IMAGE;
        };
        img.src = pizza.image || FALLBACK_IMAGE;
        img.alt = pizza.nom;
    }
}

function normalizeIngredients(ingredients) {
    return Array.isArray(ingredients)
        ? ingredients.filter(Boolean).map(String)
        : [];
}

function formatPrice(value) {
    return `${Number(value || 0).toFixed(2)} $`;
}

function setStatus(message) {
    const status = document.getElementById("menuStatus");
    if (!status) return;
    status.hidden = false;
    status.textContent = message;
}

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text || "";
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}
