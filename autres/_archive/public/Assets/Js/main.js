import { Pizza } from "./Models/Pizza.js";

var pepperoni = new Pizza(1, "Petite", 30, "Pepperoni - Sauce tomate - formage"),
    veggie    = new Pizza(3, "Grande", 50, "Légumes grillés - Sauce tomate - formage");

const PRIX = {
    format: {
        petite: 8,
        moyenne: 12,
        grande: 15
    },
    viande: 3,
    legume: 1
};

const API = {
    meats:   "/api/meats",
    veggies: "/api/veggies",
    formats: "/api/formats",
    commands: "/api/commands"
};

async function httpGet(url) {
    return fetch(url);
}

async function httpPost(url, payload) {
    return fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
}

async function httpDelete(url) {
    return fetch(url, { method: 'DELETE' });
}

export async function chargerGarnitures() {
    const btnCommand = document.getElementById('orderBtn');
    const commandeItemsBody = document.querySelector('tbody.command-item');

    if (!commandeItemsBody) return;

    commandeItemsBody.innerHTML = '<tr><td colspan="6">Aucune commande trouvée.</td></tr>';
    let totalCommande = 0;

    try {
        const [meatsRes, veggiesRes, formatsRes] = await Promise.all([
            httpGet(API.meats),
            httpGet(API.veggies),
            httpGet(API.formats)
        ]);

        if (!meatsRes.ok || !veggiesRes.ok || !formatsRes.ok) {
            console.warn('Erreur chargement API', meatsRes.status, veggiesRes.status, formatsRes.status);
            return;
        }

        const meats = await meatsRes.json();
        const veggies = await veggiesRes.json();
        const formats = await formatsRes.json();

        injecterTableauGarnitures(meats, veggies);
        injecterFormats(formats);
        await chargerCommandes();
    } catch (err) {
        console.error('Erreur lors du chargement des garnitures:', err);
        return;
    }

    if (btnCommand) {
        btnCommand.addEventListener('click', async function() {
            const selectedFormat = document.querySelector("input[name='format']:checked");
            const selectedMeat = document.querySelector("input[name='garniture']:checked");

            if (!selectedFormat || !selectedMeat) {
                alert('Veuillez sélectionner un format et une garniture viande.');
                return;
            }

            const format = selectedFormat.value;
            const garniture = selectedMeat.value;
            const legumes = [...document.querySelectorAll("input[name='legume']:checked")].map(el => el.value);
            const prix = calculerPrix(format, legumes.length);

            const nouvelleCommande = {
                items: 'Pizza',
                garniture,
                format,
                unitPrice: prix,
                quantity: 1,
                clientID: 'Cl0001',
                legumes
            };

            try {
                const response = await httpPost(API.commands, nouvelleCommande);
                if (!response.ok) {
                    const result = await response.json();
                    alert(result.error || 'Impossible d\u2019ajouter la commande.');
                    return;
                }
                alert('Commande ajoutée avec succès');
                await chargerCommandes();
                totalCommande += prix;
                const totalPrix = document.getElementById('totalPrix');
                if (totalPrix) totalPrix.textContent = totalCommande + ' $';
            } catch (error) {
                console.error('Erreur ajout commande:', error);
                alert('Erreur réseau, veuillez réessayer.');
            }
        });
    }

    document.addEventListener('click', async function(event) {
        if (!(event.target instanceof Element)) return;
        if (!event.target.matches('.delete-command')) return;

        const commandId = event.target.getAttribute('data-command-id');
        if (!commandId) return;

        if (!confirm('Voulez-vous vraiment supprimer cette commande ?')) return;

        try {
            const response = await httpDelete(`${API.commands}/${commandId}`);
            if (!response.ok) {
                const result = await response.json();
                alert(result.error || 'Impossible de supprimer la commande.');
                return;
            }
            await chargerCommandes();
        } catch (error) {
            console.error('Erreur suppression commande :', error);
            alert('Erreur réseau, veuillez réessayer.');
        }
    });
}

function injecterTableauGarnitures(meats, veggies) {
    const table = document.querySelector('.table-garniture');
    if (!table) return;

    table.innerHTML = '';

    const maxRows = Math.max(meats.length, veggies.length);

    for (let i = 0; i < maxRows; i++) {
        const meat = meats[i];
        const veggie = veggies[i];

        const meatCell = meat
            ? `<td>
                <input type="radio" name="garniture" id="meat-${meat.id}" value="${meat.name}">
                <label for="meat-${meat.id}">${meat.name}</label>
              </td>`
            : '<td></td>';

        const veggieCell = veggie
            ? `<td>
                <input type="checkbox" name="legume" id="veg-${veggie.id}" value="${veggie.name}">
                <label for="veg-${veggie.id}">${veggie.name}</label>
              </td>`
            : '<td></td>';

        table.insertAdjacentHTML('beforeend', `<tr>${meatCell}${veggieCell}</tr>`);
    }
}

function injecterFormats(formats) {
    const table = document.querySelector('.table-format');
    if (!table || !Array.isArray(formats)) return;

    table.innerHTML = formats.map((format, index) => `
        <tr>
            <td class="radio_format">
                <input type="radio" value="${format.value}" name="format" id="format-${format.id}" ${index === 0 ? 'checked' : ''}>
            </td>
            <td>
                <label for="format-${format.id}">${format.label}</label>
            </td>
        </tr>
    `).join('');
}

async function chargerCommandes() {
    const response = await httpGet(API.commands);
    if (!response.ok) {
        console.warn('Impossible de charger les commandes', response.status);
        return;
    }
    const commandes = await response.json();
    renderCommandes(commandes);
}

function renderCommandes(commands) {
    const tbody = document.querySelector('tbody.command-item');
    if (!tbody) return;

    if (!Array.isArray(commands) || commands.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">Aucune commande trouvée.</td></tr>';
        return;
    }

    tbody.innerHTML = commands.map(command => `
        <tr>
            <td>${command.id}</td>
            <td>${command.format}</td>
            <td>${command.garniture}</td>
            <td>${Array.isArray(command.legumes) ? command.legumes.join(', ') : ''}</td>
            <td>${parseFloat(command.unitPrice || 0).toFixed(2)} $</td>
            <td><button class="delete-command" data-command-id="${command.id}">Supprimer</button></td>
        </tr>
    `).join('');
}

function injecterMenuLateral() {
    const ul = document.querySelector('.menu-items');
    if (!ul) return;

    const items = [
        { label: 'Petite pizza',      prix: PRIX.format.petite  },
        { label: 'Moyenne pizza',     prix: PRIX.format.moyenne },
        { label: 'Grande pizza',      prix: PRIX.format.grande  },
        { label: 'Garniture viande',  prix: PRIX.viande         },
        { label: 'Garniture légumes', prix: PRIX.legume         },
    ];

    ul.innerHTML = items
        .map(({ label, prix }) => `<li><a>${label} … ${prix.toFixed(2)} $</a></li>`)
        .join('');
}

function calculerPrix(format, legumesCount) {
    return PRIX.format[format] + PRIX.viande + (legumesCount * PRIX.legume);
}

function getDateNow() {
    const timestamp = Date.now();
    const formateur = new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    return formateur.format(timestamp).replace(/\//g, '-');
}
