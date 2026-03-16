/**
 * Script para Limpeza de Descrições e Adição de Pratos de Porco
 */
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const porkRecipes = [
    {
        title: 'Entrecosto Grelhado à Moçambicana',
        description: 'Costelinhas de porco suculentas, marinadas em alho, limão e piri-piri, grelhadas lentamente nas brasas até ficarem douradas e estaladiças.',
        region: 'Nacional',
        difficulty: 'facil',
        prep_time_min: 30,
        cook_time_min: 40,
        calories: 550,
        image_url: 'https://i.ytimg.com/vi/36YvI-2V1l8/maxresdefault.jpg',
        instructions: '1. Tempere o entrecosto com sal grosso, muito alho esmagado, sumo de limão e piri-piri.\n2. Deixe marinar por pelo menos 2 horas.\n3. Prepare a brasa e grelhe o entrecosto, virando periodicamente.\n4. Pincele com um pouco de óleo ou manteiga com alho no final para dar brilho.',
        tags: '["porco", "grelhado", "carne"]'
    },
    {
        title: 'Carne de Porco com Mandioca',
        description: 'Um guisado rico e reconfortante onde a carne de porco cozinha lentamente com cubos de mandioca, que absorvem todo o sabor do molho.',
        region: 'Sul de Moçambique',
        difficulty: 'medio',
        prep_time_min: 20,
        cook_time_min: 50,
        calories: 480,
        image_url: 'https://anamariabraga.globo.com/wp-content/uploads/2017/08/carne-de-porco-com-mandioca-1024x576.jpg',
        instructions: '1. Corte a carne de porco e a mandioca em cubos médios.\n2. Refogue cebola, alho e tomate em óleo.\n3. Sele a carne no refogado até dourar.\n4. Adicione a mandioca e água suficiente para cobrir.\n5. Tape e cozinhe em lume brando até a mandioca ficar macia e o molho espesso.',
        tags: '["porco", "mandioca", "tradicional"]'
    },
    {
        title: 'Porco à Alentejana',
        description: 'Um dos pratos mais tradicionais da culinária luso-moçambicana, combinando cubos de porco fritos com amêijoas, batatas e coentros frescos.',
        region: 'Influência Portuguesa',
        difficulty: 'medio',
        prep_time_min: 30,
        cook_time_min: 45,
        calories: 620,
        image_url: 'https://t1.rg.ltmcdn.com/pt/posts/1/4/2/carne_de_porco_a_alentejana_tradicional_10241_600.jpg',
        instructions: '1. Marine o porco em vinho branco, massa de pimentão, alho e louro.\n2. Frite batatas em cubos.\n3. Frite a carne na marinada até dourar.\n4. Adicione as amêijoas e cozinhe até abrirem.\n5. Misture com as batatas fritas e decore com coentros e limão.',
        tags: '["porco", "marisco", "clássico"]'
    },
    {
        title: 'Feijoada de Porco Tradicional',
        description: 'Feijoada rica com diversos cortes de porco, chouriço e feijão manteiga, cozinhada lentamente para criar um molho espesso e saboroso.',
        region: 'Nacional',
        difficulty: 'dificil',
        prep_time_min: 40,
        cook_time_min: 120,
        calories: 750,
        image_url: 'https://t2.rg.ltmcdn.com/pt/posts/1/9/1/feijoada_brasileira_completa_e_tradicional_1191_600.jpg',
        instructions: '1. Coza o feijão com louro.\n2. Num tacho grande, refogue cebola, alho e chouriço.\n3. Adicione as carnes de porco e deixe dourar.\n4. Junte couve cortada e cenoura.\n5. Misture o feijão cozido com um pouco da água da cozedura e deixe apurar em lume brando.',
        tags: '["porco", "feijão", "guisado"]'
    }
];

async function updateAndAddPork() {
    console.log('🧹 Limpando descrições e adicionando pratos de porco...');
    
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'sabor_inteligente',
        charset: 'utf8mb4'
    });

    try {
        // 1. Limpar menções a imagens em todas as receitas
        const [allRecipes] = await pool.query('SELECT id, description FROM recipes');
        for (const r of allRecipes) {
            if (r.description && (r.description.includes('A imagem') || r.description.includes('A foto') || r.description.includes('A imagem mostra'))) {
                let cleanDesc = r.description.split('. ').filter(s => !s.includes('imagem') && !s.includes('foto') && !s.includes('mostra')).join('. ');
                if (!cleanDesc.endsWith('.') && cleanDesc.length > 0) cleanDesc += '.';
                await pool.query('UPDATE recipes SET description = ? WHERE id = ?', [cleanDesc, r.id]);
            }
        }
        console.log('✅ Descrições limpas.');

        // 2. Adicionar receitas de porco
        for (const recipe of porkRecipes) {
            await pool.query(
                `INSERT INTO recipes (title, description, instructions, region, difficulty, prep_time_min, cook_time_min, calories, image_url, is_traditional, tags)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?)
                 ON DUPLICATE KEY UPDATE description = VALUES(description), image_url = VALUES(image_url)`,
                [recipe.title, recipe.description, recipe.instructions, recipe.region, recipe.difficulty, recipe.prep_time_min, recipe.cook_time_min, recipe.calories, recipe.image_url, recipe.tags]
            );
            console.log(`  🐷 Adicionado: ${recipe.title}`);
        }

        console.log('\n🌟 Atualização concluída!');
    } catch (err) {
        console.error('❌ Erro:', err.message);
    } finally {
        process.exit(0);
    }
}

updateAndAddPork();
