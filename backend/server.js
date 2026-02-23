process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// 🚨 هام جداً: تأكد من إضافة .js في نهاية كل ملف محلي
import pool from './db.js'; 
import authRoutes from './routes/auth.js';
import carRoutes from './routes/cars.js';
import adminRoutes from './routes/admin.js';
import notificationRoutes from './routes/notifications.js';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// الروابط
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => res.send('🚗 السيرفر يعمل بنجاح على Vercel!'));

// 🚨 تعديل هام لـ Vercel: لا تشغل app.listen إلا في بيئة التطوير المحلية
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
}

// ✅ هذا هو السطر الذي يحتاجه Vercel لكي لا ينهار
export default app;
