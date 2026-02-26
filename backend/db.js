import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();
export default pool;
const pool = new Pool({
  // الرابط سيأتي من إعدادات Vercel
  connectionString: process.env.DATABASE_URL,
  // هذا الجزء هو "المفتاح" لحل مشكلة Aiven
  ssl: {
    rejectUnauthorized: false,
  },
  // تقليل عدد الاتصالات ليتناسب مع الخطة المجانية لـ Aiven
  max: 1 
});

pool.on('error', (err) => {
  console.error('⚠️ خطأ مفاجئ في القاعدة:', err.message);
});

export default pool;


