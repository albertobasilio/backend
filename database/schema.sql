-- ============================================
-- Sabor Inteligente MZ - Database Schema
-- ============================================

CREATE DATABASE IF NOT EXISTS sabor_inteligente
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE sabor_inteligente;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  region VARCHAR(100) DEFAULT 'Maputo',
  avatar VARCHAR(255),
  plan VARCHAR(50) DEFAULT 'free',
  role VARCHAR(20) DEFAULT 'user',
  free_scan_used TINYINT(1) DEFAULT 0,
  scan_count INT DEFAULT 0,
  last_scan_date DATE DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dietary profiles
CREATE TABLE IF NOT EXISTS dietary_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  gluten_free BOOLEAN DEFAULT FALSE,
  vegan BOOLEAN DEFAULT FALSE,
  vegetarian BOOLEAN DEFAULT FALSE,
  low_sugar BOOLEAN DEFAULT FALSE,
  diabetic BOOLEAN DEFAULT FALSE,
  child_diet BOOLEAN DEFAULT FALSE,
  athlete BOOLEAN DEFAULT FALSE,
  elderly BOOLEAN DEFAULT FALSE,
  pregnant BOOLEAN DEFAULT FALSE,
  allergies TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ingredients master list
CREATE TABLE IF NOT EXISTS ingredients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  name_local VARCHAR(100),
  category ENUM('vegetal', 'fruta', 'proteina', 'grao', 'tempero', 'lacteo', 'outro') DEFAULT 'outro',
  emoji VARCHAR(10),
  calories_per_100g DECIMAL(8,2) DEFAULT 0,
  protein_per_100g DECIMAL(8,2) DEFAULT 0,
  carbs_per_100g DECIMAL(8,2) DEFAULT 0,
  fat_per_100g DECIMAL(8,2) DEFAULT 0,
  fiber_per_100g DECIMAL(8,2) DEFAULT 0,
  iron_per_100g DECIMAL(8,2) DEFAULT 0,
  vitamin_a_per_100g DECIMAL(8,2) DEFAULT 0,
  vitamin_c_per_100g DECIMAL(8,2) DEFAULT 0,
  avg_price_mt DECIMAL(10,2) DEFAULT 0,
  is_common BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Scan history
CREATE TABLE IF NOT EXISTS scan_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  image_url VARCHAR(500),
  scan_type VARCHAR(50) DEFAULT 'geladeira',
  detected_ingredients JSON,
  confirmed_ingredients JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Recipes
CREATE TABLE IF NOT EXISTS recipes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  instructions TEXT,
  prep_time_min INT DEFAULT 0,
  cook_time_min INT DEFAULT 0,
  servings INT DEFAULT 4,
  difficulty ENUM('facil', 'medio', 'dificil') DEFAULT 'facil',
  region VARCHAR(100),
  estimated_cost_mt DECIMAL(10,2) DEFAULT 0,
  image_url VARCHAR(500),
  is_ai_generated BOOLEAN DEFAULT FALSE,
  is_traditional BOOLEAN DEFAULT TRUE,
  calories DECIMAL(8,2) DEFAULT 0,
  protein DECIMAL(8,2) DEFAULT 0,
  carbs DECIMAL(8,2) DEFAULT 0,
  fat DECIMAL(8,2) DEFAULT 0,
  fiber DECIMAL(8,2) DEFAULT 0,
  iron DECIMAL(8,2) DEFAULT 0,
  vitamin_a DECIMAL(8,2) DEFAULT 0,
  vitamin_c DECIMAL(8,2) DEFAULT 0,
  tags JSON,
  min_plan VARCHAR(20) DEFAULT 'free',
  is_regional_exclusive BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Recipe ingredients (many-to-many)
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recipe_id INT NOT NULL,
  ingredient_id INT,
  ingredient_name VARCHAR(100),
  quantity VARCHAR(50),
  unit VARCHAR(30),
  is_optional BOOLEAN DEFAULT FALSE,
  substitute VARCHAR(200),
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Meal plans
CREATE TABLE IF NOT EXISTS meal_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  total_cost_mt DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Meal plan items
CREATE TABLE IF NOT EXISTS meal_plan_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  meal_plan_id INT NOT NULL,
  recipe_id INT,
  day_of_week ENUM('segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo') NOT NULL,
  meal_type ENUM('pequeno_almoco', 'almoco', 'jantar', 'lanche') NOT NULL,
  custom_meal VARCHAR(200),
  notes TEXT,
  FOREIGN KEY (meal_plan_id) REFERENCES meal_plans(id) ON DELETE CASCADE,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Shopping lists
