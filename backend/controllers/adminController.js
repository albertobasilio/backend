const db = require('../config/database');
const asyncHandler = require('../middleware/asyncHandler');
const { AppError } = require('../middleware/errorHandler');
const { PLAN_ORDER } = require('../config/accessLevels');

const VALID_ROLES = ['user', 'admin'];

exports.getUsers = asyncHandler(async (req, res) => {
    const [users] = await db.query(
        `SELECT id, name, email, phone, region, plan, role, scan_count, last_scan_date, created_at
         FROM users
         ORDER BY created_at DESC`
    );

    res.json(users);
});

exports.updateUserAccess = asyncHandler(async (req, res) => {
    const { plan, role } = req.body;
    const userId = Number(req.params.id);

    if (!userId) {
        throw new AppError('ID de utilizador invalido.', 400);
    }

    if (plan && !PLAN_ORDER.includes(plan)) {
        throw new AppError('Plano invalido.', 400);
    }

    if (role && !VALID_ROLES.includes(role)) {
        throw new AppError('Role invalida.', 400);
    }

    const [existing] = await db.query('SELECT id, role FROM users WHERE id = ? LIMIT 1', [userId]);
    if (existing.length === 0) {
        throw new AppError('Utilizador nao encontrado.', 404);
    }

    const fields = [];
    const params = [];

    if (plan) {
        fields.push('plan = ?');
        params.push(plan);
    }
    if (role) {
        fields.push('role = ?');
        params.push(role);
    }

    if (fields.length === 0) {
        throw new AppError('Nada para atualizar.', 400);
    }

    params.push(userId);
    await db.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);

    const [updated] = await db.query(
        'SELECT id, name, email, plan, role, created_at FROM users WHERE id = ? LIMIT 1',
        [userId]
    );

    res.json({
        message: 'Acesso do utilizador atualizado com sucesso.',
        user: updated[0]
    });
});

exports.getMetrics = asyncHandler(async (req, res) => {
    const [[usersCount]] = await db.query('SELECT COUNT(*) as total FROM users');
    const [[newUsers7d]] = await db.query(
        'SELECT COUNT(*) as total FROM users WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)'
    );
    const [[scans7d]] = await db.query(
        'SELECT COUNT(*) as total FROM scan_history WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)'
    );
    const [[activeUsers7d]] = await db.query(
        `SELECT COUNT(DISTINCT user_id) as total FROM (
            SELECT user_id FROM scan_history WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            UNION
            SELECT user_id FROM user_favorites WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            UNION
            SELECT user_id FROM meal_plans WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        ) t`
    );
    const [plans] = await db.query(
        'SELECT plan, COUNT(*) as total FROM users GROUP BY plan'
    );
    const [topRecipes] = await db.query(
        `SELECT r.id, r.title, COUNT(uf.id) as favorites
         FROM recipes r
         LEFT JOIN user_favorites uf ON uf.recipe_id = r.id
         GROUP BY r.id
         ORDER BY favorites DESC
         LIMIT 5`
    );

    res.json({
        users_total: usersCount.total,
        users_new_7d: newUsers7d.total,
        scans_7d: scans7d.total,
        active_users_7d: activeUsers7d.total,
        plans,
        top_recipes: topRecipes
    });
});

exports.listRecipes = asyncHandler(async (req, res) => {
    const { search, min_plan } = req.query;
    let query = 'SELECT * FROM recipes';
    const params = [];
    const conditions = [];

    if (search) {
        conditions.push('(title LIKE ? OR description LIKE ?)');
        params.push(`%${search}%`, `%${search}%`);
    }
    if (min_plan) {
        conditions.push('min_plan = ?');
        params.push(min_plan);
    }
    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY created_at DESC';

    const [rows] = await db.query(query, params);
    res.json(rows);
});

