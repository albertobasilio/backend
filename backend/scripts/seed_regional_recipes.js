/**
 * Script para popular a base de dados com receitas regionais de TODAS as províncias de Moçambique.
 */
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const regionalRecipes = [
    {
        title: 'Ishidigo',
        description: 'Prato tradicional da província de Cabo Delgado, feito com peixe seco, coco e mandioca.',
        region: 'Cabo Delgado',
        difficulty: 'medio',
        prep_time_min: 30,
        cook_time_min: 40,
        calories: 310,
        instructions: '1. Lave o peixe seco e deixe de molho.\n2. Cozinhe a mandioca em cubos.\n3. Prepare o leite de coco fresco.\n4. Junte o peixe à mandioca e adicione o leite de coco.\n5. Deixe apurar em lume brando até ficar cremoso.',
        tags: '["norte", "peixe", "tradicional"]'
    },
    {
        title: 'Caril de Galinha à Zambeziana',
        description: 'Famoso frango da Zambézia grelhado e depois cozido com leite de coco e especiarias.',
        region: 'Zambézia',
        difficulty: 'medio',
        prep_time_min: 40,
        cook_time_min: 50,
        calories: 450,
        instructions: '1. Grelhe o frango nas brasas.\n2. Prepare um refogado rico com cebola, tomate e alho.\n3. Junte o frango grelhado ao refogado.\n4. Adicione leite de coco abundante e deixe cozinhar até a carne soltar do osso.',
        tags: '["centro", "frango", "coco"]'
    },
    {
        title: 'N’Sima com Peixe da Albufeira',
        description: 'Prato típico de Tete, utilizando peixes frescos da albufeira de Cahora Bassa.',
        region: 'Tete',
        difficulty: 'facil',
        prep_time_min: 15,
        cook_time_min: 25,
        calories: 280,
        instructions: '1. Prepare a xima (n’sima) de milho branca.\n2. Grelhe ou frite o peixe fresco temperado com sal e limão.\n3. Sirva com um molho de tomate e piripíri bem picante.',
        tags: '["centro", "peixe", "basico"]'
    },
    {
        title: 'Mucapata',
        description: 'Prato da Zambézia feito com arroz, feijão soroco e leite de coco, com consistência pastosa.',
        region: 'Zambézia',
        difficulty: 'medio',
        prep_time_min: 20,
        cook_time_min: 45,
        calories: 380,
        instructions: '1. Cozinhe o feijão soroco até ficar macio.\n2. Adicione o arroz e o leite de coco.\n3. Mexa constantemente até obter uma consistência de papa.\n4. Sirva quente como acompanhamento.',
        tags: '["centro", "arroz", "vegetariano"]'
    }
];

async function seedRegional() {
    console.log('🇲🇿 Semeando receitas regionais de Moçambique...');
    
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'sabor_inteligente',
        charset: 'utf8mb4'
    });

    for (const recipe of regionalRecipes) {
        try {
            await pool.query(
                `INSERT INTO recipes (title, description, instructions, region, difficulty, prep_time_min, cook_time_min, calories, is_traditional, tags)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?)
                 ON DUPLICATE KEY UPDATE description = VALUES(description)`,
                [recipe.title, recipe.description, recipe.instructions, recipe.region, recipe.difficulty, recipe.prep_time_min, recipe.cook_time_min, recipe.calories, recipe.tags]
            );
            console.log(`  ✅ ${recipe.title} (${recipe.region})`);
        } catch (err) {
            console.error(`  ❌ Erro em ${recipe.title}:`, err.message);
        }
    }

    console.log('🌟 Concluído!');
    process.exit(0);
}

seedRegional();
