const port = process.env.SMOKE_TEST_PORT || "4057";
process.env.PORT = port;

const baseUrl = `http://127.0.0.1:${port}`;
const unique = Date.now();

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

async function request(path, options = {}) {
    return fetch(`${baseUrl}${path}`, options);
}

async function json(path, options = {}) {
    const response = await request(path, options);
    const body = await response.json().catch(() => ({}));
    return { response, body };
}

async function testCollection(name, path, payload, deletePath = path) {
    const list = await json(path);
    assert(list.response.ok, `${name}: GET doit reussir`);
    assert(Array.isArray(list.body), `${name}: GET doit retourner un tableau`);

    const created = await json(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });
    assert(created.response.status === 201, `${name}: POST doit retourner 201`);
    assert(created.body.id, `${name}: POST doit retourner un id`);

    const deleted = await json(`${deletePath}/${created.body.id}`, { method: "DELETE" });
    assert(deleted.response.ok, `${name}: DELETE doit reussir`);

    const invalid = await json(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, prix: "abc" })
    });
    assert(invalid.response.status === 400, `${name}: prix invalide doit retourner 400`);
}

async function run() {
    await import("../server/server.js");
    await new Promise((resolve) => setTimeout(resolve, 500));

    const root = await request("/");
    assert(root.ok, "La racine doit retourner la SPA");

    await testCollection("Viandes", "/api/meats", {
        name: `Smoke Meat ${unique}`,
        prix: 3.25
    });

    await testCollection("Legumes", "/api/veggies", {
        name: `Smoke Vegetable ${unique}`,
        prix: 1.25
    });

    await testCollection("Formats", "/api/formats", {
        value: `smoke_${unique}`,
        label: `Smoke ${unique}`,
        prix: 17.5
    });

    const pizzas = await json("/api/pizzas");
    assert(pizzas.response.ok, "Pizzas: GET doit reussir");
    assert(Array.isArray(pizzas.body) && pizzas.body.length > 0, "Pizzas: le menu initial doit exister");

    for (const pizza of pizzas.body) {
        assert(
            typeof pizza.image === "string" && pizza.image.startsWith("/Assets/Images/pizzas/"),
            `Pizzas: ${pizza.nom} doit utiliser une image locale`
        );

        const imageResponse = await request(pizza.image);
        assert(imageResponse.ok, `Pizzas: l'image de ${pizza.nom} doit etre servie par Express`);
    }

    const commandsBefore = await json("/api/commands");
    assert(commandsBefore.response.ok, "Commandes: GET doit reussir");
    assert(Array.isArray(commandsBefore.body), "Commandes: GET doit retourner un tableau");

    const command = await json("/api/commands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            items: "Pizza",
            garniture: "Pepperoni",
            format: "moyenne",
            unitPrice: 16,
            quantity: 1,
            clientID: "Smoke",
            legumes: ["Onions", "Tomatoes"]
        })
    });
    assert(command.response.status === 201, "Commandes: POST doit retourner 201");
    assert(Array.isArray(command.body.legumes) && command.body.legumes.length === 2, "Commandes: les legumes doivent etre conserves");

    const deleteCommand = await json(`/api/commands/${command.body.id}`, { method: "DELETE" });
    assert(deleteCommand.response.ok, "Commandes: DELETE doit reussir");

    const invalidCommand = await json("/api/commands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            items: "Pizza",
            garniture: "Pepperoni",
            format: "moyenne",
            unitPrice: "abc",
            quantity: 1
        })
    });
    assert(invalidCommand.response.status === 400, "Commandes: prix invalide doit retourner 400");

    const loginPage = await request("/api/login");
    const loginHtml = await loginPage.text();
    assert(loginPage.ok && loginHtml.includes("Administration"), "Login: la page doit s'afficher");

    const userModel = await json("/api/users/model");
    assert(userModel.response.ok, "Users model: GET doit reussir");
    assert(Array.isArray(userModel.body.users), "Users model: users doit etre un tableau");
    assert(Array.isArray(userModel.body.groups), "Users model: groups doit etre un tableau");
    assert(Array.isArray(userModel.body.permissions), "Users model: permissions doit etre un tableau");
    assert(
        userModel.body.groupPermissions.some((item) => item.permission_name === "admin:gestion"),
        "Users model: le groupe admin doit posseder la permission admin:gestion"
    );

    const blockedGestion = await request("/api/gestion", { redirect: "manual" });
    assert(blockedGestion.status === 302, "Gestion: sans session, la page doit rediriger");
    assert(blockedGestion.headers.get("location") === "/api/login", "Gestion: la redirection doit pointer vers /api/login");

    const blockedGestionPost = await request("/api/gestion", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ name: "Blocked", prix: "1.00" }),
        redirect: "manual"
    });
    assert(blockedGestionPost.status === 302, "Gestion POST: sans session, la page doit rediriger");
    assert(blockedGestionPost.headers.get("location") === "/api/login", "Gestion POST: la redirection doit pointer vers /api/login");

    const params = new URLSearchParams();
    params.set("username", process.env.ADMIN_USERNAME || "admin");
    params.set("password", process.env.ADMIN_PASSWORD || "admin123");

    const login = await request("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params,
        redirect: "manual"
    });
    assert(login.status === 302, "Login: les bons identifiants doivent rediriger");

    const cookie = login.headers.get("set-cookie")?.split(";")[0];
    assert(cookie, "Login: un cookie de session admin doit etre retourne");

    const gestion = await request("/api/gestion", {
        headers: { Cookie: cookie }
    });
    const gestionHtml = await gestion.text();
    assert(gestion.ok && gestionHtml.includes("Gestion des garnitures legumes"), "Gestion: la page protegee doit s'afficher avec session");

    const adminVegetableName = `Smoke Admin Vegetable ${unique}`;
    const addAdminVegetable = await request("/api/gestion", {
        method: "POST",
        headers: {
            Cookie: cookie,
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({ name: adminVegetableName, prix: "1.50" })
    });
    assert(addAdminVegetable.ok, "Gestion: l'ajout de legume authentifie doit reussir");

    const vegetables = await json("/api/veggies");
    const createdVegetable = vegetables.body.find((vegetable) => vegetable.name === adminVegetableName);
    assert(createdVegetable, "Gestion: le legume ajoute doit etre en base");

    const deleteAdminVegetable = await json(`/api/veggies/${createdVegetable.id}`, { method: "DELETE" });
    assert(deleteAdminVegetable.response.ok, "Gestion: nettoyage du legume de test doit reussir");

    console.log("Smoke test OK");
}

run().catch((error) => {
    console.error(`Smoke test KO: ${error.message}`);
    process.exitCode = 1;
}).finally(() => {
    setTimeout(() => process.exit(process.exitCode || 0), 100);
});
