const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function fullCleanup() {
    console.log('🚀 Iniciando limpeza profunda do banco de dados...');
    
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'sabor_inteligente',
        charset: 'utf8mb4'
    });

    try {
        // --- PARTE 1: REMOVER DUPLICATAS ---
        console.log('\n🔍 Parte 1: Removendo duplicatas...');
        const [duplicates] = await pool.query(
            'SELECT title, COUNT(*) as count FROM recipes GROUP BY title HAVING count > 1'
        );

        if (duplicates.length === 0) {
            console.log('✅ Nenhuma duplicidade encontrada.');
        } else {
            for (const dup of duplicates) {
                const [rows] = await pool.query(
                    'SELECT id FROM recipes WHERE title = ? ORDER BY id DESC',
                    [dup.title]
                );
                const keeperId = rows[0].id;
                const idsToDelete = rows.slice(1).map(r => r.id);
                if (idsToDelete.length > 0) {
                    await pool.query('DELETE FROM recipe_ingredients WHERE recipe_id IN (?)', [idsToDelete]);
                    await pool.query('DELETE FROM user_favorites WHERE recipe_id IN (?)', [idsToDelete]);
                    await pool.query('DELETE FROM recipes WHERE id IN (?)', [idsToDelete]);
                    console.log(`    ✅ "${dup.title}": Mantido ID ${keeperId}, removidos: ${idsToDelete.join(', ')}`);
                }
            }
        }

        // --- PARTE 2: REMOVER IMAGENS IRRELEVANTES ---
        console.log('\n🖼️ Parte 2: Limpando imagens irrelevantes...');
        
        // Critérios para imagens ruins:
        // 1. URLs de placeholders genéricos
        // 2. Imagens específicas que o usuário reportou como ruins
        const badImageKeywords = [
            'placeholder.com',
            'placehold.it',
            'lorempixel.com',
            'unsplash.com/photo-1546069901-ba9599a7e63c' // Salada genérica muito usada
        ];

        let cleanedImages = 0;

        // 2.1 Limpar por keywords
        for (const kw of badImageKeywords) {
            const [result] = await pool.query(
                'UPDATE recipes SET image_url = NULL WHERE image_url LIKE ?',
                [`%${kw}%`]
            );
            cleanedImages += result.affectedRows;
        }

        // 2.2 Limpar imagens específicas reportadas como "nada a ver"
        // (Vou anular para que possamos atualizar depois com links corretos)
        const [resultSpecific] = await pool.query(
            `UPDATE recipes 
             SET image_url = NULL 
             WHERE title IN ('Feijoada de Porco Tradicional', 'Carne de Porco com Mandioca')`
        );
        cleanedImages += resultSpecific.affectedRows;

        console.log(`✅ Foram limpas ${cleanedImages} URLs de imagens irrelevantes.`);

        // --- PARTE 3: CORRIGIR IMAGENS DE PORCO (COM LINKS NOVOS E REAIS) ---
        console.log('\n🐷 Parte 3: Atualizando pratos de porco com imagens REAIS...');
        
        const correctPorkImages = [
            {
                title: 'Feijoada de Porco Tradicional',
                url: 'https://cdn.casaenatural.com.br/wp-content/uploads/2021/04/feijoada-completa-tradicional.jpg'
            },
            {
                title: 'Carne de Porco com Mandioca',
                url: 'https://img.itdg.com.br/tdg/assets/default/recipe_original/recipe_10332-94285f5e9218204218f2601700685641.jpg'
            }
        ];

        for (const img of correctPorkImages) {
            const [updateRes] = await pool.query(
                'UPDATE recipes SET image_url = ? WHERE title = ?',
                [img.url, img.title]
            );
            if (updateRes.affectedRows > 0) {
                console.log(`    ✨ Atualizada imagem real para: "${img.title}"`);
            }
        }

        console.log('\n🌟 Limpeza e atualização concluídas com sucesso!');
    } catch (err) {
        console.error('❌ Erro durante a limpeza:', err.message);
    } finally {
        process.exit(0);
    }
}

fullCleanup();
