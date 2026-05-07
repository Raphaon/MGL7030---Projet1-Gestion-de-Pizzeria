import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { registerClient, loginUtilisateur } from './auth.service.js';
import { requireAuth, requirePermission } from './auth.middleware.js';
import pool from '../../Config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();


router.post('/auth/register', async (req, res) => {
    const { nom_utilisateur, email, mot_de_passe } = req.body;

    if (!nom_utilisateur || !email || !mot_de_passe) {
        return res.status(400).json({
            error: 'Les champs sont obligatoires.'
        });
    }

    try {
        const newUser = await registerClient({
            nomUtilisateur: nom_utilisateur,
            email,
            motDePasse: mot_de_passe
        });

        return res.status(201).json({
            message: 'Compte créé avec success.',
            user: {
                id:             newUser.id,
                nomUtilisateur: newUser.nom_utilisateur,
                email:          newUser.email
            }
        });
    } catch (err) {
        console.error('Erreur register :', err);
        return res.status(500).json({ error: 'Erreur serveur.' });
    }
});

router.post('/auth/login', async (req, res) => {
    const { nom_utilisateur, mot_de_passe } = req.body;

    if (!nom_utilisateur || !mot_de_passe) {
        return res.status(400).json({
            error: 'Les champs sont obligatoires.'
        });
    }

    try {
        const resultat = await loginUtilisateur({
            nomUtilisateur: nom_utilisateur,
            motDePasse:     mot_de_passe
        });

        if (!resultat) {
            return res.status(401).json({
                error: "Nom d'utilisateur ou mot de passe incorrect."
            });
        }

        return res.status(200).json({
            message: 'Connexion réussie.',
            token:   resultat.token,   
            user:    resultat.user
        });
    } catch (err) {
        console.error('Erreur login :', err);
        return res.status(500).json({ error: 'Erreur serveur.' });
    }
});

router.get('/auth/me', requireAuth, (req, res) => {
    return res.json({
        id:             req.user.id,
        nomUtilisateur: req.user.nomUtilisateur,
        email:          req.user.email,
        groupe:         req.user.groupe,
        permissions:    req.user.permissions
    });
});


router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/login.html'));
});

router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/register.html'));
});

router.post('/login', async (req, res) => {
    const { nom_utilisateur, mot_de_passe } = req.body;

    if (!nom_utilisateur || !mot_de_passe) {
        return res.redirect('/api/login?erreur=Veuillez+remplir+tous+les+champs');
    }

    try {
        const resultat = await loginUtilisateur({
            nomUtilisateur: nom_utilisateur,
            motDePasse:     mot_de_passe
        });

        if (!resultat) {
            return res.redirect("/api/login?erreur=Nom+d'utilisateur+ou+mot+de+passe+incorrect");
        }

        if (resultat.user.groupe !== 'admin') {
            return res.redirect('/api/login?erreur=Accès+réservé+aux+administrateurs');
        }

        req.session.utilisateur = resultat.user;

        return res.redirect('/api/gestion');
    } catch (err) {
        console.error('Erreur login HTML :', err);
        return res.redirect('/api/login?erreur=Erreur+interne,+veuillez+réessayer');
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/api/login'));
});

router.get('/gestion', (req, res) => {
    if (!req.session || !req.session.utilisateur) {
        return res.redirect('/api/login');
    }
    if (req.session.utilisateur.groupe !== 'admin') {
        return res.redirect('/api/login?erreur=Accès+réservé+aux+administrateurs');
    }

    res.sendFile(path.join(__dirname, '../../public/gestion.html'));
});

router.get('/gestion/data', async (req, res) => {
    if (!req.session || !req.session.utilisateur) {
        return res.status(401).json({ error: 'Non authentifié.' });
    }
    if (req.session.utilisateur.groupe !== 'admin') {
        return res.status(403).json({ error: 'Accès refusé.' });
    }

    try {
        const { rows } = await pool.query(
            `SELECT id, nom, prix FROM garniture WHERE type = 'legume' ORDER BY nom`
        );
        return res.json({ legumes: rows });
    } catch (err) {
        console.error('Erreur chargement légumes JSON :', err);
        return res.status(500).json({ error: 'Erreur serveur.' });
    }
});

router.post('/gestion/garniture', async (req, res) => {
    if (!req.session || !req.session.utilisateur) {
        return res.redirect('/api/login');
    }
    const utilisateur = req.session.utilisateur;

    if (!utilisateur.permissions.includes('gerer_garnitures')) {
        return res.redirect('/api/gestion?erreur=Permission+gerer_garnitures+requise');
    }

    const { nom, prix } = req.body;
    if (!nom || !prix) {
        return res.redirect('/api/gestion?erreur=Le+nom+et+le+prix+sont+obligatoires');
    }

    try {
        await pool.query(
            `INSERT INTO garniture (nom, type, prix) VALUES ($1, 'legume', $2)`,
            [nom.trim(), parseFloat(prix)]
        );
        return res.redirect('/api/gestion?succes=Garniture+ajoutée+avec+succès');
    } catch (err) {
        console.error('Erreur ajout garniture :', err);
        return res.redirect('/api/gestion?erreur=Erreur+lors+de+l+ajout');
    }
});

export default router;
