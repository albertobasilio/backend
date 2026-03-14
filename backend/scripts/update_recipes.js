/**
 * Script para actualizar e expandir as receitas no banco de dados
 * com pratos GLOBAIS confirmados e verificáveis.
 */

const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const recipes = [
    {
        title: 'Pizza Margherita Autêntica',
        description: 'A clássica pizza napolitana, símbolo da culinária italiana. Criada em 1889 em homenagem à Rainha Margherita, utiliza as cores da bandeira da Itália: vermelho (tomate), branco (moçarela) e verde (manjericão).',
        region: 'Itália',
        difficulty: 'medio',
        prep_time_min: 20,
        cook_time_min: 15,
        calories: 250,
        protein: 12,
        carbs: 35,
        fat: 10,
        is_traditional: true,
        tags: '["italiana", "vegetariano", "clássico"]',
        instructions: `1. Prepare a massa: Dissolva 3g de fermento biológico seco em 300ml de água morna. Adicione aos poucos 500g de farinha de trigo tipo 00 e 10g de sal. Amasse até ficar lisa e elástica. Deixe descansar por 6 a 8 horas.
2. Prepare o molho: Use tomates San Marzano pelados. Esmague-os manualmente e adicione uma pitada de sal. Não cozinhe o molho antes de ir ao forno.
3. Abra a massa: Use as mãos para abrir um disco de cerca de 30cm, mantendo a borda (cornicione) mais alta e aerada.
4. Adicione o molho: Espalhe uma concha de molho de tomate do centro para as bordas em movimentos circulares.
5. Adicione o queijo: Distribua fatias de moçarela de búfala fresca sobre o molho.
6. Finalize com manjericão: Adicione folhas de manjericão fresco e um fio de azeite extra virgem.
7. Asse: Em forno muito quente (idealmente 400°C+), asse por 90 segundos a 3 minutos até a borda dourar e o queijo derreter.
8. Sirva imediatamente, cortando em fatias e apreciando a massa leve e crocante.`
    },
    {
        title: 'Sushi (Nigiri e Maki)',
        description: 'A arte japonesa de combinar arroz temperado com vinagre e peixe cru fresquíssimo. O sushi evoluiu de um método de conservação de peixe para uma das iguarias mais refinadas do mundo.',
        region: 'Japão',
        difficulty: 'dificil',
        prep_time_min: 45,
        cook_time_min: 20,
        calories: 300,
        protein: 15,
        carbs: 45,
        fat: 5,
        is_traditional: true,
        tags: '["japonesa", "peixe", "saudável"]',
        instructions: `1. Prepare o arroz (Shari): Lave 2 chávenas de arroz para sushi (grão curto) até a água sair límpida. Cozinhe com 2.2 chávenas de água.
2. Tempere o arroz: Misture 4 colheres de vinagre de arroz, 2 de açúcar e 1 de sal. Aqueça levemente para dissolver. Adicione ao arroz cozido ainda quente, misturando delicadamente com movimentos de corte enquanto arrefece com um leque.
3. Prepare o peixe: Use peixe de grau sushi (salmão ou atum). Corte em fatias finas de 5cm para Nigiri ou em tiras para Maki.
4. Monte o Nigiri: Com as mãos húmidas, forme uma pequena bola oval de arroz. Coloque uma gota de wasabi no peixe e pressione-o suavemente sobre o arroz.
5. Monte o Maki: Coloque uma folha de alga Nori sobre a esteira de bambu. Espalhe uma camada fina de arroz, deixando a borda superior livre.
6. Recheie e enrole: Coloque o peixe e vegetais no centro. Enrole firmemente com a esteira, selando a borda com um pouco de água.
7. Corte: Use uma faca muito afiada e húmida para cortar o rolo em 6 ou 8 pedaços iguais.
8. Sirva com molho de soja (shoyu), gengibre em conserva (gari) e wasabi.`
    },
    {
        title: 'Tacos Al Pastor',
        description: 'Um dos tacos mais amados do México, com influências libanesas. Carne de porco marinada em achiote e especiarias, cozida em um espeto vertical e servida com abacaxi.',
        region: 'México',
        difficulty: 'medio',
        prep_time_min: 30,
        cook_time_min: 20,
        calories: 350,
        protein: 20,
        carbs: 30,
        fat: 15,
        is_traditional: true,
        tags: '["mexicana", "carne", "picante"]',
        instructions: `1. Prepare a marinada: Bata no liquidificador pasta de achiote, pimentas guajillo (hidratadas), alho, vinagre, sumo de laranja e especiarias (cominho, cravo, orégano).
2. Marine a carne: Corte lombo de porco em fatias finas e envolva na marinada por pelo menos 4 horas (idealmente 24h).
3. Cozinhe a carne: Em casa, grelhe as fatias de carne em fogo alto até ficarem bem douradas e levemente crocantes nas bordas.
4. Prepare os acompanhamentos: Pique cebola branca, coentro fresco e corte fatias de abacaxi maduro.
5. Aqueça as tortilhas: Use tortilhas de milho frescas, aquecendo-as numa chapa até ficarem maleáveis.
6. Monte o taco: Coloque uma porção generosa de carne na tortilha, adicione um pedaço de abacaxi grelhado.
7. Finalize: Adicione cebola, coentro e uma salsa verde ou vermelha picante.
8. Sirva com gomos de lima para espremer por cima na hora de comer.`
    },
    {
        title: 'Feijoada Brasileira Completa',
        description: 'O prato nacional do Brasil. Um cozido rico de feijão preto com diversas carnes de porco e vaca, servido com arroz, couve, farofa e laranja.',
        region: 'Brasil',
        difficulty: 'dificil',
        prep_time_min: 60,
        cook_time_min: 180,
        calories: 600,
        protein: 40,
        carbs: 50,
        fat: 30,
        is_traditional: true,
        tags: '["brasileira", "carne", "festivo"]',
        instructions: `1. Dessalgue as carnes: Deixe as carnes salgadas (costelinha, pé, orelha, rabo, carne seca) de molho em água por 24h, trocando a água várias vezes.
2. Cozinhe o feijão: Coloque feijão preto numa panela grande com água e folhas de louro. Cozinhe até começar a amaciar.
3. Adicione as carnes: Junte as carnes mais duras primeiro (carne seca, pé, orelha). Após 1h, adicione costelinha e lombo. Por último, adicione paio e linguiça calabresa.
4. Prepare o tempero: Numa frigideira, refogue bastante alho e cebola em banha de porco ou óleo.
5. Engrosse o caldo: Pegue duas conchas de feijão cozido, amasse-os e misture ao refogado de alho. Devolva essa mistura para a panela principal.
6. Apure os sabores: Deixe cozinhar em fogo baixo por mais 30-45 minutos até o caldo ficar bem grosso e as carnes muito macias.
7. Prepare os acompanhamentos: Faça arroz branco soltinho, couve mineira refogada com alho, farofa e fatias de laranja fresca (que ajuda na digestão).
8. Sirva a feijoada em tigelas separadas para carnes e feijão, acompanhada de um molho de pimenta malagueta.`
    }
];

