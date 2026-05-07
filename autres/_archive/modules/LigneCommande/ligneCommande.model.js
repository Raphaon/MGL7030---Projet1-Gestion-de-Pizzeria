export default class LigneCommande {
    constructor(id, commandeId, pizzaId, montantReduction, formatPizzaId, quantity, totalPrice) {
        this.id = id;
        this.commandeId = commandeId;
        this.pizzaId = pizzaId;
        this.montantReduction = montantReduction;
        this.formatPizzaId = formatPizzaId;
        this.quantity = quantity;
        this.totalPrice = totalPrice;
    }
}       
