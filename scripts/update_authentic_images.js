/**
 * Script de Atualização com Imagens Reais e Autênticas
 * Utiliza links de portais moçambicanos (MMO, Soficia, etc.)
 */
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const realMozRecipes = [
    {
        title: 'Matapa Tradicional',
        description: 'Folhas de mandioca piladas com amendoim e coco. A imagem mostra a cor verde-escura característica e a textura cremosa do prato autêntico.',
        region: 'Sul de Moçambique',
        difficulty: 'medio',
        prep_time_min: 40,
        cook_time_min: 60,
        calories: 380,
        image_url: 'https://mmo.co.mz/wp-content/uploads/2014/05/Matapa.jpg',
        instructions: '1. Pile 500g de folhas de mandioca no pilão com alho e sal.\n2. Ferva em água por 30 min.\n3. Junte 500g de amendoim pilado e 1L de leite de coco fresco.\n4. Cozinhe em lume brando mexendo sempre até o óleo do amendoim subir à superfície.',
        tags: '["tradicional", "matapa", "sul"]'
    },
    {
        title: 'Frango à Zambeziana',
        description: 'Frango marinado em leite de coco e grelhado. A imagem real destaca o tom amarelado do coco e a pele tostada nas brasas.',
        region: 'Zambézia',
        difficulty: 'medio',
        prep_time_min: 30,
        cook_time_min: 45,
        calories: 450,
        image_url: 'https://mmo.co.mz/wp-content/uploads/2014/11/Frango-a-Zambeziana.jpg',
        instructions: '1. Marine o frango com sal, alho, piri-piri e muito leite de coco.\n2. Grelhe lentamente nas brasas, pincelando com o resto da marinada.\n3. O segredo é o fumo das brasas combinado com o coco.',
        tags: '["grelhado", "zambezia", "coco"]'
    },
    {
        title: 'Xiguinha de Cacana',
        description: 'Prato autêntico com mandioca e folhas de cacana. A foto mostra a mistura rústica e real deste prato tradicional.',
        region: 'Inhambane/Gaza',
        difficulty: 'medio',
        prep_time_min: 30,
        cook_time_min: 50,
        calories: 290,
        image_url: 'https://mmo.co.mz/wp-content/uploads/2014/11/Xiguinha.jpg',
        instructions: '1. Coza a mandioca em cubos com as folhas de cacana em água e sal.\n2. Quando a mandioca estiver macia, adicione o amendoim pilado.\n3. Deixe apurar até o molho engrossar.',
        tags: '["cacana", "tradicional", "sul"]'
    },
    {
        title: 'Mucapata',
        description: 'Especialidade da Zambézia com arroz e feijão soroco. Imagem real da consistência pastosa e cor característica.',
        region: 'Zambézia',
        difficulty: 'facil',
        prep_time_min: 20,
        cook_time_min: 40,
        calories: 320,
        image_url: 'https://mmo.co.mz/wp-content/uploads/2014/11/Mucapata.jpg',
        instructions: '1. Cozinhe o feijão soroco com arroz e leite de coco.\n2. Mexa vigorosamente com colher de pau para atingir a consistência de "papa".\n3. Sirva como acompanhamento de carnes ou peixe.',
        tags: '["zambezia", "feijao", "arroz"]'
    },
    {
        title: 'Caril de Amendoim com Camarão',
        description: 'Camarão moçambicano em molho de amendoim. Foto real do brilho do molho e do camarão suculento.',
        region: 'Maputo/Inhambane',
        difficulty: 'medio',
        prep_time_min: 25,
        cook_time_min: 30,
        calories: 410,
        image_url: 'https://mmo.co.mz/wp-content/uploads/2017/01/Caril-de-Camarao-com-Amendoim.jpg',
        instructions: '1. Prepare o molho com amendoim pilado e leite de coco.\n2. Adicione o camarão limpo no final para não cozer demais.\n3. Sirva com arroz de coco ou xima.',
        tags: '["marisco", "luxo", "amendoim"]'
    },
    {
        title: 'Badjias',
        description: 'Petisco de feijão nhemba frito. A imagem mostra as badjias douradas e crocantes, perfeitas com pão.',
        region: 'Nacional',
        difficulty: 'medio',
        prep_time_min: 60,
        cook_time_min: 20,
        calories: 210,
        image_url: 'https://mmo.co.mz/wp-content/uploads/2014/08/Badjias.jpg',
        instructions: '1. Moa o feijão nhemba (sem casca) até obter uma massa.\n2. Tempere com alho, sal e açafrão.\n3. Frite colheradas da massa em óleo bem quente até dourarem.',
        tags: '["petisco", "frito", "nhemba"]'
    }
];

async function updateToRealImages() {
    console.log('📸 Atualizando para imagens REAIS e AUTÊNTICAS de Moçambique...');
    
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'sabor_inteligente',
        charset: 'utf8mb4'
    });

    try {
        for (const recipe of realMozRecipes) {
            await pool.query(
                `INSERT INTO recipes (title, description, instructions, region, difficulty, prep_time_min, cook_time_min, calories, image_url, is_traditional, tags)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?)
                 ON DUPLICATE KEY UPDATE 
                    image_url = VALUES(image_url),
                    description = VALUES(description),
                    instructions = VALUES(instructions)`,
                [recipe.title, recipe.description, recipe.instructions, recipe.region, recipe.difficulty, recipe.prep_time_min, recipe.cook_time_min, recipe.calories, recipe.image_url, recipe.tags]
            );
            console.log(`  🖼️ ${recipe.title} — Imagem real aplicada.`);
        }
        console.log('\n🌟 Base de dados atualizada com imagens autênticas!');
    } catch (err) {
        console.error('❌ Erro:', err.message);
    } finally {
        process.exit(0);
    }
}

updateToRealImages();
