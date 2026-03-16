const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const asyncHandler = require('../middleware/asyncHandler');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const { sendRecoveryCode } = require('../services/emailService');

// Guest Login
exports.guestLogin = asyncHandler(async (req, res) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Log the guest entry
    await db.query(
        'INSERT INTO guest_logs (ip_address, user_agent, action) VALUES (?, ?, ?)',
        [ip, userAgent, 'login']
    );

    // Create a special token for guests
    const token = jwt.sign(
        { id: 0, email: 'guest@sabor.mz', role: 'guest', plan: 'premium' },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );

    res.json({
        message: 'Acesso como visitante bem-sucedido!',
        token,
        user: {
            id: 0,
            name: 'Visitante',
            email: 'guest@sabor.mz',
            role: 'guest',
            plan: 'premium'
        }
    });
});

// Log Guest Action
exports.logGuestAction = asyncHandler(async (req, res) => {
    const { action } = req.body;
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    await db.query(
        'INSERT INTO guest_logs (ip_address, user_agent, action) VALUES (?, ?, ?)',
        [ip, userAgent, action]
    );

    res.json({ success: true });
});

// Register
exports.register = asyncHandler(async (req, res) => {
    const { name, email, password, phone, region } = req.body;

    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
        throw new AppError('Este email já está registado.', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
        'INSERT INTO users (name, email, password, phone, region, plan) VALUES (?, ?, ?, ?, ?, ?)',
        [name, email, hashedPassword, phone || null, region || 'Maputo', 'free']
    );

    // Create default dietary profile
    await db.query('INSERT INTO dietary_profiles (user_id) VALUES (?)', [result.insertId]);

    const token = jwt.sign(
        { id: result.insertId, email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );

    logger.info(`Novo utilizador registado: ${email}`);

    res.status(201).json({
        message: 'Conta criada com sucesso!',
        token,
        user: {
            id: result.insertId,
            name,
            email,
            region: region || 'Maputo',
            plan: 'free',
            role: 'user'
        }
    });
});

// Login
exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
        throw new AppError('Email ou senha incorretos.', 401);
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new AppError('Email ou senha incorretos.', 401);
    }

    const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );

    logger.info(`Login: ${email}`);

    res.json({
        message: 'Login bem-sucedido!',
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            region: user.region,
            plan: user.plan,
            role: user.role || 'user'
        }
    });
});

// Get profile
exports.getProfile = asyncHandler(async (req, res) => {
    if (req.user.id === 0) {
        return res.json({
            user: {
                id: 0,
                name: 'Visitante',
                email: 'guest@sabor.mz',
                role: 'guest',
                plan: 'premium'
            },
            dietaryProfile: {
                gluten_free: 0, vegan: 0, vegetarian: 0, low_sugar: 0,
                diabetic: 0, child_diet: 0, athlete: 0, elderly: 0, pregnant: 0,
                allergies: '', notes: ''
            }
        });
    }

    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
        throw new AppError('Utilizador não encontrado.', 404);
    }

    const [dietary] = await db.query(
        'SELECT * FROM dietary_profiles WHERE user_id = ?',
        [req.user.id]
    );

    const profile = users[0];
    res.json({
        user: {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            phone: profile.phone,
            region: profile.region,
            plan: profile.plan,
            role: profile.role || 'user',
            created_at: profile.created_at
        },
        dietaryProfile: dietary[0] || null
    });
});

// Update profile
exports.updateProfile = asyncHandler(async (req, res) => {
    if (req.user.id === 0) {
        return res.json({ message: 'Visitantes não podem alterar o perfil permanentemente.' });
    }

    const { name, phone, region } = req.body;

    const updates = [];
    const values = [];

    if (name) { updates.push('name = ?'); values.push(name); }
    if (phone !== undefined) { updates.push('phone = ?'); values.push(phone); }
    if (region) { updates.push('region = ?'); values.push(region); }

    if (updates.length === 0) {
        return res.json({ message: 'Nenhum dado para atualizar.' });
    }

    values.push(req.user.id);
    await db.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);

    const [updated] = await db.query('SELECT id, name, email, phone, region, plan, role FROM users WHERE id = ?', [req.user.id]);

    const updatedUser = updated[0];
    res.json({
        message: 'Perfil atualizado com sucesso!',
        user: {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            region: updatedUser.region,
            plan: updatedUser.plan,
            role: updatedUser.role || 'user'
        }
    });
});

