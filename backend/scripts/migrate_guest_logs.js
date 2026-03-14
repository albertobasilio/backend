const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function migrate() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'sabor_inteligente',
        charset: 'utf8mb4'
    });

    try {
        console.log('🚀 Criando tabela guest_logs...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS guest_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                ip_address VARCHAR(45),
                user_agent TEXT,
                action VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabela guest_logs criada com sucesso!');
    } catch (err) {
        console.error('❌ Erro na migração:', err.message);
    } finally {
        process.exit(0);
    }
}

migrate();
