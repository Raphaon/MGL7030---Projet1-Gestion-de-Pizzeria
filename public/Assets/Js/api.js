export const API = {
    meats:    "/api/meats",
    veggies:  "/api/veggies",
    formats:  "/api/formats",
    commands: "/api/commands",
    pizzas:   "/api/pizzas"
};

export const httpGet    = (url)          => fetch(url);
export const httpPost   = (url, payload) => fetch(url, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(payload)
});
export const httpDelete = (url) => fetch(url, { method: "DELETE" });