CREATE TABLE IF NOT EXISTS shopping_lists (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  meal_plan_id INT,
  title VARCHAR(200) DEFAULT 'Lista de Compras',
  total_estimated_cost_mt DECIMAL(10,2) DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (meal_plan_id) REFERENCES meal_plans(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Shopping list items
CREATE TABLE IF NOT EXISTS shopping_list_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  shopping_list_id INT NOT NULL,
  ingredient_id INT,
  item_name VARCHAR(100) NOT NULL,
  quantity VARCHAR(50),
  unit VARCHAR(30),
  estimated_price_mt DECIMAL(10,2) DEFAULT 0,
  is_purchased BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (shopping_list_id) REFERENCES shopping_lists(id) ON DELETE CASCADE,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Nutrition tracking
CREATE TABLE IF NOT EXISTS nutrition_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  recipe_id INT,
  meal_type ENUM('pequeno_almoco', 'almoco', 'jantar', 'lanche') NOT NULL,
  log_date DATE NOT NULL,
  calories DECIMAL(8,2) DEFAULT 0,
  protein DECIMAL(8,2) DEFAULT 0,
  carbs DECIMAL(8,2) DEFAULT 0,
  fat DECIMAL(8,2) DEFAULT 0,
  fiber DECIMAL(8,2) DEFAULT 0,
  iron DECIMAL(8,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Seed: Common Mozambican Ingredients
-- ============================================

INSERT INTO ingredients (name, name_local, category, emoji, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, iron_per_100g, avg_price_mt) VALUES
('Tomate', 'Tomate', 'vegetal', '🍅', 18, 0.9, 3.9, 0.2, 1.2, 0.3, 25),
('Cebola', 'Cebola', 'vegetal', '🧅', 40, 1.1, 9.3, 0.1, 1.7, 0.2, 20),
('Milho', 'Milho', 'grao', '🌽', 86, 3.3, 19, 1.4, 2.7, 0.5, 30),
('Couve', 'Couve', 'vegetal', '🥬', 35, 2.8, 5.6, 0.6, 3.6, 1.5, 15),
('Batata', 'Batata', 'vegetal', '🥔', 77, 2.0, 17, 0.1, 2.2, 0.8, 35),
('Arroz', 'Arroz', 'grao', '🍚', 130, 2.7, 28, 0.3, 0.4, 0.2, 60),
('Peixe Seco', 'Peixe Seco', 'proteina', '🐟', 290, 62, 0, 3.5, 0, 2.8, 150),
('Feijão', 'Feijão', 'grao', '🫘', 127, 8.7, 22.8, 0.5, 7.4, 2.1, 45),
('Coco', 'Coco', 'fruta', '🥥', 354, 3.3, 15, 33, 9, 2.4, 20),
('Banana', 'Banana', 'fruta', '🍌', 89, 1.1, 23, 0.3, 2.6, 0.3, 10),
('Mandioca', 'Mandioca', 'vegetal', '🍠', 160, 1.4, 38, 0.3, 1.8, 0.3, 25),
('Alho', 'Alho', 'tempero', '🧄', 149, 6.4, 33, 0.5, 2.1, 1.7, 30),
('Pimentão', 'Pimentão', 'vegetal', '🫑', 20, 0.9, 4.6, 0.2, 1.7, 0.3, 25),
('Amendoim', 'Amendoim', 'grao', '🥜', 567, 25.8, 16, 49, 8.5, 4.6, 50),
('Frango', 'Frango', 'proteina', '🍗', 239, 27, 0, 14, 0, 1.3, 200),
('Ovo', 'Ovo', 'proteina', '🥚', 155, 13, 1.1, 11, 0, 1.8, 15),
('Limão', 'Limão', 'fruta', '🍋', 29, 1.1, 9.3, 0.3, 2.8, 0.6, 5),
('Piri-piri', 'Piri-piri', 'tempero', '🌶️', 40, 1.9, 8.8, 0.4, 1.5, 1.0, 10),
('Camarão', 'Camarão', 'proteina', '🦐', 85, 20, 0.2, 0.5, 0, 2.4, 350),
('Abóbora', 'Abóbora', 'vegetal', '🎃', 26, 1.0, 6.5, 0.1, 0.5, 0.8, 20),
('Folha de Mandioca', 'Matapa', 'vegetal', '🌿', 91, 6.8, 13, 1.0, 5.0, 3.6, 15),
('Leite de Coco', 'Leite de Coco', 'lacteo', '🥛', 197, 2.0, 2.8, 21, 0, 1.6, 40),
('Peixe Fresco', 'Peixe Fresco', 'proteina', '🐠', 82, 18, 0, 0.7, 0, 0.4, 180),
('Batata Doce', 'Batata Doce', 'vegetal', '🍠', 86, 1.6, 20, 0.1, 3.0, 0.6, 25),
('Quiabo', 'Quiabo', 'vegetal', '🟢', 33, 1.9, 7.5, 0.2, 3.2, 0.6, 20);

-- User favorites
CREATE TABLE IF NOT EXISTS user_favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  recipe_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_favorite (user_id, recipe_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Password reset codes
CREATE TABLE IF NOT EXISTS password_reset_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  email VARCHAR(150) NOT NULL,
  code_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  used TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Weekly challenges
CREATE TABLE IF NOT EXISTS challenges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  type ENUM('scan_count','meal_plan_created','favorites_added') NOT NULL,
  target_value INT NOT NULL DEFAULT 1,
  reward_text VARCHAR(200),
  min_plan VARCHAR(20) DEFAULT 'free',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_challenges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  challenge_id INT NOT NULL,
  progress INT DEFAULT 0,
  completed_at DATETIME DEFAULT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_challenge (user_id, challenge_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Seed: Traditional Mozambican Recipes
-- ============================================

INSERT INTO recipes (title, description, instructions, prep_time_min, cook_time_min, servings, difficulty, region, estimated_cost_mt, image_url, is_traditional, calories, protein, carbs, fat, fiber, iron, tags) VALUES
('Matapa', 'Prato tradicional moçambicano feito com folhas de mandioca, amendoim e leite de coco.', '1. Cozinhe as folhas de mandioca até ficarem macias (cerca de 30 min).\n2. Escorra e pique finamente.\n3. Moa o amendoim até formar uma pasta.\n4. Em uma panela, refogue cebola e alho.\n5. Adicione as folhas de mandioca, pasta de amendoim e leite de coco.\n6. Cozinhe em fogo baixo por 20 minutos.\n7. Tempere com sal e piri-piri a gosto.\n8. Sirva com arroz branco ou xima.', 20, 50, 6, 'medio', 'Maputo', 150, 'https://theafrikanstore.com/wp-content/uploads/2021/04/Matapa.jpg', TRUE, 280, 12, 18, 20, 6, 4.2, '["tradicional","proteina","vegetariano"]'),

('Xiguinha', 'Prato típico do sul de Moçambique feito com quiabo cozido.', '1. Lave e corte o quiabo em rodelas.\n2. Refogue cebola e tomate.\n3. Adicione o quiabo e cozinhe por 15 minutos.\n4. Adicione amendoim moído e leite de coco.\n5. Cozinhe até engrossar.\n6. Tempere com sal e piri-piri.\n7. Sirva com arroz ou xima.', 15, 30, 4, 'facil', 'Gaza', 80, 'https://mmo.co.mz/wp-content/uploads/2014/11/Xiguinha.jpg', TRUE, 180, 8, 15, 10, 5, 2.5, '["tradicional","vegetariano","economico"]'),

('Caril de Frango Moçambicano', 'Caril aromático com frango e leite de coco, preparado ao estilo moçambicano.', '1. Tempere o frango com alho, limão e sal.\n2. Frite o frango até dourar.\n3. Reserve e refogue cebola e tomate.\n4. Adicione o frango de volta à panela.\n5. Junte o leite de coco e piri-piri.\n6. Cozinhe em fogo baixo por 30 minutos.\n7. Sirva com arroz e salada.', 20, 40, 4, 'medio', 'Sofala', 350, 'https://receitasemenus.net/wp-content/uploads/2018/11/caril-de-frango-a-mocambicana.jpg', TRUE, 420, 35, 8, 28, 2, 3.0, '["tradicional","proteina","carne"]'),

('Arroz com Feijão Nutritivo', 'Combinação clássica com alto valor proteico, feita com temperos locais.', '1. Cozinhe o feijão até ficar macio.\n2. Em outra panela, refogue cebola e tomate.\n3. Adicione o arroz e cozinhe com água.\n4. Quando o arroz estiver quase pronto, junte o feijão.\n5. Misture bem e tempere.\n6. Sirva quente.', 10, 40, 4, 'facil', 'Nacional', 100, 'https://t1.rg.ltmcdn.com/pt/posts/5/6/2/arroz_com_feijao_preto_simples_e_rapido_9265_600.jpg', TRUE, 310, 14, 55, 2, 8, 3.5, '["economico","proteina","basico"]'),

('Peixe Grelhado com Molho de Coco', 'Peixe fresco grelhado servido com um molho cremoso de coco e limão.', '1. Tempere o peixe com alho, limão e sal.\n2. Grelhe o peixe até dourar dos dois lados.\n3. Para o molho: refogue cebola e tomate.\n4. Adicione leite de coco e deixe reduzir.\n5. Finalize com suco de limão e piri-piri.\n6. Sirva o peixe com o molho por cima e arroz.', 15, 25, 4, 'facil', 'Inhambane', 280, 'https://img.itdg.com.br/tdg/assets/default/recipe_original/recipe_30302_original.jpg', TRUE, 250, 30, 5, 12, 1, 2.0, '["tradicional","proteina","peixe"]'),

('Puré de Mandioca', 'Puré cremoso feito com mandioca cozida, perfeito como acompanhamento.', '1. Descasque e corte a mandioca em pedaços.\n2. Cozinhe em água com sal até ficar muito macia.\n3. Escorra e amasse bem.\n4. Adicione uma colher de manteiga e um pouco de leite de coco.\n5. Misture até ficar cremoso.\n6. Sirva como acompanhamento.', 10, 30, 4, 'facil', 'Nacional', 60, 'https://img.itdg.com.br/tdg/assets/default/recipe_original/recipe_25154_original.jpg', TRUE, 200, 2, 45, 3, 2, 0.5, '["economico","basico","acompanhamento"]'),

('Salada de Couve Moçambicana', 'Salada fresca e nutritiva com couve, tomate e limão.', '1. Lave e corte a couve em tiras finas.\n2. Corte o tomate em cubos.\n3. Pique a cebola finamente.\n4. Misture tudo em uma tigela.\n5. Tempere com limão, sal e um fio de azeite.\n6. Sirva fresca.', 10, 0, 4, 'facil', 'Nacional', 40, 'https://www.receitadevovo.com.br/static/img/receitas/salada-de-couve-simples.jpg', TRUE, 60, 3, 8, 2, 4, 1.8, '["saudavel","rapido","vegetariano","economico"]'),

('Caril Simples de Legumes', 'Caril vegetariano com legumes da época em molho de coco.', '1. Corte batata, abóbora, cenoura e couve em pedaços.\n2. Refogue cebola e alho.\n3. Adicione os legumes mais duros primeiro (batata, abóbora).\n4. Junte o leite de coco e cozinhe.\n5. Adicione a couve por último.\n6. Tempere com caril, sal e piri-piri.\n7. Sirva com arroz.', 15, 35, 4, 'facil', 'Zambézia', 120, 'https://t2.rg.ltmcdn.com/pt/posts/9/2/7/caril_de_legumes_com_leite_de_coco_e_curcuma_8729_600.jpg', TRUE, 220, 5, 30, 10, 6, 2.0, '["vegetariano","saudavel","economico"]');
