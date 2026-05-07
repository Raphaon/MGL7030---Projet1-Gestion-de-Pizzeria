import ROUTES from "../routes/routes.js";
import AppConfig from "../Core/app.config.js";
import { initCommander } from "../../Assets/Js/pages/commander.js";
import { initMenu }      from "../../Assets/Js/pages/menu.js";

const appContainer = document.getElementById("app");

const getPath   = (url)  => new URL(url, window.location.origin).pathname;

const matchRoute = (path) => {
    for (const route of ROUTES) {
        const paramNames = [];
        const regexPath  = route.pageUrl.replace(/:([^/]+)/g, (_, key) => {
            paramNames.push(key);
            return "([^/]+)";
        });

        const match = path.match(new RegExp(`^${regexPath}$`));
        if (!match) continue;

        const params = {};
        paramNames.forEach((name, i) => { params[name] = match[i + 1]; });
        return { route, params };
    }
    return null;
};

const renderPage = async (file) => {
    try {
        const res = await fetch(`/pages/${file}`);
        if (!res.ok) throw new Error("Page introuvable");
        appContainer.innerHTML = await res.text();
    } catch {
        const res = await fetch("/pages/404.html");
        appContainer.innerHTML = await res.text();
    }
};

const initPage = (pageId) => {
    if (pageId === "home") {
        if (typeof M !== "undefined") {
            M.Slider.init(document.querySelectorAll(".slider"), {
                indicators: true,
                height:     420,
                duration:   600,
                interval:   5000
            });
        }
    } else if (pageId === "menu") {
        initMenu();
    } else if (pageId === "commander") {
        initCommander();
    }
};

export const navigate = async (url) => {
    const fullUrl = new URL(url, window.location.origin);
    const path    = fullUrl.pathname;
    const query   = Object.fromEntries(fullUrl.searchParams);
    const matched = matchRoute(path);

    if (!matched) {
        const res = await fetch("/pages/404.html");
        appContainer.innerHTML = await res.text();
        return;
    }

    const { route, params } = matched;

    history.pushState({}, route.pageTitle, fullUrl.href);
    document.title  = route.pageTitle;
    AppConfig.pageTitle = route.pageTitle;

    window.ROUTE_CONTEXT = { params, query };

    await renderPage(route.pageFile);
    initPage(route.pageId);
};

export const initRouter = () => {
    document.addEventListener("click", (e) => {
        const link = e.target.closest("a");
        if (!link || !link.href) return;

        const path = getPath(link.href);
        if (ROUTES.some(r => r.pageUrl === path)) {
            e.preventDefault();
            navigate(path);
        }
    });

    window.addEventListener("popstate", () => navigate(window.location.pathname));

    navigate(window.location.pathname);
};
