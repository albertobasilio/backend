const db = require('../config/database');
const asyncHandler = require('../middleware/asyncHandler');

// Create shopping list (batch insert for items)
exports.create = asyncHandler(async (req, res) => {
    const { title, meal_plan_id, items } = req.body;

    const [result] = await db.query(
        'INSERT INTO shopping_lists (user_id, meal_plan_id, title) VALUES (?, ?, ?)',
        [req.user.id, meal_plan_id || null, title || 'Lista de Compras']
    );

    const listId = result.insertId;
    let totalCost = 0;

    if (items && items.length > 0) {
        const values = items.map(item => {
            totalCost += parseFloat(item.estimated_price_mt || 0);
            return [
                listId, item.ingredient_id || null, item.item_name,
                item.quantity || '', item.unit || '', item.estimated_price_mt || 0
            ];
        });
        const placeholders = values.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');
        const flat = values.flat();

        await db.query(
            `INSERT INTO shopping_list_items (shopping_list_id, ingredient_id, item_name, quantity, unit, estimated_price_mt)
           VALUES ${placeholders}`,
            flat
        );

        await db.query('UPDATE shopping_lists SET total_estimated_cost_mt = ? WHERE id = ?', [totalCost, listId]);
    }

    res.status(201).json({ message: 'Lista criada!', listId, totalCost });
});

// Get user's shopping lists (N+1 fixed with IN clause)
exports.getAll = asyncHandler(async (req, res) => {
    const [lists] = await db.query(
        'SELECT * FROM shopping_lists WHERE user_id = ? ORDER BY created_at DESC',
        [req.user.id]
    );

    if (lists.length === 0) {
        return res.json([]);
    }

    const listIds = lists.map(l => l.id);
    const placeholders = listIds.map(() => '?').join(',');

    const [allItems] = await db.query(
        `SELECT * FROM shopping_list_items WHERE shopping_list_id IN (${placeholders})`,
        listIds
    );

    // Group items by list ID
    const itemsByList = {};
    for (const item of allItems) {
        if (!itemsByList[item.shopping_list_id]) {
            itemsByList[item.shopping_list_id] = [];
        }
        itemsByList[item.shopping_list_id].push(item);
    }

    for (const list of lists) {
        list.items = itemsByList[list.id] || [];
    }

    res.json(lists);
});

// Toggle item purchased
exports.toggleItem = asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    await db.query(
        'UPDATE shopping_list_items SET is_purchased = NOT is_purchased WHERE id = ?',
        [itemId]
    );
    res.json({ message: 'Item atualizado!' });
});

// Delete shopping list
exports.delete = asyncHandler(async (req, res) => {
    await db.query('DELETE FROM shopping_lists WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Lista removida!' });
});

// Generate smart shopping list from meal plan (batch insert)
exports.generateFromMealPlan = asyncHandler(async (req, res) => {
    const { meal_plan_id, available_ingredients } = req.body;

    const [items] = await db.query(
        `SELECT DISTINCT ri.ingredient_name, ri.quantity, ri.unit, i.avg_price_mt, i.id as ingredient_id
       FROM meal_plan_items mpi
       JOIN recipe_ingredients ri ON mpi.recipe_id = ri.recipe_id
       LEFT JOIN ingredients i ON ri.ingredient_id = i.id
       WHERE mpi.meal_plan_id = ?`,
        [meal_plan_id]
    );

    const availableNames = (available_ingredients || []).map(n => n.toLowerCase());
    const needed = items.filter(item =>
        !availableNames.includes((item.ingredient_name || '').toLowerCase())
    );

    const listItems = needed.map(item => ({
        ingredient_id: item.ingredient_id,
        item_name: item.ingredient_name,
        quantity: item.quantity,
        unit: item.unit,
        estimated_price_mt: item.avg_price_mt || 0
    }));

    const [result] = await db.query(
        'INSERT INTO shopping_lists (user_id, meal_plan_id, title) VALUES (?, ?, ?)',
        [req.user.id, meal_plan_id, 'Lista Inteligente']
    );

    let totalCost = 0;

    if (listItems.length > 0) {
        const values = listItems.map(item => {
            totalCost += parseFloat(item.estimated_price_mt || 0);
            return [
                result.insertId, item.ingredient_id, item.item_name,
                item.quantity, item.unit, item.estimated_price_mt
            ];
        });
        const placeholders = values.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');
        const flat = values.flat();

        await db.query(
            `INSERT INTO shopping_list_items (shopping_list_id, ingredient_id, item_name, quantity, unit, estimated_price_mt)
           VALUES ${placeholders}`,
            flat
        );
    }

    await db.query('UPDATE shopping_lists SET total_estimated_cost_mt = ? WHERE id = ?', [totalCost, result.insertId]);

    res.status(201).json({
        message: 'Lista inteligente gerada!',
        listId: result.insertId,
        totalCost,
        items: listItems
    });
});
