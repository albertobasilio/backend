const db = require('../config/database');
const asyncHandler = require('../middleware/asyncHandler');

// Log a meal
exports.logMeal = asyncHandler(async (req, res) => {
    const { recipe_id, meal_type, log_date, calories, protein, carbs, fat, fiber, iron } = req.body;

    await db.query(
        `INSERT INTO nutrition_logs (user_id, recipe_id, meal_type, log_date, calories, protein, carbs, fat, fiber, iron)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [req.user.id, recipe_id || null, meal_type, log_date || new Date(), calories || 0, protein || 0, carbs || 0, fat || 0, fiber || 0, iron || 0]
    );

    res.status(201).json({ message: 'Refeição registada!' });
});

// Get daily nutrition summary
exports.getDailySummary = asyncHandler(async (req, res) => {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const [rows] = await db.query(
        `SELECT 
        SUM(calories) as total_calories,
        SUM(protein) as total_protein,
        SUM(carbs) as total_carbs,
        SUM(fat) as total_fat,
        SUM(fiber) as total_fiber,
        SUM(iron) as total_iron,
        COUNT(*) as total_meals
       FROM nutrition_logs 
       WHERE user_id = ? AND log_date = ?`,
        [req.user.id, targetDate]
    );

    const [meals] = await db.query(
        `SELECT nl.*, r.title as recipe_title
       FROM nutrition_logs nl
       LEFT JOIN recipes r ON nl.recipe_id = r.id
       WHERE nl.user_id = ? AND nl.log_date = ?
       ORDER BY FIELD(nl.meal_type, 'pequeno_almoco','almoco','lanche','jantar')`,
        [req.user.id, targetDate]
    );

    res.json({ summary: rows[0], meals, date: targetDate });
});

// Get weekly nutrition summary
exports.getWeeklySummary = asyncHandler(async (req, res) => {
    const [rows] = await db.query(
        `SELECT 
        log_date,
        SUM(calories) as total_calories,
        SUM(protein) as total_protein,
        SUM(carbs) as total_carbs,
        SUM(fat) as total_fat,
        COUNT(*) as total_meals
       FROM nutrition_logs 
       WHERE user_id = ? AND log_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       GROUP BY log_date
       ORDER BY log_date`,
        [req.user.id]
    );

    res.json(rows);
});

// Get nutrition tips based on user profile
exports.getTips = asyncHandler(async (req, res) => {
    const [dietary] = await db.query('SELECT * FROM dietary_profiles WHERE user_id = ?', [req.user.id]);
    const profile = dietary[0] || {};

    const tips = [];

    tips.push({
        icon: '🍚',
        title: 'Proteína Completa',
        text: 'Combine feijão com arroz para obter todos os aminoácidos essenciais. Uma combinação económica e muito nutritiva!'
    });

    tips.push({
        icon: '🥬',
        title: 'Ferro nas Folhas',
        text: 'Couve e folhas de mandioca são ricas em ferro. Combine com limão para melhor absorção.'
    });

    if (profile.pregnant) {
        tips.push({
            icon: '🤰',
            title: 'Gestante',
            text: 'Priorize alimentos ricos em ácido fólico como feijão e folhas verdes escuras.'
        });
    }

    if (profile.diabetic) {
        tips.push({
            icon: '💉',
            title: 'Controle de Açúcar',
            text: 'Prefira mandioca e batata doce ao arroz branco. Coma mais fibras para controlar a glicemia.'
        });
    }

    if (profile.child_diet) {
        tips.push({
            icon: '👶',
            title: 'Nutrição Infantil',
            text: 'Crianças precisam de proteínas e ferro. Inclua ovo, feijão e peixe nas refeições.'
        });
    }

    if (profile.elderly) {
        tips.push({
            icon: '👴',
            title: 'Idoso',
            text: 'Prefira alimentos macios e ricos em cálcio. O leite de coco é uma boa fonte local.'
        });
    }

    tips.push({
        icon: '🥥',
        title: 'Aproveitamento Total',
        text: 'Use a casca da abóbora em sopas e o talo da couve em refogados. Nada se desperdiça!'
    });

    tips.push({
        icon: '💰',
        title: 'Economia',
        text: 'Compre vegetais da época no mercado local. São mais baratos e mais frescos!'
    });

    res.json(tips);
});
