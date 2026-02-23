import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  // الرابط بيجي كامل من المتغيرات البيئية
  connectionString: process.env.DATABASE_URL,
  // التعديل السحري هنا:
  ssl: {
    rejectUnauthorized: false,
  },
});

// اختبار بسيط للاتصال
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ فشل الاتصال النهائي بالقاعدة:', err.message);
  } else {
    console.log('✅✅✅ مبروك! القاعدة اتصلت بالسيرفر بنجاح');
  }
});

export default pool;