// Update dietary profile
exports.updateDietaryProfile = asyncHandler(async (req, res) => {
    if (req.user.id === 0) {
        return res.json({ message: 'Visitantes não podem alterar o perfil alimentar permanentemente.' });
    }

    const {
        gluten_free, vegan, vegetarian, low_sugar,
        diabetic, child_diet, athlete, elderly, pregnant, allergies, notes
    } = req.body;

    const [existing] = await db.query('SELECT id FROM dietary_profiles WHERE user_id = ?', [req.user.id]);

    if (existing.length > 0) {
        await db.query(
            `UPDATE dietary_profiles SET 
         gluten_free=?, vegan=?, vegetarian=?, low_sugar=?, diabetic=?,
         child_diet=?, athlete=?, elderly=?, pregnant=?, allergies=?, notes=?
         WHERE user_id=?`,
            [gluten_free, vegan, vegetarian, low_sugar, diabetic,
                child_diet, athlete, elderly, pregnant, allergies, notes, req.user.id]
        );
    } else {
        await db.query(
            `INSERT INTO dietary_profiles 
         (user_id, gluten_free, vegan, vegetarian, low_sugar, diabetic, child_diet, athlete, elderly, pregnant, allergies, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [req.user.id, gluten_free, vegan, vegetarian, low_sugar, diabetic,
                child_diet, athlete, elderly, pregnant, allergies, notes]
        );
    }

    res.json({ message: 'Perfil alimentar atualizado com sucesso!' });
});

// Forgot password - send code to email
exports.forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    const [users] = await db.query('SELECT id, email FROM users WHERE LOWER(email) = ? LIMIT 1', [normalizedEmail]);

    // Always return generic success (avoid account enumeration).
    if (users.length === 0) {
        return res.json({ message: 'Se o email existir, um codigo de recuperacao foi enviado.' });
    }

    const user = users[0];
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const codeHash = await bcrypt.hash(code, 10);

    await db.query('UPDATE password_reset_codes SET used = 1 WHERE user_id = ? AND used = 0', [user.id]);
    await db.query(
        `INSERT INTO password_reset_codes (user_id, email, code_hash, expires_at, used)
         VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 15 MINUTE), 0)`,
        [user.id, user.email, codeHash]
    );

    try {
        await sendRecoveryCode({ toEmail: user.email, code });
    } catch (err) {
        throw new AppError(`Falha ao enviar email de recuperacao: ${err.message}`, 500);
    }

    res.json({ message: 'Se o email existir, um codigo de recuperacao foi enviado.' });
});

// Reset password with email + code
exports.resetPassword = asyncHandler(async (req, res) => {
    const { email, code, new_password } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    const [users] = await db.query('SELECT id FROM users WHERE LOWER(email) = ? LIMIT 1', [normalizedEmail]);
    if (users.length === 0) {
        throw new AppError('Codigo invalido ou expirado.', 400);
    }

    const userId = users[0].id;

    const [codes] = await db.query(
        `SELECT id, code_hash
         FROM password_reset_codes
         WHERE user_id = ? AND used = 0 AND expires_at > NOW()
         ORDER BY created_at DESC
         LIMIT 1`,
        [userId]
    );

    if (codes.length === 0) {
        throw new AppError('Codigo invalido ou expirado.', 400);
    }

    const isCodeValid = await bcrypt.compare(String(code), codes[0].code_hash);
    if (!isCodeValid) {
        throw new AppError('Codigo invalido ou expirado.', 400);
    }

    const newHash = await bcrypt.hash(new_password, 10);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [newHash, userId]);
    await db.query('UPDATE password_reset_codes SET used = 1 WHERE id = ?', [codes[0].id]);

    res.json({ message: 'Senha redefinida com sucesso.' });
});

