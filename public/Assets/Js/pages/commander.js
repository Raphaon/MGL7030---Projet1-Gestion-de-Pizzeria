import { API, httpGet, httpPost, httpDelete } from "../api.js";

let deleteHandlerActive = false;

export async function initCommander() {
    try {
        const [meatsRes, veggiesRes, formatsRes] = await Promise.all([
            httpGet(API.meats),
            httpGet(API.veggies),
            httpGet(API.formats)
        ]);

        if (!meatsRes.ok || !veggiesRes.ok || !formatsRes.ok) {
            afficherErreur("Impossible de charger les donnees du serveur.");
            return;
        }

        const [meats, veggies, formats] = await Promise.all([
            meatsRes.json(),
            veggiesRes.json(),
            formatsRes.json()
        ]);

        injecterGarnitures(meats, veggies);
        injecterFormats(formats);
        await chargerCommandes();
    } catch (err) {
        console.error("Erreur chargement commander:", err);
        afficherErreur("Erreur reseau.");
    }

    const btn = document.getElementById("orderBtn");
    if (btn) {
        btn.addEventListener("click", soumettreCommande);
    }

    if (!deleteHandlerActive) {
        document.addEventListener("click", handleDeleteClick);
        deleteHandlerActive = true;
    }
}

async function soumettreCommande() {
    const selectedFormat = document.querySelector("input[name='format']:checked");
    const selectedMeat = document.querySelector("input[name='garniture']:checked");
    const selectedLegumes = [...document.querySelectorAll("input[name='legume']:checked")];

    if (!selectedFormat || !selectedMeat) {
        alert("Veuillez selectionner un format et une viande.");
        return;
    }

    const format = selectedFormat.value;
    const garniture = selectedMeat.value;
    const legumes = selectedLegumes.map((el) => el.value);
    const prix = Number(selectedFormat.dataset.prix || 0)
        + Number(selectedMeat.dataset.prix || 0)
        + selectedLegumes.reduce((total, el) => total + Number(el.dataset.prix || 0), 0);

    try {
        const res = await httpPost(API.commands, {
            items: "Pizza",
            garniture,
            format,
            unitPrice: prix,
            quantity: 1,
            clientID: "Cl0001",
            legumes
        });

        if (!res.ok) {
            const body = await res.json();
            alert(body.error || "Impossible d'ajouter la commande.");
            return;
        }

        alert("Commande ajoutee avec succes !");
        await chargerCommandes();
    } catch (err) {
        console.error("Erreur ajout commande:", err);
        alert("Erreur reseau, veuillez reessayer.");
    }
}

async function handleDeleteClick(event) {
    if (!event.target.matches(".delete-command")) return;

    const commandId = event.target.getAttribute("data-command-id");
    if (!commandId) return;
    if (!confirm("Supprimer cette commande ?")) return;

    try {
        const res = await httpDelete(`${API.commands}/${commandId}`);
        if (!res.ok) {
            const body = await res.json();
            alert(body.error || "Impossible de supprimer.");
            return;
        }
        await chargerCommandes();
    } catch (err) {
        console.error("Erreur suppression:", err);
    }
}

function injecterGarnitures(meats, veggies) {
    const tbody = document.querySelector(".table-garniture tbody");
    if (!tbody) return;

    const maxRows = Math.max(meats.length, veggies.length);
    const rows = [];

    for (let i = 0; i < maxRows; i++) {
        const meat = meats[i];
        const veggie = veggies[i];

        const meatCell = meat
            ? `<td><input type="radio" name="garniture" id="meat-${meat.id}" value="${meat.name}" data-prix="${meat.prix}">
               <label for="meat-${meat.id}">${meat.name} - ${Number(meat.prix).toFixed(2)} $</label></td>`
            : "<td></td>";

        const veggieCell = veggie
            ? `<td><input type="checkbox" name="legume" id="veg-${veggie.id}" value="${veggie.name}" data-prix="${veggie.prix}">
               <label for="veg-${veggie.id}">${veggie.name} - ${Number(veggie.prix).toFixed(2)} $</label></td>`
            : "<td></td>";

        rows.push(`<tr>${meatCell}${veggieCell}</tr>`);
    }

    tbody.innerHTML = rows.join("");
}

function injecterFormats(formats) {
    const tbody = document.querySelector(".table-format tbody");
    if (!tbody || !Array.isArray(formats)) return;

    tbody.innerHTML = formats.map((f, i) => `
        <tr>
            <td class="radio_format">
                <input type="radio" value="${f.value}" name="format" id="format-${f.id}" data-prix="${f.prix}" ${i === 0 ? "checked" : ""}>
                <label for="format-${f.id}">${f.label} - ${Number(f.prix).toFixed(2)} $</label>
            </td>
        </tr>
    `).join("");
}

async function chargerCommandes() {
    const res = await httpGet(API.commands);
    if (!res.ok) return;
    renderCommandes(await res.json());
}

function renderCommandes(commands) {
    const tbody = document.querySelector("tbody.command-item");
    if (!tbody) return;

    if (!Array.isArray(commands) || commands.length === 0) {
        tbody.innerHTML = "<tr><td colspan='6' class='center-align'>Aucune commande.</td></tr>";
        return;
    }

    tbody.innerHTML = commands.map((c) => `
        <tr>
            <td>${c.id}</td>
            <td>${c.format}</td>
            <td>${c.garniture}</td>
            <td>${Array.isArray(c.legumes) ? c.legumes.join(", ") : ""}</td>
            <td>${Number(c.unitPrice || 0).toFixed(2)} $</td>
            <td><button class="btn btn-small red lighten-1 delete-command" data-command-id="${c.id}">Supprimer</button></td>
        </tr>
    `).join("");
}

function afficherErreur(msg) {
    const tbody = document.querySelector("tbody.command-item");
    if (tbody) tbody.innerHTML = `<tr><td colspan='6' class='red-text center-align'>${msg}</td></tr>`;
}
