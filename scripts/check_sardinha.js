const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function checkSardinha() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    const [rows] = await pool.query('SELECT title, image_url FROM recipes WHERE title LIKE "%Sardinha%"');
    console.log('--- Sardinha recipes ---');
    console.log(rows);
    process.exit(0);
}

checkSardinha();
