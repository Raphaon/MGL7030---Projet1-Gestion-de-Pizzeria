export default class Commande {
    constructor(id, pizzaId, formatPizzaId,totalPrice, pourcentageReduction, status) {
        this.id = id;
        this.date = new Date();
        this.totalPrice = totalPrice;
        this.pourcentageReduction = pourcentageReduction;
        this.status = status;
    }
}

