const winston = require('winston');
const path = require('path');

const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: 'sabor-inteligente' },
    transports: [
        // Console transport with colors for development
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.printf(({ timestamp, level, message, ...meta }) => {
                    const metaStr = Object.keys(meta).length > 1 ? ` ${JSON.stringify(meta)}` : '';
                    return `${timestamp} [${level}]: ${message}${metaStr}`;
                })
            )
        }),
        // File transport for errors
        new winston.transports.File({
            filename: path.join(__dirname, '..', 'logs', 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 3
        }),
        // File transport for all logs
        new winston.transports.File({
            filename: path.join(__dirname, '..', 'logs', 'combined.log'),
            maxsize: 5242880,
            maxFiles: 3
        })
    ]
});

module.exports = logger;
