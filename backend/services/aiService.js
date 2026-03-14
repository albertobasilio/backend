const Groq = require('groq-sdk');
require('dotenv').config();
const logger = require('../utils/logger');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Parse JSON from AI response (handles markdown code blocks + control chars)
const parseAIResponse = (content) => {
  if (!content) return null;

  // Step 1: Strip markdown code fences
  let cleaned = content.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();

  // Step 2: Extract JSON object
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) {
    logger.warn('parseAIResponse: nenhum JSON encontrado na resposta. Conteúdo bruto:', { content });
    return null;
  }
  let jsonStr = cleaned.substring(start, end + 1);

  // Step 3: Try parsing as-is first (works if AI returns valid JSON)
  try {
    return JSON.parse(jsonStr);
  } catch (e1) {
    logger.warn('JSON parse directo falhou, limpando control chars dentro de strings...', { error: e1.message });
  }

  // Step 4: Fix control characters ONLY inside double-quoted string values
  try {
    jsonStr = jsonStr.replace(/"(?:[^"\\]|\\.)*"/g, (match) => {
      return match
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t')
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    });
    return JSON.parse(jsonStr);
  } catch (e2) {
    logger.error('JSON parse falhou completamente. Conteúdo bruto:', { content, error: e2.message });
    return null;
  }
};

// Analyze image to detect products
exports.analyzeImage = async (imageBase64) => {
  const systemPrompt = `Você é um especialista global em identificação de produtos alimentares.

TAREFA: Analise CUIDADOSAMENTE a imagem e identifique TODOS os produtos e itens visíveis (frutas, vegetais, carnes, embalados, grãos, etc).

REGRAS OBRIGATÓRIAS:
1. Identifique CADA produto individual, independentemente da origem ou país.
2. Forneça o nome comum em português.
3. Para cada item, indique o NÍVEL DE CONFIANÇA real (0.5 = incerto, 0.95 = muito seguro).
4. Se NÃO houver produtos ou alimentos na imagem, retorne com "no_food": true.

FORMATO DE RESPOSTA (JSON):
{
  "products": [
    {
      "name": "nome em português",
      "emoji": "emoji",
      "confidence": 0.95,
      "category": "categoria",
      "estimated_quantity": "2 unidades"
    }
  ],
  "total_found": número_total,
  "no_food": false,
  "image_quality": "boa|media|fraca"
}

Categorias: vegetal, fruta, proteina, grao, tempero, lacteo, oleo, cereal, bebida, outro.`;

  try {
    const response = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: systemPrompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }
      ],
      max_tokens: 2000,
      temperature: 0.2,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    const parsed = parseAIResponse(content);
    return parsed || { products: [], total_found: 0, no_food: true };
  } catch (err) {
    logger.error(`AI scan erro:`, { error: err.message });
    throw err;
  }
};

// Generate recipes based on GLOBAL cuisine (Real and verifiable recipes)
exports.generateRecipes = async (products, dietaryProfile = {}) => {
  try {
    const productsList = products.join(', ');
    const systemPrompt = `Você é um Chef Internacional de Classe Mundial. Você cria receitas REAIS, EXISTENTES e verificáveis da culinária global.

REGRAS DE OURO:
1. GLOBALIDADE: Use receitas de QUALQUER país do mundo (Itália, Japão, Brasil, Moçambique, França, México, etc).
2. REALISMO: As receitas devem ser pratos reais que existem na internet e em livros de culinária.
3. FIDELIDADE AOS INGREDIENTES: Use obrigatoriamente os produtos do utilizador: [${productsList}].
4. DETALHE EXTREMO: Cada receita deve ter NO MÍNIMO 8 passos de preparo MUITO DETALHADOS (cada passo com 2-3 frases explicando técnica, tempo e sinais visuais/olfativos).

FORMATO JSON:
{
  "possible_recipes": [
    {
      "title": "Nome Real do Prato",
      "origin_country": "País de Origem",
      "description": "Breve história e descrição do prato",
      "ingredients": [...],
      "instructions": "Passos detalhados...",
      "prep_time_min": 20,
      "cook_time_min": 30,
      "difficulty": "facil|medio|dificil"
    }
  ],
  "suggested_recipes": [...],
  "economy_tip": "Dica útil"
}`;

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Crie receitas globais reais usando estes produtos: ${productsList}.` }
      ],
      max_tokens: 6000,
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    return parseAIResponse(response.choices[0].message.content);
  } catch (err) {
    logger.error('Erro ao gerar receitas globais:', { error: err.message });
    throw err;
  }
};
