import FormatPizza from "./formatPizza.model";
export class FormatPizzaController {
    constructor(formatPizzaService) {
        this.formatPizzaService = formatPizzaService;
    }

    async getAllFormatPizzas(req, res) {
        try {
            const formatPizzas = await this.formatPizzaService.getAllFormatPizzas();
            res.json(formatPizzas);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch format pizzas' });
        }
    }

    async getFormatPizzaById(req, res) {
        const id = parseInt(req.params.id);
        try {
            const formatPizza = await this.formatPizzaService.getFormatPizzaById(id);
            if (formatPizza) {
                res.json(formatPizza);
            } else {
                res.status(404).json({ error: 'Format pizza not found' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch format pizza' });
        }
    }
}   