async function updateRecipes() {
    console.log('🌍 Actualizando e Expandindo Base de Receitas Globais...\n');

    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'sabor_inteligente',
        charset: 'utf8mb4'
    });

    for (const recipe of recipes) {
        try {
            // Check if recipe exists by title
            const [rows] = await pool.query('SELECT id FROM recipes WHERE title = ?', [recipe.title]);
            
            if (rows.length > 0) {
                // Update
                await pool.query(
                    `UPDATE recipes SET 
                        description = ?, instructions = ?, region = ?, difficulty = ?, 
                        prep_time_min = ?, cook_time_min = ?, calories = ?, protein = ?, 
                        carbs = ?, fat = ?, is_traditional = ?, tags = ?
                    WHERE title = ?`,
                    [
                        recipe.description, recipe.instructions, recipe.region, recipe.difficulty,
                        recipe.prep_time_min, recipe.cook_time_min, recipe.calories, recipe.protein,
                        recipe.carbs, recipe.fat, recipe.is_traditional, recipe.tags, recipe.title
                    ]
                );
                console.log(`  ✅ ${recipe.title} — Actualizada com sucesso`);
            } else {
                // Insert
                await pool.query(
                    `INSERT INTO recipes (
                        title, description, instructions, region, difficulty, 
                        prep_time_min, cook_time_min, calories, protein, carbs, 
                        fat, is_traditional, tags
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        recipe.title, recipe.description, recipe.instructions, recipe.region, recipe.difficulty,
                        recipe.prep_time_min, recipe.cook_time_min, recipe.calories, recipe.protein, recipe.carbs,
                        recipe.fat, recipe.is_traditional, recipe.tags
                    ]
                );
                console.log(`  🆕 ${recipe.title} — Criada com sucesso`);
            }
        } catch (err) {
            console.error(`  ❌ ${recipe.title} — ERRO:`, err.message);
        }
    }

    console.log('\n🌟 Base de receitas actualizada com sucesso!');
    process.exit(0);
}

updateRecipes();
