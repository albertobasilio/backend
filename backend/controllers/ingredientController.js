const db = require('../config/database');
const logger = require('../utils/logger');
const asyncHandler = require('../middleware/asyncHandler');
const { addSubstitutionsToMissing } = require('../services/substitutionService');

// Get all ingredients
exports.getAll = asyncHandler(async (req, res) => {
    const { category, search } = req.query;
    let query = 'SELECT * FROM ingredients';
    const params = [];
    const conditions = [];

    if (category) {
        conditions.push('category = ?');
        params.push(category);
    }

    if (search) {
        conditions.push('(name LIKE ? OR name_local LIKE ?)');
        params.push(`%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY name';
    const [rows] = await db.query(query, params);
    res.json(rows);
});

// Get ingredient by ID
exports.getById = asyncHandler(async (req, res) => {
    const [rows] = await db.query('SELECT * FROM ingredients WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
        return res.status(404).json({ message: 'Ingrediente não encontrado.' });
    }
    res.json(rows[0]);
});

// Save scan results (confirmed ingredients)
exports.saveScanResults = asyncHandler(async (req, res) => {
    logger.info(`Salvando scan para usuário ${req.user.id}, tipo: ${req.body.scan_type}`);
    const { scan_type, detected_ingredients, confirmed_ingredients, image_url } = req.body;

    const [result] = await db.query(
        `INSERT INTO scan_history (user_id, scan_type, detected_ingredients, confirmed_ingredients, image_url)
       VALUES (?, ?, ?, ?, ?)`,
        [
            req.user.id,
            scan_type || 'geladeira',
            JSON.stringify(detected_ingredients),
            JSON.stringify(confirmed_ingredients),
            image_url || null
        ]
    );

    res.status(201).json({
        message: 'Scan guardado com sucesso!',
        scanId: result.insertId
    });
});

// Get scan history
exports.getScanHistory = asyncHandler(async (req, res) => {
    const [rows] = await db.query(
        'SELECT * FROM scan_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
        [req.user.id]
    );
    res.json(rows);
});

// Suggest substitutions for missing ingredients
exports.getSubstitutions = asyncHandler(async (req, res) => {
    const { items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'Forneça itens para substituição.' });
    }
    const result = await addSubstitutionsToMissing(items);
    res.json({ items: result });
});
