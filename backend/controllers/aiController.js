const db = require('../config/database');
const aiService = require('../services/aiService');
const logger = require('../utils/logger');
const asyncHandler = require('../middleware/asyncHandler');
const sharp = require('sharp');
const { PLAN_SCAN_LIMITS } = require('../config/accessLevels');
const { addSubstitutionsToMissing } = require('../services/substitutionService');

// Compress image to max 800px width, JPEG 60% quality (keeps it under Groq limit)
const compressImage = async (buffer) => {
    return sharp(buffer)
        .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 60 })
        .toBuffer();
};

// Analyze image with AI
exports.analyzeImage = asyncHandler(async (req, res) => {
    if (!req.file && !req.body.image) {
        return res.status(400).json({ message: 'Forneca uma imagem.' });
    }

    const userId = req.user.id;
    const [users] = await db.query('SELECT plan FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
        return res.status(404).json({ message: 'Utilizador nao encontrado.' });
    }

    const user = users[0];
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD (UTC)
    const isAdmin = req.user.role === 'admin';
    const userPlan = user.plan || 'free';
    const limit = PLAN_SCAN_LIMITS[userPlan] || PLAN_SCAN_LIMITS.free;

    // Reserve scan slot atomically to prevent parallel bypass of limits.
    let reservedScan = false;
    if (!isAdmin) {
        const [reserveResult] = await db.query(
            `UPDATE users
             SET scan_count = CASE WHEN last_scan_date = ? THEN scan_count + 1 ELSE 1 END,
                 last_scan_date = ?
             WHERE id = ?
               AND (CASE WHEN last_scan_date = ? THEN scan_count ELSE 0 END) < ?`,
            [today, today, userId, today, limit]
        );

        if (reserveResult.affectedRows === 0) {
            const suggestedPlan = userPlan === 'free' ? 'basic' : userPlan === 'basic' ? 'pro' : 'premium';
            return res.status(403).json({
                message: `Voce atingiu o limite diario de ${limit} scans no plano ${userPlan}. Faça upgrade para o plano ${suggestedPlan} e continue escaneando hoje.`,
                limitReached: true,
                currentPlan: userPlan,
                suggestedPlan
            });
        }
        reservedScan = true;
    }

    try {
        let imageBase64;
        if (req.file) {
            const compressed = await compressImage(req.file.buffer);
            imageBase64 = compressed.toString('base64');
        } else {
            const raw = req.body.image.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(raw, 'base64');
            const compressed = await compressImage(buffer);
            imageBase64 = compressed.toString('base64');
        }

        const result = await aiService.analyzeImage(imageBase64);

        const matchedIngredients = [];
        for (const detected of result.ingredients) {
            const [rows] = await db.query(
                'SELECT * FROM ingredients WHERE name LIKE ? OR name_local LIKE ? LIMIT 1',
                [`%${detected.name}%`, `%${detected.name}%`]
            );
            matchedIngredients.push({
                ...detected,
                db_match: rows.length > 0 ? rows[0] : null
            });
        }

        let remainingScans = null;
        if (!isAdmin) {
            const [updatedUsers] = await db.query(
                'SELECT scan_count FROM users WHERE id = ? LIMIT 1',
                [userId]
            );
            const currentScanCount = updatedUsers[0]?.scan_count || 0;
            remainingScans = Math.max(limit - currentScanCount, 0);
        }

        res.json({
            detected: matchedIngredients,
            total_found: result.total_found || matchedIngredients.length,
            remaining_scans: remainingScans
        });
    } catch (err) {
        // Roll back reserved slot on processing failure.
        if (!isAdmin && reservedScan) {
            await db.query(
                'UPDATE users SET scan_count = GREATEST(scan_count - 1, 0) WHERE id = ? AND last_scan_date = ?',
                [userId, today]
            );
        }
        throw err;
    }
});

// Generate recipes from ingredients
exports.generateRecipes = asyncHandler(async (req, res) => {
    const { ingredients, dietary_profile } = req.body;
    logger.info(`Recebido pedido de geracao de receitas para ${ingredients ? ingredients.length : 0} ingredientes`);

    if (!ingredients || ingredients.length === 0) {
        return res.status(400).json({ message: 'Forneca ingredientes.' });
    }

    const result = await aiService.generateRecipes(ingredients, dietary_profile || {});

    const enrichMissing = async (recipes) => {
        if (!Array.isArray(recipes)) return [];
        const enriched = [];
        for (const recipe of recipes) {
            if (recipe.missing_ingredients && recipe.missing_ingredients.length > 0) {
                const missingWithSubs = await addSubstitutionsToMissing(recipe.missing_ingredients);
                enriched.push({ ...recipe, missing_ingredients: missingWithSubs });
            } else {
                enriched.push(recipe);
            }
        }
        return enriched;
    };

    result.suggested_recipes = await enrichMissing(result.suggested_recipes || result.optional_recipes || []);
    if (!result.optional_recipes && result.suggested_recipes) {
        result.optional_recipes = result.suggested_recipes;
    }

    res.json(result);
});

// Enrich recipe instructions with AI
exports.enrichInstructions = asyncHandler(async (req, res) => {
    const { title, description, ingredients, current_instructions } = req.body;
    logger.info(`Enriquecendo instrucoes para: ${title}`);

    if (!title) {
        return res.status(400).json({ message: 'Forneca o titulo da receita.' });
    }

    const result = await aiService.enrichInstructions(title, description, ingredients || [], current_instructions || '');
    res.json(result);
});
