import { Pizza } from "./pizza.model";

export class PizzaController {
    constructor(pizzaService) {
        this.pizzaService = pizzaService;
    }

    async getAllPizzas(req, res) {
        try {
            const pizzas = await this.pizzaService.getAllPizzas();
            res.json(pizzas);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch pizzas' });
        }
    }

    async getPizzaById(req, res) {
        const id = parseInt(req.params.id);
        try {
            const pizza = await this.pizzaService.getPizzaById(id);
            if (pizza) {
                res.json(pizza);
            } else {
                res.status(404).json({ error: 'Pizza not found' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch pizza' });
        }
    }

    async createPizza(req, res) {
        const { name, type, description, price, image_url } = req.body;
        try {
            const newPizza = await this.pizzaService.createPizza(name, type, description, price, image_url);
            res.status(201).json(newPizza);
        } catch (error) {
            res.status(500).json({ error: 'Failed to create pizza' });
        }
    }

    async updatePizza(req, res) {
        const id = parseInt(req.params.id);
        const { name, type, description, price, image_url } = req.body;
        try {
            const updatedPizza = await this.pizzaService.updatePizza(id, name, type, description, price, image_url);
            if (updatedPizza) {
                res.json(updatedPizza);
            } else {
                res.status(404).json({ error: 'Pizza not found' });
            }
        } catch (error) {
            res.status(500).json({ error:   'Failed to update pizza' });
        }
    }

    async deletePizza(req, res) {
        const id = parseInt(req.params.id);
        try {
            const deleted = await this.pizzaService.deletePizza(id);
            if (deleted) {
                res.json({ message: 'Pizza deleted successfully' });
            } else {
                res.status(404).json({ error: 'Pizza not found' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete pizza' });
        }
    }   

    async getPizzaIngredients(req, res) {
        const id = parseInt(req.params.id);
        try {
            const ingredients = await this.pizzaService.getPizzaIngredients(id);
            if (ingredients) {
                res.json(ingredients);
            } else {
                res.status(404).json({ error: 'Pizza not found' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch pizza ingredients' });
        }
    }   

    async addPizzaIngredient(req, res) {
        const pizzaId = parseInt(req.params.id);
        const { ingredientId } = req.body;
        try {
            const added = await this.pizzaService.addPizzaIngredient(pizzaId, ingredientId);
            if (added) {
                res.json({ message: 'Ingredient added to pizza successfully' });
            } else {
                res.status(404).json({ error: 'Pizza or ingredient not found' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Failed to add ingredient to pizza' });
        }
    }   


    async removePizzaIngredient(req, res) {     
        const pizzaId = parseInt(req.params.id);    
        const ingredientId = parseInt(req.params.ingredientId);
        try {
            const removed = await this.pizzaService.removePizzaIngredient(pizzaId, ingredientId);
            if (removed) {
                res.json({ message: 'Ingredient removed from pizza successfully' });
            } else {
                res.status(404).json({ error: 'Pizza or ingredient not found' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Failed to remove ingredient from pizza' });
        }
    }   


    


}   