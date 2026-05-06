import pool from '../config/db/pool';

import { Pizza } from "./pizza.model";

export default class PizzaService {   
    async getAllPizzas() {
        const result = await this.db.query('SELECT * FROM pizzas');
        return result.rows.map(row => new Pizza(row.id, row.name, row.type, row.description, row.price, row.image_url));
    }

    async getPizzaById(id) {
        const result = await this.db.query('SELECT * FROM pizzas WHERE id = $1', [id]);
        if (result.rows.length > 0) {
            const row = result.rows[0];
            return new Pizza(row.id, row.name, row.type, row.description, row.price, row.image_url);
        }
        return null;
    }   
}