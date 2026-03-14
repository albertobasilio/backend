/**
 * Script para remover duplicidade de receitas no banco de dados.
 * Mantém apenas o ID mais recente de cada título.
 */
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function removeDuplicates() {
    console.log('🔍 Identificando e removendo receitas duplicadas...');
    
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'sabor_inteligente',
        charset: 'utf8mb4'
    });

    try {
        // 1. Encontrar títulos duplicados
        const [duplicates] = await pool.query(
            'SELECT title, COUNT(*) as count FROM recipes GROUP BY title HAVING count > 1'
        );

        if (duplicates.length === 0) {
            console.log('✅ Nenhuma duplicidade encontrada.');
            return;
        }

        console.log(`⚠️ Encontrados ${duplicates.length} títulos com duplicidade.`);

        for (const dup of duplicates) {
            console.log(`  - Resolvendo: "${dup.title}" (${dup.count} instâncias)`);

            // Obter todos os IDs para este título, ordenados pelo ID (manter o maior/mais recente)
            const [rows] = await pool.query(
                'SELECT id FROM recipes WHERE title = ? ORDER BY id DESC',
                [dup.title]
            );

            const keeperId = rows[0].id;
            const idsToDelete = rows.slice(1).map(r => r.id);

            if (idsToDelete.length > 0) {
                // Remover referências em outras tabelas se necessário (Cascade deve tratar a maioria)
                await pool.query('DELETE FROM recipe_ingredients WHERE recipe_id IN (?)', [idsToDelete]);
                await pool.query('DELETE FROM user_favorites WHERE recipe_id IN (?)', [idsToDelete]);
                await pool.query('DELETE FROM recipes WHERE id IN (?)', [idsToDelete]);
                
                console.log(`    ✅ Mantido ID ${keeperId}, removidos IDs: ${idsToDelete.join(', ')}`);
            }
        }

        console.log('\n🌟 Limpeza de duplicidade concluída com sucesso!');
    } catch (err) {
        console.error('❌ Erro durante a limpeza:', err.message);
    } finally {
        process.exit(0);
    }
}

removeDuplicates();
