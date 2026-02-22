process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import xss from 'xss-clean';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. استيراد الروابط (تأكد من وجود الملفات في مجلد routes)
import carRoutes from './routes/cars.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js'; // تم الإضافة ✅
import notificationRoutes from './routes/notifications.js'; // تم الإضافة ✅
import pool from './db.js';


const app = express();

// 2. اختبار قاعدة البيانات
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ خطأ في الاتصال بقاعدة البيانات السحابية:', err.message);
    } else {
        console.log('✅ قاعدة البيانات السحابية متصلة وجاهزة للعمل 🐘💯');
    }
});

// 5. الملفات الثابتة (الصور)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 3. إعدادات الحماية والـ CORS
app.use(cors({ origin: '*' }));
//app.use(cors({
   // origin: 'http://localhost:5173', 
   // methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
   // allowedHeaders: ['Content-Type', 'Authorization']
//}));
app.use(helmet({ contentSecurityPolicy: false })); 
app.use(xss());

// 4. تحليل البيانات (Body Parser)
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 5. الملفات الثابتة (الصور)
//app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 6. تفعيل الروابط (Routes)
app.use('/api/auth', authRoutes); 
app.use('/api/cars', carRoutes);
app.use('/api/admin', adminRoutes); // تفعيل رابط الإدارة ✅
app.use('/api/notifications', notificationRoutes); // تفعيل رابط الإشعارات ✅

// 7. مسارات تجريبية
app.get('/', (req, res) => res.send('🚗 سيرفر سوق السيارات يعمل بنجاح!'));
app.get('/test-server', (req, res) => res.send("السيرفر شغال والمسار سليم!"));

// 8. معالجة الروابط غير الموجودة (لتجنب 404)
app.use((req, res) => {
    console.log(`⚠️ تم طلب مسار غير موجود: ${req.originalUrl}`);
    res.status(404).json({ error: "عذراً.. هذا المسار غير موجود في السيرفر" });
});

const PORT = process.env.PORT || 5000;
// ... نهاية الأكواد السابقة ...

// ✅ التعديل المهم لـ Vercel
const PORT = process.env.PORT || 5000;

// لا تقم بحذف app.listen ولكن تأكد أن الملف يصدّر app
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 السيرفر يعمل على البورت: ${PORT}`);
    });
}

export default app; // 👈 هذا السطر هو الأهم لكي يفهم Vercel كيف يشغل السيرفر
