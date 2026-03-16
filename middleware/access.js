const { AppError } = require('./errorHandler');
const { hasRequiredPlan } = require('../config/accessLevels');

const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new AppError('Nao autenticado.', 401));
        }

        const role = req.user.role || 'user';
        if (!allowedRoles.includes(role)) {
            return next(new AppError('Sem permissao para este recurso.', 403));
        }

        next();
    };
};

const requirePlan = (requiredPlan) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new AppError('Nao autenticado.', 401));
        }

        if (req.user.role === 'admin') {
            return next();
        }

        const currentPlan = req.user.plan || 'free';
        if (!hasRequiredPlan(currentPlan, requiredPlan)) {
            return next(new AppError(`Plano ${requiredPlan} ou superior necessario para este recurso.`, 403));
        }

        next();
    };
};

module.exports = {
    requireRole,
    requirePlan
};
