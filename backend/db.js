import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // ده اللي بيخلي Aiven يقبل اتصال Vercel و VS Code
  }
});

// اختبار الاتصال مع طباعة الخطأ لو حصل
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ خطأ في الاتصال بالقاعدة:', err.message);
  } else {
    console.log('✅✅✅ السيرفر اتصل بنجاح بقاعدة البيانات السحابية');
  }
});

export default pool;
