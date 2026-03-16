const db = require('../config/database');
const asyncHandler = require('../middleware/asyncHandler');
const { PLAN_ORDER, hasRequiredPlan } = require('../config/accessLevels');

// Add recipe to favorites
exports.add = asyncHandler(async (req, res) => {
    const { recipe_id } = req.body;
    const [recipes] = await db.query('SELECT min_plan FROM recipes WHERE id = ? LIMIT 1', [recipe_id]);
    if (recipes.length === 0) {
        return res.status(404).json({ message: 'Receita não encontrada.' });
    }
    const minPlan = PLAN_ORDER.includes(recipes[0].min_plan) ? recipes[0].min_plan : 'free';
    const userPlan = PLAN_ORDER.includes(req.user?.plan) ? req.user.plan : 'free';
    const isAdmin = req.user?.role === 'admin';
    if (!isAdmin && !hasRequiredPlan(userPlan, minPlan)) {
        return res.status(403).json({ message: `Plano ${minPlan} ou superior necessário para favoritar esta receita.` });
    }

    // Check if already favorited
    const [existing] = await db.query(
        'SELECT id FROM user_favorites WHERE user_id = ? AND recipe_id = ?',
        [req.user.id, recipe_id]
    );

    if (existing.length > 0) {
        return res.status(400).json({ message: 'Receita já está nos favoritos.' });
    }

    await db.query(
        'INSERT INTO user_favorites (user_id, recipe_id) VALUES (?, ?)',
        [req.user.id, recipe_id]
    );

    res.status(201).json({ message: 'Adicionada aos favoritos! ❤️' });
});

// Remove recipe from favorites
exports.remove = asyncHandler(async (req, res) => {
    await db.query(
        'DELETE FROM user_favorites WHERE user_id = ? AND recipe_id = ?',
        [req.user.id, req.params.recipeId]
    );

    res.json({ message: 'Removida dos favoritos.' });
});

// Get all user favorites
exports.getAll = asyncHandler(async (req, res) => {
    const [rows] = await db.query(
        `SELECT r.*, uf.created_at as favorited_at
       FROM user_favorites uf
       JOIN recipes r ON uf.recipe_id = r.id
       WHERE uf.user_id = ?
       ORDER BY uf.created_at DESC`,
        [req.user.id]
    );

    const userPlan = PLAN_ORDER.includes(req.user?.plan) ? req.user.plan : 'free';
    const isAdmin = req.user?.role === 'admin';
    const mapped = rows.map(r => {
        const minPlan = PLAN_ORDER.includes(r.min_plan) ? r.min_plan : 'free';
        const isLocked = !isAdmin && !hasRequiredPlan(userPlan, minPlan);
        return { ...r, min_plan: minPlan, is_locked: isLocked };
    });

    res.json(mapped);
});

// Check if recipe is favorited
exports.check = asyncHandler(async (req, res) => {
    const [rows] = await db.query(
        'SELECT id FROM user_favorites WHERE user_id = ? AND recipe_id = ?',
        [req.user.id, req.params.recipeId]
    );

    res.json({ is_favorite: rows.length > 0 });
});
