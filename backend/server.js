process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // السطر المنقذ من أخطاء الشهادات
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import xss from 'xss-clean';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// استيراد الروابط (تأكد من وجود .js)
import carRoutes from './routes/cars.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import notificationRoutes from './routes/notifications.js';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🛡️ Middlewares
app.use(cors({ origin: '*' })); // السماح لموقعك بالوصول
app.use(helmet({ contentSecurityPolicy: false })); 
app.use(xss());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// الملفات الثابتة
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🚀 تفعيل المسارات (Routes)
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// مسار تجريبي
app.get('/', (req, res) => {
    res.json({ message: "✅ سيرفر سوق السيارات يعمل بنجاح ومحمي بسحاب Vercel!" });
});

// ✅ تصدير التطبيق لـ Vercel
export default app;


