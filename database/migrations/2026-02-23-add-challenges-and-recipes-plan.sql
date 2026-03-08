-- Add plan gating + challenges
ALTER TABLE recipes
  ADD COLUMN min_plan VARCHAR(20) DEFAULT 'free',
  ADD COLUMN is_regional_exclusive TINYINT(1) DEFAULT 0;

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
  is_active TINYINT(1) DEFAULT 1,
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

-- Seed example weekly challenges (optional)
INSERT INTO challenges (title, description, start_date, end_date, type, target_value, reward_text, min_plan)
VALUES
('Desafio da Semana: 3 Scans', 'Faça 3 scans esta semana e descubra novas receitas.', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 6 DAY), 'scan_count', 3, 'Ganha destaque no perfil', 'free'),
('Desafio da Semana: 2 Planos', 'Crie 2 planos semanais para organizar a sua rotina.', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 6 DAY), 'meal_plan_created', 2, 'Selo de organizacao', 'basic')
ON DUPLICATE KEY UPDATE title=title;
