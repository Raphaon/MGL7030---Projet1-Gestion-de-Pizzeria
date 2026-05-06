
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export function requireAuth(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            error: 'Token manquant. Veuillez vous connecter.'
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;  
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Session expirée. Veuillez vous reconnecter.' });
        }
        return res.status(401).json({ error: 'Token invalide.' });
    }
}


export function requirePermission(permissionNom) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Non authentifié.' });
        }

        const permissions = req.user.permissions || [];

        if (permissions.includes(permissionNom)) {
            return next();
        }

        return res.status(403).json({
            error: `Accès refusé. Permission requise : "${permissionNom}".`,
            votreGroupe: req.user.groupe,
            vosPermissions: permissions
        });
    };
}

export function requireGroupe(groupeNom) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Non authentifié.' });
        }

        if (req.user.groupe === groupeNom) {
            return next();
        }

        return res.status(403).json({
            error: `Accès réservé au groupe "${groupeNom}".`,
            votreGroupe: req.user.groupe
        });
    };
}
