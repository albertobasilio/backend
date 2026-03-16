const jwt = require('jsonwebtoken');
const db = require('../config/database');
require('dotenv').config();

const auth = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'Acesso negado. Token nao fornecido.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role === 'guest') {
            req.user = {
                ...decoded,
                plan: 'premium'
            };
            return next();
        }

        const [users] = await db.query('SELECT * FROM users WHERE id = ? LIMIT 1', [decoded.id]);

        if (users.length === 0) {
            return res.status(401).json({ message: 'Utilizador nao encontrado.' });
        }

        req.user = {
            ...decoded,
            plan: users[0].plan || 'free',
            role: users[0].role || 'user'
        };

        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token invalido ou expirado.' });
    }
};

module.exports = auth;
