const jwt = require('jsonwebtoken');
const db = require('../config/database');

const optionalAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const [users] = await db.query(
            'SELECT id, email, plan, role FROM users WHERE id = ? LIMIT 1',
            [decoded.id]
        );
        if (users.length > 0) {
            req.user = {
                id: users[0].id,
                email: users[0].email,
                plan: users[0].plan || 'free',
                role: users[0].role || 'user'
            };
        }
    } catch (err) {
        // Invalid token -> treat as anonymous
    }

    return next();
};

module.exports = optionalAuth;
