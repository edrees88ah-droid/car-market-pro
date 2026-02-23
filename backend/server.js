// 1. إعدادات البيئة والأمان الأساسية
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // لتجاوز مشاكل SSL مع Aiven

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import xss from 'xss-clean';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// تحميل متغيرات البيئة من ملف .env
dotenv.config();

// 2. استيراد الروابط (تأكد من وجود الامتداد .js)
import carRoutes from './routes/cars.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import notificationRoutes from './routes/notifications.js';
import pool from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 3. اختبار قاعدة البيانات (يظهر في Logs الخاصة بـ Vercel)
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ خطأ في الاتصال بقاعدة البيانات السحابية:', err.message);
    } else {
        console.log('✅ قاعدة البيانات السحابية متصلة وجاهزة للعمل 🐘💯');
    }
});

// 4. إعدادات الحماية والـ CORS
// ملاحظة: origin: '*' تسمح للفرونت إند بالاتصال من أي مكان في المرحلة التجريبية
app.use(cors({ origin: '*' }));
app.use(helmet({ 
    contentSecurityPolicy: false, // لضمان عدم حظر عرض الصور
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(xss());

// 5. تحليل البيانات (Body Parser)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 6. الملفات الثابتة (الصور المرفوعة مع الكود)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 7. تفعيل الروابط (Routes)
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// 8. مسارات تجريبية للتأكد من عمل السيرفر بعد الرفع
app.get('/', (req, res) => res.send('🚗 سيرفر سوق السيارات يعمل بنجاح على Vercel!'));
app.get('/api/test-server', (req, res) => res.send("السيرفر السحابي يراك والمسار سليم!"));

// 9. معالجة الروابط غير الموجودة (404)
app.use((req, res) => {
    console.log(`⚠️ طلب مسار غير موجود: ${req.originalUrl}`);
    res.status(404).json({ error: "عذراً.. هذا المسار غير موجود في السيرفر" });
});

// 10. إعدادات التشغيل لـ Vercel
const PORT = process.env.PORT || 5000;

// يعمل Listen فقط في جهازك المحلي، أما Vercel فيستخدم التصدير تلقائياً
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 السيرفر يعمل محلياً على البورت: ${PORT}`);
    });
}

// ✅ التصدير ضروري لـ Vercel
export default app;
