const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.MYSQLHOST || '127.0.0.1',
    user: process.env.MYSQLUSER || 'root',
    password: process.env.MYSQLPASSWORD || 'your_local_password',
    database: process.env.MYSQLDATABASE || 'railway',
    port: process.env.MYSQLPORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

async function setupDatabase() {
    let conn;
    try {
        console.log('✅ Attempting to connect to MySQL database...');
        conn = await pool.getConnection();

        const createTablesQueries = [
            `CREATE TABLE IF NOT EXISTS orders (
                id BIGINT PRIMARY KEY,
                order_number INT,
                total_price DECIMAL(10,2),
                currency VARCHAR(10),
                financial_status VARCHAR(50),
                created_at TIMESTAMP,
                customer_id BIGINT,
                payload JSON
            );`,
            `CREATE TABLE IF NOT EXISTS products (
                id BIGINT PRIMARY KEY,
                title VARCHAR(255),
                product_type VARCHAR(255),
                vendor VARCHAR(255),
                created_at TIMESTAMP,
                payload JSON
            );`,
            `CREATE TABLE IF NOT EXISTS customers (
                id BIGINT PRIMARY KEY,
                first_name VARCHAR(255),
                last_name VARCHAR(255),
                email VARCHAR(255),
                accepts_marketing BOOLEAN,
                created_at TIMESTAMP,
                password_hash VARCHAR(255),
                payload JSON
            );`,
            `CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );`,
        ];

        for (const query of createTablesQueries) {
            console.log(`Executing query: ${query}`);
            await conn.query(query);
        }

        console.log('✅ All tables are ready');
        console.log('✅ Successfully connected to MySQL database');
    } catch (err) {
        console.error('❌ Failed to connect to or set up MySQL database:', err);
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

module.exports = { setupDatabase, pool };