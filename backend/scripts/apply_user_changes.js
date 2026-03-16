const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function applyChanges() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'sabor_inteligente',
        charset: 'utf8mb4'
    });

    try {
        console.log('🚀 Iniciando atualizações solicitadas...');

        // 1. Eliminar "Xiguinha de Quiabo" ou pratos similares com Quiabo
        // Buscamos em título, descrição e instruções
        const [quiaboRecipes] = await pool.query(
            "SELECT id, title FROM recipes WHERE title LIKE '%Quiabo%' OR title LIKE '%Xiguinha%' OR title LIKE '%Xuiginha%' OR description LIKE '%Quiabo%' OR instructions LIKE '%Quiabo%'"
        );

        for (const recipe of quiaboRecipes) {
            console.log(`🗑️ Removendo prato: ${recipe.title}`);
            await pool.query("DELETE FROM recipe_ingredients WHERE recipe_id = ?", [recipe.id]);
            await pool.query("DELETE FROM user_favorites WHERE recipe_id = ?", [recipe.id]);
            await pool.query("DELETE FROM recipe_reviews WHERE recipe_id = ?", [recipe.id]);
            await pool.query("DELETE FROM recipes WHERE id = ?", [recipe.id]);
        }

        // 2. Atualizar imagem da Sardinha
        console.log('🐟 Atualizando imagem da Sardinha Grelhada...');
        await pool.query(
            "UPDATE recipes SET image_url = '/sardinha.jpg' WHERE title LIKE '%Sardinha%'"
        );

        console.log('✅ Atualizações concluídas com sucesso!');
    } catch (err) {
        console.error('❌ Erro durante a atualização:', err.message);
    } finally {
        process.exit(0);
    }
}

applyChanges();
