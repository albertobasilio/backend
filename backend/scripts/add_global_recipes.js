/**
 * Script para Adicionar Receitas Globais
 * Adiciona pratos icónicos de vários países com detalhes e imagens.
 */
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const globalRecipes = [
    {
        title: 'Lasanha alla Bolognese',
        description: 'Clássico italiano de camadas de massa fresca, ragù de carne cozinhado lentamente, molho béchamel cremoso e queijo parmigiano.',
        region: 'Itália',
        difficulty: 'medio',
        prep_time_min: 60,
        cook_time_min: 45,
        calories: 650,
        image_url: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?q=80&w=1000',
        instructions: '1. Prepare o ragù refogando aipo, cenoura e cebola, depois junte carne moída e vinho tinto.\n2. Cozinhe com polpa de tomate por 2 horas em lume brando.\n3. Faça o molho béchamel com manteiga, farinha e leite.\n4. Monte as camadas: massa, ragù, béchamel e queijo.\n5. Repita 5 vezes e asse a 180°C até dourar.',
        tags: '["italiana", "conforto", "massa"]'
    },
    {
        title: 'Butter Chicken (Murgh Makhani)',
        description: 'Frango marinado em iogurte e especiarias, servido num molho aveludado de tomate, manteiga e natas. Um tesouro da culinária indiana.',
        region: 'Índia',
        difficulty: 'medio',
        prep_time_min: 30,
        cook_time_min: 40,
        calories: 520,
        image_url: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?q=80&w=1000',
        instructions: '1. Marine o frango com iogurte, gengibre, alho e garam masala por 4 horas.\n2. Grelhe o frango até selar.\n3. No tacho, prepare o molho com puré de tomate, especiarias, manteiga e natas.\n4. Junte o frango ao molho e cozinhe por 15 min.\n5. Sirva com pão Naan ou Arroz Basmati.',
        tags: '["indiana", "picante", "cremoso"]'
    },
    {
        title: 'Pad Thai Autêntico',
        description: 'O prato de rua mais famoso da Tailândia. Massa de arroz frita com camarão, tofu, ovos e um molho agridoce de tamarindo.',
        region: 'Tailândia',
        difficulty: 'medio',
        prep_time_min: 20,
        cook_time_min: 15,
        calories: 480,
        image_url: 'https://images.unsplash.com/photo-1559311648-d46f4d8593d8?q=80&w=1000',
        instructions: '1. Demolhe a massa de arroz em água morna.\n2. Prepare o molho com polpa de tamarindo, molho de peixe e açúcar de palma.\n3. No Wok, frite camarão e tofu.\n4. Junte a massa e o molho, mexendo vigorosamente.\n5. Adicione ovos, rebentos de soja e amendoim torrado.',
        tags: '["tailandesa", "agridoce", "rapido"]'
    },
    {
        title: 'Paella Valenciana',
        description: 'Arroz dourado com açafrão, marisco fresco, frango e vegetais. A alma da gastronomia espanhola cozinhada numa paellera.',
        region: 'Espanha',
        difficulty: 'dificil',
        prep_time_min: 40,
        cook_time_min: 35,
        calories: 590,
        image_url: 'https://images.unsplash.com/photo-1534080564607-c92754228a0f?q=80&w=1000',
        instructions: '1. Refogue o frango e feijão verde em azeite.\n2. Adicione tomate ralado e pimentão doce.\n3. Junte o arroz Bomba e o caldo de marisco com açafrão.\n4. Distribua camarões e mexilhões por cima.\n5. Cozinhe sem mexer até formar a "socarrat" (crosta de arroz no fundo).',
        tags: '["espanhola", "arroz", "marisco"]'
    },
    {
        title: 'Picanha na Brasa',
        description: 'O corte de carne mais nobre do churrasco brasileiro, servido com a gordura estaladiça e apenas sal grosso.',
        region: 'Brasil',
        difficulty: 'facil',
        prep_time_min: 10,
        cook_time_min: 20,
        calories: 400,
        image_url: 'https://images.unsplash.com/photo-1558039030-85aa9689faf0?q=80&w=1000',
        instructions: '1. Corte a picanha em bifes de 2 a 3 dedos.\n2. Tempere apenas com sal grosso.\n3. Leve à brasa bem quente, começando pelo lado da gordura.\n4. Grelhe por 5-7 minutos de cada lado para ponto médio-malpassado.\n5. Deixe descansar por 2 minutos antes de cortar.',
        tags: '["brasileira", "carne", "churrasco"]'
    }
];

async function addGlobalRecipes() {
    console.log('🌍 Adicionando pratos internacionais à base de dados...');
    
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'sabor_inteligente',
        charset: 'utf8mb4'
    });

    try {
        for (const recipe of globalRecipes) {
            await pool.query(
                `INSERT INTO recipes (title, description, instructions, region, difficulty, prep_time_min, cook_time_min, calories, image_url, is_traditional, tags)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE, ?)
                 ON DUPLICATE KEY UPDATE description = VALUES(description), instructions = VALUES(instructions)`,
                [recipe.title, recipe.description, recipe.instructions, recipe.region, recipe.difficulty, recipe.prep_time_min, recipe.cook_time_min, recipe.calories, recipe.image_url, recipe.tags]
            );
            console.log(`  ✅ Adicionado/Atualizado: ${recipe.title}`);
        }
        console.log('\n🌟 Base global expandida com sucesso!');
    } catch (err) {
        console.error('❌ Erro:', err.message);
    } finally {
        process.exit(0);
    }
}

addGlobalRecipes();