exports.createRecipe = asyncHandler(async (req, res) => {
    const {
        title, description, instructions, prep_time_min, cook_time_min,
        servings, difficulty, region, estimated_cost_mt, calories,
        protein, carbs, fat, fiber, iron, tags, ingredients, min_plan, is_regional_exclusive
    } = req.body;

    if (!title || !instructions) {
        throw new AppError('Título e instruções são obrigatórios.', 400);
    }

    const [result] = await db.query(
        `INSERT INTO recipes (title, description, instructions, prep_time_min, cook_time_min,
         servings, difficulty, region, estimated_cost_mt, is_ai_generated, calories,
         protein, carbs, fat, fiber, iron, tags, min_plan, is_regional_exclusive)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            title, description || null, instructions, prep_time_min || 0, cook_time_min || 0,
            servings || 4, difficulty || 'facil', region || null, estimated_cost_mt || 0,
            calories || 0, protein || 0, carbs || 0, fat || 0, fiber || 0, iron || 0,
            tags ? JSON.stringify(tags) : null, min_plan || 'free', is_regional_exclusive ? 1 : 0
        ]
    );

    if (ingredients && ingredients.length > 0) {
        const values = ingredients.map(ing => [
            result.insertId, ing.name, ing.quantity, ing.unit, ing.is_optional || false, ing.substitute || null
        ]);
        const placeholders = values.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');
        const flat = values.flat();
        await db.query(
            `INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, is_optional, substitute)
             VALUES ${placeholders}`,
            flat
        );
    }

    res.status(201).json({ message: 'Receita criada com sucesso!', recipeId: result.insertId });
});

exports.updateRecipe = asyncHandler(async (req, res) => {
    const recipeId = Number(req.params.id);
    if (!recipeId) throw new AppError('ID de receita inválido.', 400);

    const {
        title, description, instructions, prep_time_min, cook_time_min,
        servings, difficulty, region, estimated_cost_mt, calories,
        protein, carbs, fat, fiber, iron, tags, min_plan, is_regional_exclusive
    } = req.body;

    const fields = [];
    const params = [];
    const addField = (field, value) => {
        fields.push(`${field} = ?`);
        params.push(value);
    };

    if (title !== undefined) addField('title', title);
    if (description !== undefined) addField('description', description);
    if (instructions !== undefined) addField('instructions', instructions);
    if (prep_time_min !== undefined) addField('prep_time_min', prep_time_min);
    if (cook_time_min !== undefined) addField('cook_time_min', cook_time_min);
    if (servings !== undefined) addField('servings', servings);
    if (difficulty !== undefined) addField('difficulty', difficulty);
    if (region !== undefined) addField('region', region);
    if (estimated_cost_mt !== undefined) addField('estimated_cost_mt', estimated_cost_mt);
    if (calories !== undefined) addField('calories', calories);
    if (protein !== undefined) addField('protein', protein);
    if (carbs !== undefined) addField('carbs', carbs);
    if (fat !== undefined) addField('fat', fat);
    if (fiber !== undefined) addField('fiber', fiber);
    if (iron !== undefined) addField('iron', iron);
    if (tags !== undefined) addField('tags', tags ? JSON.stringify(tags) : null);
    if (min_plan !== undefined) addField('min_plan', min_plan);
    if (is_regional_exclusive !== undefined) addField('is_regional_exclusive', is_regional_exclusive ? 1 : 0);

    if (fields.length === 0) throw new AppError('Nada para atualizar.', 400);

    params.push(recipeId);
    await db.query(`UPDATE recipes SET ${fields.join(', ')} WHERE id = ?`, params);

    const [updated] = await db.query('SELECT * FROM recipes WHERE id = ? LIMIT 1', [recipeId]);
    res.json({ message: 'Receita atualizada com sucesso.', recipe: updated[0] });
});

exports.deleteRecipe = asyncHandler(async (req, res) => {
    const recipeId = Number(req.params.id);
    if (!recipeId) throw new AppError('ID de receita inválido.', 400);

    await db.query('DELETE FROM recipes WHERE id = ?', [recipeId]);
    res.json({ message: 'Receita removida com sucesso.' });
});
