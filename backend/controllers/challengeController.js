const db = require('../config/database');
const asyncHandler = require('../middleware/asyncHandler');
const { AppError } = require('../middleware/errorHandler');
const { PLAN_ORDER, hasRequiredPlan } = require('../config/accessLevels');

const normalizePlan = (plan) => (PLAN_ORDER.includes(plan) ? plan : 'free');

const getProgressForChallenge = async (userId, challenge) => {
    const { type, start_date, end_date } = challenge;
    if (type === 'scan_count') {
        const [rows] = await db.query(
            'SELECT COUNT(*) as total FROM scan_history WHERE user_id = ? AND DATE(created_at) BETWEEN ? AND ?',
            [userId, start_date, end_date]
        );
        return rows[0]?.total || 0;
    }
    if (type === 'meal_plan_created') {
        const [rows] = await db.query(
            'SELECT COUNT(*) as total FROM meal_plans WHERE user_id = ? AND DATE(created_at) BETWEEN ? AND ?',
            [userId, start_date, end_date]
        );
        return rows[0]?.total || 0;
    }
    if (type === 'favorites_added') {
        const [rows] = await db.query(
            'SELECT COUNT(*) as total FROM user_favorites WHERE user_id = ? AND DATE(created_at) BETWEEN ? AND ?',
            [userId, start_date, end_date]
        );
        return rows[0]?.total || 0;
    }
    return 0;
};

exports.getActive = asyncHandler(async (req, res) => {
    const userPlan = normalizePlan(req.user?.plan);
    const [challenges] = await db.query(
        `SELECT * FROM challenges
         WHERE is_active = 1
           AND start_date <= CURDATE()
           AND end_date >= CURDATE()
         ORDER BY start_date DESC`
    );

    const filtered = challenges.filter(c => hasRequiredPlan(userPlan, normalizePlan(c.min_plan)));

    const [joinedRows] = await db.query(
        'SELECT challenge_id FROM user_challenges WHERE user_id = ?',
        [req.user.id]
    );
    const joinedSet = new Set(joinedRows.map(r => r.challenge_id));

    const enriched = [];
    for (const ch of filtered) {
        const progress = await getProgressForChallenge(req.user.id, ch);
        const completed = progress >= ch.target_value;
        enriched.push({
            ...ch,
            joined: joinedSet.has(ch.id),
            progress,
            completed
        });
    }

    res.json(enriched);
});

exports.join = asyncHandler(async (req, res) => {
    const challengeId = Number(req.params.id);
    if (!challengeId) throw new AppError('Desafio inválido.', 400);

    const [rows] = await db.query('SELECT * FROM challenges WHERE id = ? LIMIT 1', [challengeId]);
    if (rows.length === 0) throw new AppError('Desafio não encontrado.', 404);

    const challenge = rows[0];
    const userPlan = normalizePlan(req.user?.plan);
    if (!hasRequiredPlan(userPlan, normalizePlan(challenge.min_plan))) {
        throw new AppError(`Plano ${challenge.min_plan} ou superior necessário para este desafio.`, 403);
    }

    await db.query(
        'INSERT IGNORE INTO user_challenges (user_id, challenge_id) VALUES (?, ?)',
        [req.user.id, challengeId]
    );

    res.json({ message: 'Desafio ativado com sucesso!' });
});

exports.getMyChallenges = asyncHandler(async (req, res) => {
    const [rows] = await db.query(
        `SELECT c.*, uc.joined_at, uc.completed_at
         FROM user_challenges uc
         JOIN challenges c ON c.id = uc.challenge_id
         WHERE uc.user_id = ?
         ORDER BY c.end_date DESC`,
        [req.user.id]
    );

    const enriched = [];
    for (const ch of rows) {
        const progress = await getProgressForChallenge(req.user.id, ch);
        const completed = progress >= ch.target_value;
        enriched.push({ ...ch, progress, completed });
    }

    res.json(enriched);
});
