const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const initDB = async () => {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
    charset: 'utf8mb4'
  });

  try {
    console.log('--- Iniciando inicialização do banco de dados ---');
    const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');
    let schema = fs.readFileSync(schemaPath, 'utf8');

    // Remove comments and split by semicolon (carefully)
    // Actually, since we enabled multipleStatements, we can just run it
    // But we need to make sure the database exists first.
    
    const connection = await pool.getConnection();
    console.log('Conectado ao MySQL.');

    // Separate the CREATE DATABASE from the rest if needed, 
    // but schema.sql already has CREATE DATABASE IF NOT EXISTS
    
    console.log('Executando schema.sql...');
    await connection.query(schema);
    console.log('Schema executado com sucesso.');

    // Add missing columns to 'users' table if it already existed
    const [userColumns] = await connection.query("SHOW COLUMNS FROM users");
    const columnNames = userColumns.map(c => c.Field);
    
    if (!columnNames.includes('scan_count')) {
      console.log('Adicionando coluna scan_count à tabela users...');
      await connection.query("ALTER TABLE users ADD COLUMN scan_count INT DEFAULT 0 AFTER free_scan_used");
    }
    if (!columnNames.includes('last_scan_date')) {
      console.log('Adicionando coluna last_scan_date à tabela users...');
      await connection.query("ALTER TABLE users ADD COLUMN last_scan_date DATE DEFAULT NULL AFTER scan_count");
    }
    if (!columnNames.includes('role')) {
      console.log('Adicionando coluna role à tabela users...');
      await connection.query("ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user' AFTER plan");
    }
    if (!columnNames.includes('free_scan_used')) {
      console.log('Adicionando coluna free_scan_used à tabela users...');
      await connection.query("ALTER TABLE users ADD COLUMN free_scan_used TINYINT(1) DEFAULT 0 AFTER role");
    }

    // Add missing columns to 'recipes' table
    const [recipeColumns] = await connection.query("SHOW COLUMNS FROM recipes");
    const recipeColumnNames = recipeColumns.map(c => c.Field);
    if (!recipeColumnNames.includes('min_plan')) {
      console.log('Adicionando coluna min_plan à tabela recipes...');
      await connection.query("ALTER TABLE recipes ADD COLUMN min_plan VARCHAR(20) DEFAULT 'free'");
    }
    if (!recipeColumnNames.includes('is_regional_exclusive')) {
      console.log('Adicionando coluna is_regional_exclusive à tabela recipes...');
      await connection.query("ALTER TABLE recipes ADD COLUMN is_regional_exclusive TINYINT(1) DEFAULT 0");
    }

    // Check migrations
    const migrationsDir = path.join(__dirname, '..', '..', 'database', 'migrations');
    if (fs.existsSync(migrationsDir)) {
      const files = fs.readdirSync(migrationsDir).sort();
      for (const file of files) {
        if (file.endsWith('.sql')) {
          console.log(`Executando migração: ${file}...`);
          const migration = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
          try {
            await connection.query(migration);
            console.log(`Migração ${file} executada.`);
          } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME' || err.code === 'ER_TABLE_EXISTS_ERROR' || err.code === 'ER_DUP_KEYNAME') {
              console.log(`Migração ${file} já aplicada ou parcial (ignorando erro de duplicidade).`);
            } else {
              console.error(`Erro na migração ${file}:`, err.message);
            }
          }
        }
      }
    }

    connection.release();
    console.log('--- Inicialização concluída ---');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    process.exit(1);
  }
};

initDB();
