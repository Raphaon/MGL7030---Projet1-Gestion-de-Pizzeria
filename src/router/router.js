import ROUTES from '../routes/routes.js';
import AppConfig from '../Core/app.config.js';

const appContainer = document.getElementById("app");

// 🔹 Normalise URL
const getPath = (url) => new URL(url, window.location.origin).pathname;

// 🔹 Trouver route
const findRoute = (path) => {
    return ROUTES.find(r => r.pageUrl === path);
};

// 🔹 Charger HTML
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

// 🔹 404
const render404 = async () => {
    const res = await fetch(`/pages/404.html`);
    const html = await res.text();
    appContainer.innerHTML = html;
};

// 🔥 Fonction principale
export const navigate = async (url) => {

    const path = getPath(url);
    console.log("Navigating to:", path);

    const route = findRoute(path);

    if (!route) {
        console.warn("Route not found → 404");
        return render404();
    }

    history.pushState({}, route.pageTitle, route.pageUrl);

    document.title = route.pageTitle;
    AppConfig.pageTitle = route.pageTitle;

    await renderPage(route.pageFile);
};

// 🔥 Init router
export const initRouter = () => {

    // Click interception
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