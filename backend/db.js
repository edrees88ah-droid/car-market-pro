import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();
const pool = new Pool({
  // سيقوم السيرفر بقراءة الرابط من ملف خارجي أو من إعدادات Render
  connectionString: process.env.DATABASE_URL, 
  ssl: {
    rejectUnauthorized: false
  }
});
// اختبار الاتصال فوراً
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ خطأ في الاتصال:', err.message);
    // إذا ظهر خطأ، اطبع التفاصيل كاملة لنعرف السبب
    console.log('التفاصيل:', err);
  } else {
    console.log('✅✅✅ you have successfully 🐘💯 connected to the Cloud data base ! تم الاتصال بنجاح بقاعدة البيانات السحابية');
    release();
  }
});

export default pool;