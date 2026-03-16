/**
 * Script de Limpeza e Atualização Autêntica de Receitas
 * Remove pratos incorretos e duplicados.
 * Adiciona detalhes minuciosos e imagens reais.
 */
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const authenticRecipes = [
    {
        title: 'Matapa Tradicional',
        description: 'O prato mais icónico de Moçambique. Folhas de mandioca piladas com amendoim e coco, cozinhadas lentamente até à perfeição cremosa.',
        region: 'Sul de Moçambique',
        difficulty: 'medio',
        prep_time_min: 40,
        cook_time_min: 60,
        calories: 380,
        image_url: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?q=80&w=1000',
        instructions: '1. Pile 500g de folhas de mandioca no pilão com alho e sal até virar pasta.\n2. Ferva a pasta em 1L de água por 30 min.\n3. Adicione 500g de amendoim pilado e 1L de leite de coco fresco.\n4. Se desejar, adicione caranguejo ou camarão seco.\n5. Cozinhe em lume brando por 45 min mexendo sempre até o óleo do amendoim subir.',
        tags: '["tradicional", "vegan", "gluten-free"]'
    },
    {
        title: 'Frango à Zambeziana',
        description: 'Frango marinado em leite de coco e grelhado nas brasas. Uma iguaria da província da Zambézia, famosa pelo seu sabor defumado e suculento.',
        region: 'Zambézia',
        difficulty: 'medio',
        prep_time_min: 30,
        cook_time_min: 45,
        calories: 450,
        image_url: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?q=80&w=1000',
        instructions: '1. Limpe um frango de 1.5kg e abra-o pelas costas.\n2. Marine com sal, alho, piri-piri e 500ml de leite de coco por 4 horas.\n3. Prepare a brasa e grelhe o frango lentamente.\n4. Pincele o frango com a marinada de coco enquanto grelha para manter a suculência.\n5. Sirva com xima ou arroz de coco.',
        tags: '["grelhado", "proteina", "zambezia"]'
    },
    {
        title: 'Mucapata',
        description: 'Especialidade da Zambézia. Uma mistura cremosa de arroz, feijão soroco e leite de coco. Um acompanhamento rico e nutritivo.',
        region: 'Zambézia',
        difficulty: 'facil',
        prep_time_min: 20,
        cook_time_min: 40,
        calories: 320,
        image_url: 'https://images.unsplash.com/photo-1512058560366-cd2427ffaa34?q=80&w=1000',
        instructions: '1. Cozinhe 250g de feijão soroco até ficar macio.\n2. Adicione 500g de arroz e 1L de leite de coco.\n3. Tempere com sal e cozinhe em lume brando.\n4. Mexa com colher de pau até atingir consistência de papa grossa.\n5. Sirva com peixe frito ou frango.',
        tags: '["acompanhamento", "vegetariano", "zambezia"]'
    },
    {
        title: 'Xiguinha de Cacana',
        description: 'Prato autêntico do Sul. Mandioca cozida com folhas de cacana (amargas) e amendoim. Um prato medicinal e tradicional.',
        region: 'Inhambane/Gaza',
        difficulty: 'medio',
        prep_time_min: 30,
        cook_time_min: 50,
        calories: 290,
        image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000',
        instructions: '1. Descasque 1kg de mandioca e corte em cubos.\n2. Lave bem 2 molhos de folhas de cacana.\n3. Coza a mandioca com as folhas em água e sal.\n4. Quando a mandioca amolecer, adicione 300g de amendoim pilado.\n5. Deixe apurar sem mexer muito para não desfazer a mandioca.',
        tags: '["tradicional", "saudavel", "sul"]'
    },
    {
        title: 'Caril de Amendoim com Camarão',
        description: 'Camarão fresco de Moçambique cozinhado num molho rico de amendoim e coco. Uma explosão de sabores tropicais.',
        region: 'Maputo/Inhambane',
        difficulty: 'medio',
        prep_time_min: 25,
        cook_time_min: 30,
        calories: 410,
        image_url: 'https://images.unsplash.com/photo-1551248429-40975aa4de74?q=80&w=1000',
        instructions: '1. Limpe 1kg de camarão fresco.\n2. Refogue cebola, tomate e alho.\n3. Junte 400g de amendoim pilado dissolvido em 800ml de leite de coco.\n4. Quando ferver, adicione o camarão.\n5. Cozinhe por apenas 10 min para o camarão não ficar rijo.',
        tags: '["marisco", "luxo", "tradicional"]'
    }
];

async function refreshRecipes() {
    console.log('🧹 Limpando receitas incorretas e duplicadas...');
    
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'sabor_inteligente',
        charset: 'utf8mb4'
    });

    try {
        // Apagar todas as receitas atuais para evitar duplicatas e inconsistências
        await pool.query('DELETE FROM recipe_ingredients');
        await pool.query('DELETE FROM recipes');
        console.log('✅ Base de dados limpa.');

        for (const recipe of authenticRecipes) {
            const [result] = await pool.query(
                `INSERT INTO recipes (title, description, instructions, region, difficulty, prep_time_min, cook_time_min, calories, image_url, is_traditional, tags)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?)`,
                [recipe.title, recipe.description, recipe.instructions, recipe.region, recipe.difficulty, recipe.prep_time_min, recipe.cook_time_min, recipe.calories, recipe.image_url, recipe.tags]
            );
            console.log(`  ➕ Adicionada: ${recipe.title}`);
        }

        console.log('\n🌟 Sistema de receitas restaurado com sucesso!');
    } catch (err) {
        console.error('❌ Erro crítico:', err.message);
    } finally {
        process.exit(0);
    }
}

refreshRecipes();
