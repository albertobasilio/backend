/**
 * Script para corrigir a categorização das Badjias.
 * Retira o termo 'petisco' e define como 'matabicho' tradicional.
 */
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function fixBadjias() {
    console.log('🔄 Corrigindo a alma das Badjias no sistema...');
    
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'sabor_inteligente',
        charset: 'utf8mb4'
    });

    try {
        await pool.query(
            `UPDATE recipes SET 
                description = 'Um pilar do matabicho moçambicano. Feitas de feijão nhemba moído e fritas até ficarem douradas, as badjias são a alma das manhãs em Moçambique, tradicionalmente servidas dentro de um pão quente.',
                tags = '["matabicho", "tradicional", "nhemba", "pao-com-badjia"]'
            WHERE title = 'Badjias'`
        );
        console.log('✅ Badjias atualizadas: Agora classificadas corretamente como matabicho.');
    } catch (err) {
        console.error('❌ Erro:', err.message);
    } finally {
        process.exit(0);
    }
}

fixBadjias();
