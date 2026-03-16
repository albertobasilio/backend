const db = require('../config/database');
const asyncHandler = require('../middleware/asyncHandler');

// Create meal plan (batch insert for meals)
exports.create = asyncHandler(async (req, res) => {
    const { week_start, week_end, meals, notes } = req.body;

    const [result] = await db.query(
        'INSERT INTO meal_plans (user_id, week_start, week_end, notes) VALUES (?, ?, ?, ?)',
        [req.user.id, week_start, week_end, notes || null]
    );

    const planId = result.insertId;

    // Batch insert meal items
    if (meals && meals.length > 0) {
        const values = meals.map(meal => [
            planId, meal.recipe_id || null, meal.day_of_week, meal.meal_type, meal.custom_meal || null, meal.notes || null
        ]);
        const placeholders = values.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');
        const flat = values.flat();

        await db.query(
            `INSERT INTO meal_plan_items (meal_plan_id, recipe_id, day_of_week, meal_type, custom_meal, notes)
           VALUES ${placeholders}`,
            flat
        );
    }

    res.status(201).json({ message: 'Plano alimentar criado!', planId });
});

// Get user's meal plans (N+1 fixed with single JOIN query)
exports.getAll = asyncHandler(async (req, res) => {
    const [plans] = await db.query(
        'SELECT * FROM meal_plans WHERE user_id = ? ORDER BY week_start DESC LIMIT 10',
        [req.user.id]
    );

    if (plans.length === 0) {
        return res.json([]);
    }

    const planIds = plans.map(p => p.id);
    const placeholders = planIds.map(() => '?').join(',');

    const [allItems] = await db.query(
        `SELECT mpi.*, r.title as recipe_title, r.calories, r.estimated_cost_mt
         FROM meal_plan_items mpi
         LEFT JOIN recipes r ON mpi.recipe_id = r.id
         WHERE mpi.meal_plan_id IN (${placeholders})
         ORDER BY FIELD(mpi.day_of_week, 'segunda','terca','quarta','quinta','sexta','sabado','domingo'),
                  FIELD(mpi.meal_type, 'pequeno_almoco','almoco','lanche','jantar')`,
        planIds
    );

    // Group items by plan ID
    const itemsByPlan = {};
    for (const item of allItems) {
        if (!itemsByPlan[item.meal_plan_id]) {
            itemsByPlan[item.meal_plan_id] = [];
        }
        itemsByPlan[item.meal_plan_id].push(item);
    }

    for (const plan of plans) {
        plan.meals = itemsByPlan[plan.id] || [];
    }

    res.json(plans);
});

// Get single meal plan
exports.getById = asyncHandler(async (req, res) => {
    const [plans] = await db.query(
        'SELECT * FROM meal_plans WHERE id = ? AND user_id = ?',
        [req.params.id, req.user.id]
    );

    if (plans.length === 0) {
        return res.status(404).json({ message: 'Plano não encontrado.' });
    }

    const plan = plans[0];
    const [items] = await db.query(
        `SELECT mpi.*, r.title as recipe_title, r.calories, r.protein, r.carbs, r.fat, r.estimated_cost_mt
       FROM meal_plan_items mpi
       LEFT JOIN recipes r ON mpi.recipe_id = r.id
       WHERE mpi.meal_plan_id = ?
       ORDER BY FIELD(mpi.day_of_week, 'segunda','terca','quarta','quinta','sexta','sabado','domingo'),
                FIELD(mpi.meal_type, 'pequeno_almoco','almoco','lanche','jantar')`,
        [plan.id]
    );
    plan.meals = items;

    res.json(plan);
});

// Delete meal plan
exports.delete = asyncHandler(async (req, res) => {
    await db.query('DELETE FROM meal_plans WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Plano removido com sucesso!' });
});
