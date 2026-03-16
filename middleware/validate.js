const { body, validationResult } = require('express-validator');

// Middleware to check validation results
const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: 'Dados inválidos.',
            errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
        });
    }
    next();
};

// Auth validations
const validateRegister = [
    body('name')
        .trim().notEmpty().withMessage('Nome é obrigatório.')
        .isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres.'),
    body('email')
        .trim().isEmail().withMessage('Email inválido.')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres.'),
    body('phone')
        .optional({ values: 'falsy' })
        .trim().isLength({ max: 20 }).withMessage('Telefone inválido.'),
    body('region')
        .optional({ values: 'falsy' })
        .trim().isLength({ max: 100 }),
    handleValidation
];

const validateLogin = [
    body('email')
        .trim().isEmail().withMessage('Email inválido.')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Senha é obrigatória.'),
    handleValidation
];

const validateForgotPassword = [
    body('email')
        .trim().isEmail().withMessage('Email invalido.')
        .normalizeEmail(),
    handleValidation
];

const validateResetPassword = [
    body('email')
        .trim().isEmail().withMessage('Email invalido.')
        .normalizeEmail(),
    body('code')
        .trim().isLength({ min: 6, max: 6 }).withMessage('Codigo deve ter 6 digitos.')
        .isNumeric().withMessage('Codigo invalido.'),
    body('new_password')
        .isLength({ min: 6 }).withMessage('Nova senha deve ter pelo menos 6 caracteres.'),
    handleValidation
];

const validateProfile = [
    body('name')
        .optional().trim().isLength({ min: 2, max: 100 }).withMessage('Nome inválido.'),
    body('phone')
        .optional({ values: 'falsy' }).trim().isLength({ max: 20 }),
    body('region')
        .optional({ values: 'falsy' }).trim().isLength({ max: 100 }),
    handleValidation
];

const validateRecipeGenerate = [
    body('ingredients')
        .isArray({ min: 1 }).withMessage('Forneça pelo menos um ingrediente.'),
    handleValidation
];

const validateMealPlan = [
    body('week_start')
        .notEmpty().withMessage('Data de início é obrigatória.')
        .isDate().withMessage('Data de início inválida.'),
    body('week_end')
        .notEmpty().withMessage('Data de fim é obrigatória.')
        .isDate().withMessage('Data de fim inválida.'),
    handleValidation
];

const validateNutritionLog = [
    body('meal_type')
        .isIn(['pequeno_almoco', 'almoco', 'jantar', 'lanche'])
        .withMessage('Tipo de refeição inválido.'),
    body('calories')
        .optional().isNumeric().withMessage('Calorias deve ser numérico.'),
    handleValidation
];

module.exports = {
    validateRegister,
    validateLogin,
    validateForgotPassword,
    validateResetPassword,
    validateProfile,
    validateRecipeGenerate,
    validateMealPlan,
    validateNutritionLog
};
