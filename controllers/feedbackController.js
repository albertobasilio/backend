const db = require('../config/database');
const asyncHandler = require('../middleware/asyncHandler');
const { AppError } = require('../middleware/errorHandler');

// General App Feedback
exports.submitFeedback = asyncHandler(async (req, res) => {
    const { rating, suggestion } = req.body;
    const userId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
        throw new AppError('Por favor, forneça uma classificação válida (1-5).', 400);
    }

    await db.query(
        'INSERT INTO feedback (user_id, rating, suggestion) VALUES (?, ?, ?)',
        [userId, rating, suggestion]
    );

    res.status(201).json({
        success: true,
        message: 'Feedback enviado com sucesso! Obrigado.'
    });
});

exports.getAllFeedback = asyncHandler(async (req, res) => {
    const [rows] = await db.query(
        'SELECT f.*, u.name as user_name, u.email as user_email FROM feedback f LEFT JOIN users u ON f.user_id = u.id ORDER BY f.created_at DESC'
    );

    res.json(rows);
});

// Recipe Specific Feedback/Ratings
exports.submitRecipeReview = asyncHandler(async (req, res) => {
    const { recipe_id, rating, comment } = req.body;
    const userId = req.user.id;

    if (!recipe_id || !rating || rating < 1 || rating > 5) {
        throw new AppError('Dados inválidos para a avaliação.', 400);
    }

    // Check if recipe exists
    const [recipes] = await db.query('SELECT id FROM recipes WHERE id = ?', [recipe_id]);
    if (recipes.length === 0) {
        throw new AppError('Receita não encontrada.', 404);
    }

    // Upsert review (one per user per recipe)
    const [existing] = await db.query(
        'SELECT id FROM recipe_reviews WHERE user_id = ? AND recipe_id = ?',
        [userId, recipe_id]
    );

    if (existing.length > 0) {
        await db.query(
            'UPDATE recipe_reviews SET rating = ?, comment = ?, created_at = CURRENT_TIMESTAMP WHERE id = ?',
            [rating, comment, existing[0].id]
        );
    } else {
        await db.query(
            'INSERT INTO recipe_reviews (user_id, recipe_id, rating, comment) VALUES (?, ?, ?, ?)',
            [userId, recipe_id, rating, comment]
        );
    }

    res.status(201).json({
        success: true,
        message: 'Avaliação enviada com sucesso!'
    });
});

exports.getRecipeReviews = asyncHandler(async (req, res) => {
    const { recipe_id } = req.params;

    const [rows] = await db.query(
        `SELECT r.*, u.name as user_name 
         FROM recipe_reviews r 
         LEFT JOIN users u ON r.user_id = u.id 
         WHERE r.recipe_id = ? 
         ORDER BY r.created_at DESC`,
        [recipe_id]
    );

    // Calculate average rating
    const [stats] = await db.query(
        'SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM recipe_reviews WHERE recipe_id = ?',
        [recipe_id]
    );

    res.json({
        reviews: rows,
        stats: {
            average: parseFloat(stats[0].avg_rating) || 0,
            total: stats[0].count
        }
    });
});
