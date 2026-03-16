const logger = require('../utils/logger');

class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

const errorHandler = (err, req, res, next) => {
    // Multer file size / upload errors
    if (err.constructor.name === 'MulterError') {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ message: 'Ficheiro demasiado grande. O tamanho máximo é 50MB.' });
        }
        return res.status(400).json({ message: `Erro no upload: ${err.message}` });
    }

    // Multer file filter error
    if (err.message === 'Apenas imagens são permitidas.') {
        return res.status(400).json({ message: err.message });
    }

    // Known operational errors
    if (err.isOperational) {
        logger.warn(`Operational error: ${err.message}`, { statusCode: err.statusCode, path: req.path });
        return res.status(err.statusCode).json({ message: err.message });
    }

    // Unknown errors
    logger.error('Unexpected error:', { error: err.message, stack: err.stack, path: req.path, method: req.method });
    res.status(500).json({ message: 'Erro interno do servidor.' });
};

module.exports = { AppError, errorHandler };
