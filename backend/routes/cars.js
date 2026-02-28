import express from 'express';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';
import pool from '../db.js';
import verifyToken from '../middleware/authMiddleware.js';

const router = express.Router();

// --- 1. إعداد ملتر لتخزين الصور مؤقتاً في الذاكرة (Memory Storage) ---
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // حد 5 ميجا للصورة
});

// --- 2. دالة إرسال الصورة إلى ImgBB وأخذ الرابط ---
const uploadToImgBB = async (fileBuffer) => {
    try {
        const form = new FormData();
        // نرسل الصورة بصيغة Base64 كما تطلب API الخاص بـ ImgBB
        form.append('image', fileBuffer.toString('base64'));
        
        // جلب المفتاح من إعدادات Vercel
        const apiKey = process.env.IMGBB_API_KEY; 

        const response = await axios.post(`https://api.imgbb.com/1/upload?key=${apiKey}`, form, {
            headers: { ...form.getHeaders() }
        });

        return response.data.data.url; // يعيد رابط الصورة النهائي (https://...)
    } catch (error) {
        console.error("خطأ في رفع الصورة لـ ImgBB:", error.response?.data || error.message);
        throw new Error("فشل الرفع إلى ImgBB");
    }
};

// ==========================================
// 🚀 مسار إضافة سيارة جديدة (الرفع لـ ImgBB)
// ==========================================
router.post('/add', verifyToken, upload.array('images', 10), async (req, res) => {
    const client = await pool.connect();
    try {
        const { brand, model, year, price, mileage, description, fuel_type, transmission, currency, lat, lng } = req.body;
        const userId = req.user.id;

        await client.query('BEGIN');

        // أ- حفظ بيانات السيارة في PostgreSQL
        const carRes = await client.query(
            `INSERT INTO cars (brand, model, year, price, mileage, description, fuel_type, transmission, currency, lat, lng, user_id, status) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'pending') RETURNING id`,
            [brand, model, year, price, mileage, description, fuel_type, transmission, currency, lat, lng, userId]
        );
        const carId = carRes.rows[0].id;

        // ب- رفع الصور إلى ImgBB وحفظ روابطها الـ HTTPS 🔥
        if (req.files && req.files.length > 0) {
            const imageQuery = "INSERT INTO car_images (car_id, image_path) VALUES ($1, $2)";
            
            for (let file of req.files) {
                // نرفع كل صورة للسحاب وننتظر الرابط
                const remoteUrl = await uploadToImgBB(file.buffer);
                await client.query(imageQuery, [carId, remoteUrl]);
            }
        }

        // ج- تنبيه المدير (تلقائي)
        const adminRes = await client.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
        if (adminRes.rows.length > 0) {
            await client.query(
                "INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)",
                [adminRes.rows[0].id, "🆕 إعلان جديد", `سيارة ${brand} ${model} تنتظر المراجعة.`]
            );
        }

        await client.query('COMMIT');
        res.status(201).json({ message: "تم نشر الإعلان ورفع الصور بنجاح! ✅", carId });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Critical Error:", err.message);
        res.status(500).json({ error: "حدث خطأ أثناء المعالجة السحابية" });
    } finally {
        client.release();
    }
});
// ==========================================
// 🌍 المسارات العامة (المعرض والتفاصيل)
// ==========================================

// جلب السيارات النشطة فقط للمعرض العامrouter.get('/all', async (req, res) => {
    try {
        const query = `
            SELECT c.*, (SELECT image_path FROM car_images WHERE car_id = c.id LIMIT 1) as main_image
            FROM cars c WHERE c.status = 'active' ORDER BY c.created_at DESC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});
/ ==========================================
// 🛠️ مسارات التحكم (تعديل، حذف، بيع)
// ==========================================

// جلب إعلانات المستخدم المسجل حالياً
router.get('/my-cars', verifyToken, async (req, res) => {
    try {
        const query = `
            SELECT c.*, (SELECT image_path FROM car_images WHERE car_id = c.id LIMIT 1) as main_image
            FROM cars c WHERE c.user_id = $1 ORDER BY c.created_at DESC
        `;
        const result = await pool.query(query, [req.user.id]);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});
// جلب تفاصيل سيارة واحدة مع صورها وبيانات المالك
router.get('/detail/:id', async (req, res) => {
    try {
        const { id } = req.params;
                // تحديث المشاهدات
        await pool.query("UPDATE cars SET views = COALESCE(views, 0) + 1 WHERE id = $1", [id]);
        const carQuery = `SELECT c.*, u.name as seller_name, u.phone as phone FROM cars c LEFT JOIN users u ON c.user_id = u.id WHERE c.id = $1`;
        const carRes = await pool.query(carQuery, [id]);
        if (carRes.rows.length === 0) return res.status(404).json({ error: "السيارة غير موجودة" });
        const imagesRes = await pool.query("SELECT image_path FROM car_images WHERE car_id = $1", [id]);
        res.json({ ...carRes.rows[0], images: imagesRes.rows });
    } catch (err) { res.status(500).json({ error: err.message }); }
});
// تعديل بيانات السيارة
router.put('/update/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { brand, model, year, price, mileage, description, fuel_type, transmission, currency } = req.body;
        const result = await pool.query(
            `UPDATE cars SET brand=$1, model=$2, year=$3, price=$4, mileage=$5, description=$6, fuel_type=$7, transmission=$8, currency=$9
             WHERE id=$10 AND user_id=$11`,
            [brand, model, year, price, mileage, description, fuel_type, transmission, currency, id, req.user.id]
        );
        res.json({ message: "تم التحديث بنجاح ✅" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// تحديد السيارة كمباعة (Sold) لإبراء الذمة
router.patch('/sold/:id', verifyToken, async (req, res) => {
    try {
        await pool.query("UPDATE cars SET status = 'sold' WHERE id = $1 AND user_id = $2", [req.params.id, req.user.id]);
        res.json({ message: "تم تحويل الحالة لمباعة بنجاح 🤝" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});
// حذف الإعلان نهائياً
router.delete('/delete/:id', verifyToken, async (req, res) => {
    try {
        await pool.query("DELETE FROM cars WHERE id = $1 AND user_id = $2", [req.params.id, req.user.id]);
        res.json({ message: "تم حذف الإعلان بنجاح 🗑️" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;

