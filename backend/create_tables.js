// backend/create_tables.js
import pool from './db.js';

const createTables = async () => {
    const queryText = `
    -- 1. جدول السيارات
    CREATE TABLE IF NOT EXISTS cars (
        id SERIAL PRIMARY KEY,
        brand VARCHAR(100) NOT NULL,
        model VARCHAR(100) NOT NULL,
        year INT NOT NULL,
        price DECIMAL(12, 2) NOT NULL,
        mileage INT,
        fuel_type VARCHAR(50),
        transmission VARCHAR(50),
        description TEXT,
        image VARCHAR(255),
        status VARCHAR(20) DEFAULT 'pending',
        payment_verified INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- 2. جدول الإشعارات
    CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INT,
        title VARCHAR(255),
        message TEXT,
        is_read INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `;

    try {
        console.log("⏳ جاري إنشاء الجداول في Aiven...");
        await pool.query(queryText);
        console.log("✅ مبروك! تم إنشاء الجداول بنجاح.");
    } catch (err) {
        console.error("❌ خطأ أثناء إنشاء الجداول:", err);
    } finally {
        process.exit();
    }
};

createTables();