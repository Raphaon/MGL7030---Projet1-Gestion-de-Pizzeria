// j'importe les routes et la config de l'app
import ROUTES from '../routes/routes.js';
import AppConfig from '../Core/app.config.js';

// j'importe la fonction de chargement dynamique des garnitures et du menu
// elle est appelée apres chaque injection de Home.html dans le DOM
import { chargerGarnitures } from '../../Assets/Js/main.js';

/**
 * Je recupere le container de l'app pour y injecter les pages
 */
const appContainer = document.getElementById("app");

// Fonction permettant de normaliser l'URL
// elle prend une URL complète et retourne uniquement le chemin (pathname)
// Ex: http://localhost:3000/home → /home

const getPath = (url) => new URL(url, window.location.origin).pathname;


// Trouver route dans mon fichier des routes exitent
const findRoute = (path) => {
    return ROUTES.find(r => r.pageUrl === path);
};


//  Charger la page HTML solicitée et l'injecter dans le container de l'app

const renderPage = async (file) => {

    
    try {
        const res = await fetch(`./pages/${file}`);

        if (!res.ok) throw new Error("Page not found");

        const html = await res.text();
        appContainer.innerHTML = html;

    } catch (err) {
        console.error(err);
        render404();
    }
};

// Afficher la page 404
const render404 = async () => {
    const res = await fetch(`/pages/404.html`);
    const html = await res.text();
    appContainer.innerHTML = html;
};

// Matcher une route dynamique (ex: /orders/:id)
const matchRoute = (path) => {

    for (let route of ROUTES) {

        // transformer /orders/:id → regex
        const paramNames = [];
        const regexPath = route.pageUrl.replace(/:([^/]+)/g, (_, key) => {
            paramNames.push(key);
            return "([^/]+)";
        });

        const regex = new RegExp(`^${regexPath}$`);
        const match = path.match(regex);

        if (match) {
            const params = {};

            paramNames.forEach((name, index) => {
                params[name] = match[index + 1];
            });

            return { route, params };
        }
    }

    return null;
};

// Récupérer les paramètres de query en string et les convertir en objet
// ex: ?search=pepperoni&sort=asc → { search: "pepperoni", sort: "asc" }

const getQueryParams = () => {
    return Object.fromEntries(new URLSearchParams(window.location.search));
};



// Vérifier si l'utilisateur est connecté (ex: token dans le localStorage)
const isLoggedIn = () => {
    return !!localStorage.getItem("user");
};


//  Fonction principale qui gère la navigation dans l'app
export const navigate = async (url) => {

    const fullUrl = new URL(url, window.location.origin);

    const path = fullUrl.pathname;
    const query = Object.fromEntries(fullUrl.searchParams);

    console.log("Navigating:", path, query);

    const match = matchRoute(path);

    if (!match) {
        return render404();
    }

    const { route, params } = match;

    //  Guard
    if (route.protected && !isLoggedIn()) {
        console.warn("Access denied → redirect login");
        return navigate("/login");
    }

    history.pushState({}, route.pageTitle, fullUrl.href);

    document.title = route.pageTitle;
    AppConfig.pageTitle = route.pageTitle;

    // passer les données à la page
    window.ROUTE_CONTEXT = {
        params,
        query
    };

    await renderPage(route.pageFile);

    // Si la page chargée est Home, on injecte dynamiquement
    // les garnitures et le menu depuis l'API Express
    if (route.pageId === "home") {
        chargerGarnitures();
    }
};


//  Init router au chargement de l'app
export const initRouter = () => {

    // on evite le comportement par défaut des liens 
    document.addEventListener("click", (e) => {
        const link = e.target.closest("a");

        if (!link) return;

        const path = getPath(link.href);

        const routeExists = ROUTES.some(r => r.pageUrl === path);

        if (routeExists) {
            e.preventDefault();
            navigate(path);
        }
    });

    // Back / forward
    window.addEventListener("popstate", () => {
        navigate(window.location.pathname);
    });

    // First load
    navigate(window.location.pathname);
};