process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import xss from 'xss-clean';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// استيراد الروابط (تأكد من وجود .js في النهاية)
import pool from './db.js'; 
import authRoutes from './routes/auth.js';
import carRoutes from './routes/cars.js';
import adminRoutes from './routes/admin.js';
import notificationRoutes from './routes/notifications.js';

dotenv.config();
console.log("🔗 رابط القاعدة في السيرفر هو:", process.env.DATABASE_URL ? "✅ موجود" : "❌ غير موجود");
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- 🛡️ إعدادات الحماية المتقدمة لـ Vercel ---
app.use(helmet({
    contentSecurityPolicy: false, // لضمان ظهور صور السيارات من أي مصدر
    crossOriginEmbedderPolicy: false
}));
app.use(xss()); // حماية ضد هجمات الـ XSS
app.use(cors({
    origin: '*', // يمكنك تغييره لرابط موقعك لاحقاً لزيادة الأمان
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// تحليل البيانات
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// الملفات الثابتة
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🚀 الروابط (Routes)
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// مسار تجريبي للتأكد من عمل السيرفر
app.get('/', (req, res) => {
    res.json({ message: "🚗 سيرفر سوق السيارات يعمل بنجاح ومحمي بسحاب Vercel!" });
});

// ✅ تصدير التطبيق لـ Vercel (أهم سطر)
export default app;

