import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// إعداد الاتصال بشكل احترافي لبيئة Serverless
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // تجاهل فحص الشهادة لضمان الاتصال بـ Aiven
    },
    max: 1, // مهم جداً في Vercel لعدم استهلاك اتصالات القاعدة السحابية
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000
});

// اختبار الاتصال الصامت لضمان عدم انهيار السيرفر
pool.on('error', (err) => {
    console.error('⚠️ خطأ مفاجئ في قاعدة البيانات:', err.message);
});

export default pool;
