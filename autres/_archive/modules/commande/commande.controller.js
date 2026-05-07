import Commande from "./commande.model";
export default class CommandeController {   
    constructor(commandeService) {
        this.commandeService = commandeService;
    }

    async createCommande(req, res) {
        const { pizzaId, formatPizzaId, quantity } = req.body;
        try {
            const newCommande = await this.commandeService.createCommande(pizzaId, formatPizzaId, quantity);
            res.status(201).json(newCommande);
        } catch (error) {
            res.status(500).json({ error: 'Failed to create commande' });
        }
     }

    async getAllCommandes(req, res) {           
        try {       
            const commandes = await this.commandeService.getAllCommandes();
            res.json(commandes);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch commandes' });
        }
     }

    async getCommandeById(req, res) {           
        const id = parseInt(req.params.id);
        try {
            const commande = await this.commandeService.getCommandeById(id);
            if (commande) {
                res.json(commande);
            } else {
                res.status(404).json({ error: 'Commande not found' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch commande' });    
        }
     }      

    async updateCommandeStatus(req, res) {
        const id = parseInt(req.params.id);
        const { status } = req.body;
        try {
            const updatedCommande = await this.commandeService.updateCommandeStatus(id, status);
            if (updatedCommande) {
                res.json(updatedCommande);
            } else {
                res.status(404).json({ error: 'Commande not found' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Failed to update commande status' });
         }
     }

    async deleteCommande(req, res) {        
        const id = parseInt(req.params.id); 
        try {
            const deleted = await this.commandeService.deleteCommande(id);
            if (deleted) {
                res.json({ message: 'Commande deleted successfully' });
            } else {
                res.status(404).json({ error: 'Commande not found' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete commande' });
         }      
        }

    async getCommandesByStatus(req, res) {
        const status = req.query.status;
        try {
            const commandes = await this.commandeService.getCommandesByStatus(status);
            res.json(commandes);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch commandes by status' });
         }
     }

    async getCommandesByPizzaId(req, res) {
        const pizzaId = parseInt(req.params.pizzaId);
        try {
            const commandes = await this.commandeService.getCommandesByPizzaId(pizzaId);
            res.json(commandes);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch commandes by pizza ID' });
         }
     }

    async getCommandesByFormatPizzaId(req, res) {
        const formatPizzaId = parseInt(req.params.formatPizzaId);
        try {
            const commandes = await this.commandeService.getCommandesByFormatPizzaId(formatPizzaId);            
            res.json(commandes);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch commandes by format pizza ID' });
         }
     }

    async getTotalRevenue(req, res) {
        try {
            const totalRevenue = await this.commandeService.getTotalRevenue();
            res.json({ totalRevenue });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch total revenue' });
         }
     }

    async getCommandesByDateRange(req, res) {
        const { startDate, endDate } = req.query;
        try {
            const commandes = await this.commandeService.getCommandesByDateRange(startDate, endDate);
            res.json(commandes);
        }   catch (error) { 
            res.status(500).json({ error: 'Failed to fetch commandes by date range' });
         }
     }

    async getMostPopularPizzas(req, res) {
        try {
            const popularPizzas = await this.commandeService.getMostPopularPizzas();
            res.json(popularPizzas);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch most popular pizzas' });
         }
     }

    async getAverageOrderValue(req, res) {
        try {
            const averageOrderValue = await this.commandeService.getAverageOrderValue();
            res.json({ averageOrderValue });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch average order value' });
         }
     }

    async deleteCommandesByPizzaId(req, res) {
        const pizzaId = parseInt(req.params.pizzaId);
        try {
            const deletedCount = await this.commandeService.deleteCommandesByPizzaId(pizzaId);
            res.json({ message: `${deletedCount} commandes deleted successfully` });
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete commandes by pizza ID' });
         }
     }

    async deleteCommandesByFormatPizzaId(req, res) {
        const formatPizzaId = parseInt(req.params.formatPizzaId);
        try {
            const deletedCount = await this.commandeService.deleteCommandesByFormatPizzaId(formatPizzaId);
            res.json({ message: `${deletedCount} commandes deleted successfully` });
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete commandes by format pizza ID' });
         }
     }      

    async deleteCommandesByStatus(req, res) {
        const status = req.query.status;
        try {
            const deletedCount = await this.commandeService.deleteCommandesByStatus(status);            
            res.json({ message: `${deletedCount} commandes deleted successfully` });
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete commandes by status' });
         }  
        }   
    }