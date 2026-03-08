const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const logger = require('./utils/logger');
const { errorHandler } = require('./middleware/errorHandler');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// --------------- Security Middleware ---------------

// Helmet - secure HTTP headers
app.use(helmet());

// CORS - restrict origins
const isProduction = process.env.NODE_ENV === 'production';

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'https://frontend-three-lovat-41.vercel.app',
    process.env.FRONTEND_URL
].filter(Boolean);

const isAllowedOrigin = (origin) => {
    // Permite requisições sem origin (como mobile apps, curl, Docker Healthcheck wget)
    if (!origin) return true;
    
    // Em desenvolvimento, permite tudo
    if (!isProduction) return true;
    
    // Em produção, verifica a whitelist
    return allowedOrigins.includes(origin);
};

app.use(cors({
    origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) {
            return callback(null, true);
        }
        // Registra o erro para facilitar debug se necessário
        logger.error(`Bloqueado pelo CORS: origin ${origin}`);
        return callback(new Error('Não permitido pelo CORS.'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    optionsSuccessStatus: 200
}));

// Global rate limiter
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    message: { message: 'Demasiadas requisições. Tente novamente em 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false
});
app.use(globalLimiter);

// Strict rate limiter for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: 'Demasiadas tentativas de login. Tente novamente em 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false
});

// Strict rate limiter for AI endpoints (expensive operations)
const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { message: 'Limite de uso de IA atingido. Tente novamente em 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false
});

// --------------- Body Parsing ---------------
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// --------------- Static Files ---------------
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --------------- Routes ---------------
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/ingredients', require('./routes/ingredientRoutes'));
app.use('/api/recipes', require('./routes/recipeRoutes'));
app.use('/api/meal-plans', require('./routes/mealPlanRoutes'));
app.use('/api/shopping-lists', require('./routes/shoppingListRoutes'));
app.use('/api/nutrition', require('./routes/nutritionRoutes'));
app.use('/api/ai', aiLimiter, require('./routes/aiRoutes'));
app.use('/api/favorites', require('./routes/favoriteRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/challenges', require('./routes/challengeRoutes'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Sabor Inteligente MZ API está funcionando.' });
});

// --------------- Error Handling ---------------
app.use(errorHandler);

// --------------- Start Server ---------------
app.listen(PORT, '0.0.0.0', () => {
    logger.info('Sabor Inteligente MZ - API Server');
    logger.info(`Servidor rodando na porta ${PORT}`);
    logger.info(`http://localhost:${PORT}`);
});

module.exports = app;
