// ================================================================
// modules/auth/auth.service.js
// Logique métier : register (clients) + login (tous)
// ================================================================

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../../Config/db.js';

const JWT_SECRET  = process.env.JWT_SECRET ;


async function getUserAvecPermissions(nomUtilisateur) {
    const { rows } = await pool.query(
        `SELECT
             u.id,
             u.nom_utilisateur,
             u.email,
             u.mot_de_passe,
             g.id   AS groupe_id,
             g.nom  AS groupe_nom,
             COALESCE(
                 ARRAY_AGG(p.nom ORDER BY p.nom) FILTER (WHERE p.nom IS NOT NULL),
                 '{}'
             ) AS permissions
         FROM "user" u
         LEFT JOIN groupe            g  ON u.groupe_id    = g.id
         LEFT JOIN groupe_permission gp ON g.id           = gp.groupe_id
         LEFT JOIN permission        p  ON gp.permission_id = p.id
         WHERE u.nom_utilisateur = $1
         GROUP BY u.id, u.nom_utilisateur, u.email, u.mot_de_passe, g.id, g.nom`,
        [nomUtilisateur]
    );
    return rows[0] || null;
}


function genererToken(user) {
    const payload = {
        id:             user.id,
        nomUtilisateur: user.nom_utilisateur,
        email:          user.email,
        groupe:         user.groupe_nom,
        permissions:    user.permissions
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}


export async function registerClient({ nomUtilisateur, email, motDePasse }) {
    const { rows: groupeRows } = await pool.query(
        `SELECT id FROM groupe WHERE nom = 'client'`
    );
    if (groupeRows.length === 0) {
        throw new Error("Groupe 'client' introuvable en base de données.");
    }
    const groupeId = groupeRows[0].id;

    const hash = await bcrypt.hash(motDePasse, 10);

    try {
        const { rows } = await pool.query(
            `INSERT INTO "user" (nom_utilisateur, email, mot_de_passe, groupe_id)
             VALUES ($1, $2, $3, $4)
             RETURNING id, nom_utilisateur, email`,
            [nomUtilisateur, email, hash, groupeId]
        );
        return rows[0];
    } catch (err) {
        if (err.code === '23505') {
            if (err.constraint && err.constraint.includes('email')) {
                throw new Error('Cet email est déjà utilisé.');
            }
            throw new Error("Ce nom d'utilisateur est déjà pris.");
        }
        throw err;
    }
}

export async function loginUtilisateur({ nomUtilisateur, motDePasse }) {
    const user = await getUserAvecPermissions(nomUtilisateur);

    if (!user) return null;

    const motDePasseValide = await bcrypt.compare(motDePasse, user.mot_de_passe);
    if (!motDePasseValide) return null;

    const token = genererToken(user);

    return {
        token,
        user: {
            id:             user.id,
            nomUtilisateur: user.nom_utilisateur,
            email:          user.email,
            groupe:         user.groupe_nom,
            permissions:    user.permissions
        }
    };
}
