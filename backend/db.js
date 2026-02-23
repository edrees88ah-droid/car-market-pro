import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

// تفعيل قراءة ملفات الأسرار
dotenv.config();

/**
 * إعداد حوض الاتصال (Connection Pool) 
 * مصمم ليعمل بكفاءة على Vercel بدون أخطاء SSL
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    // هذا هو السطر الأهم لتجاوز خطأ الشهادة في Aiven السحابية
    rejectUnauthorized: false, 
  },
  // إعدادات احترافية لضمان عدم تعليق السيرفر
  max: 10,               // أقصى عدد اتصالات متزامنة
  idleTimeoutMillis: 30000, // وقت إغلاق الاتصال غير المستخدم
  connectionTimeoutMillis: 5000, // وقت انتظار الاتصال قبل إظهار خطأ
});

// مراقبة نجاح الاتصال في سجلات Vercel
pool.on('connect', () => {
  console.log('✅ [Database] تم الاتصال بنجاح بقاعدة البيانات السحابية');
});

// مراقبة الأخطاء المفاجئة لكي لا ينهار السيرفر (500 Error)
pool.on('error', (err) => {
  console.error('⚠️ [Database Error] خطأ مفاجئ في القاعدة:', err.message);
});

export default pool;
