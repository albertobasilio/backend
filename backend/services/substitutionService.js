const db = require('../config/database');

const STATIC_SUBSTITUTIONS = {
    'tomate': ['tomate em lata', 'polpa de tomate', 'pimento'],
    'cebola': ['cebola roxa', 'cebola seca', 'alho-francês'],
    'alho': ['alho em pó', 'cebola', 'gengibre'],
    'couve': ['repolho', 'alface', 'espinafre'],
    'leite de coco': ['coco ralado + água morna', 'leite de amendoim', 'natas leves'],
    'amendoim': ['pasta de amendoim', 'castanha de caju', 'amêndoa'],
    'mandioca': ['batata doce', 'inhame', 'batata'],
    'arroz': ['milho', 'massa', 'cuscuz'],
    'feijão': ['feijão nhemba', 'feijão manteiga', 'grão-de-bico'],
    'frango': ['peixe', 'carne de vaca', 'ovo'],
    'peixe': ['frango', 'camarão', 'carne de vaca'],
    'camarão': ['peixe', 'frango', 'carne de vaca'],
    'piri-piri': ['malagueta', 'pimenta', 'piripíri em pó'],
    'limão': ['lima', 'vinagre', 'sumo de tamarindo']
};

const normalize = (name) => String(name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const getCategoryAlternatives = async (ingredientName) => {
    const [rows] = await db.query(
        'SELECT name, category FROM ingredients WHERE name LIKE ? OR name_local LIKE ? LIMIT 1',
        [`%${ingredientName}%`, `%${ingredientName}%`]
    );
    if (rows.length === 0) return [];
    const found = rows[0];
    const [alts] = await db.query(
        'SELECT name FROM ingredients WHERE category = ? AND name <> ? ORDER BY RAND() LIMIT 3',
        [found.category, found.name]
    );
    return alts.map(a => a.name);
};

const getSubstitutionsForItem = async (name) => {
    const key = normalize(name);
    if (STATIC_SUBSTITUTIONS[key]) {
        return STATIC_SUBSTITUTIONS[key];
    }
    const alt = await getCategoryAlternatives(name);
    return alt;
};

const addSubstitutionsToMissing = async (missingList) => {
    if (!Array.isArray(missingList)) return [];
    const enriched = [];
    for (const item of missingList) {
        const name = typeof item === 'string' ? item : item.name;
        const substitutions = await getSubstitutionsForItem(name);
        if (typeof item === 'string') {
            enriched.push({ name, substitutions });
        } else {
            enriched.push({ ...item, substitutions });
        }
    }
    return enriched;
};

module.exports = {
    addSubstitutionsToMissing,
    getSubstitutionsForItem
};
